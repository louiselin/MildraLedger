/* jshint esversion: 6 */

var mysql = require( 'mysql' );
var bcrypt = require( 'bcrypt-nodejs' );
var events = require( 'events' );
var util = require( 'util' );

const TxIncome = 0;
const TxExpense = 1;

var DatabaseManager = function ( dbconfig ) {
    var self = this;
    this.dbconfig = dbconfig;
    this.connection = mysql.createConnection( dbconfig.connection );
    this.connection.query( 'USE ' + dbconfig.database );
    this.writeOffsTable = dbconfig.writeOffsTable;
    this.transactionsTable = dbconfig.transactionsTable;
    this.incomeTable = dbconfig.incomeTable;
    this.expenseTable = dbconfig.expenseTable;

    this.txCount = -1;
    this.writeOffCount = -1;
    this.ready = false;

    // this.query = this.connection.query;

    this.getWriteOffCount();
    this.getTransactionCount();

    var checkReady = function () {
        if ( self.txCount != -1 && self.writeOffCount != -1 ) {
            self.ready = true;
            self.emit( 'ready' );
        }
    };
    this.on( 'gotTxCount', checkReady );
    this.on( 'gotWriteOffCount', checkReady );

    this.connection.on( 'error', function ( err ) {
        console.log( 'db error', err );
        if ( err.code === 'PROTOCOL_CONNECTION_LOST' ) {
            self.handleDisconnect();
        } else {
            throw err;
        }
    } );
};

util.inherits( DatabaseManager, events.EventEmitter );

DatabaseManager.prototype.handleDisconnect = function () {
    var self = this;
    this.connection = mysql.createConnection( this.dbconfig.connection );
    this.connection.connect( function ( err ) {
        if ( err ) {
            console.log( 'error when connecting to db:', err );
            setTimeout( function () {
                self.handleDisconnect();
            }, 2000 );
        }
    } );

    this.connection.on( 'error', function ( err ) {
        console.log( 'db error', err );
        if ( err.code === 'PROTOCOL_CONNECTION_LOST' ) {
            self.handleDisconnect();
        } else {
            throw err;
        }
    } );
};

DatabaseManager.prototype.nextTxId = function () {
    return this.txCount++;
};

DatabaseManager.prototype.nextWriteOffId = function () {
    return this.writeOffCount++;
};

DatabaseManager.prototype.close = function () {
    this.connection.end();
};


DatabaseManager.prototype.addUser = function ( info, callback ) {
    var insertQuery = 'INSERT INTO users (account, password, permission) values (?, ?, ?)';
    this.connection.query( insertQuery, [ info.account, info.password, info.permission ], callback );
};

DatabaseManager.prototype.addUsers = function ( infos, callback ) {
    var insertQuery = 'INSERT INTO users (account, password, permission) values ?';
    var toInsert = [];
    infos.forEach( function ( info ) {
        toInsert.push( [
            info.account,
            info.password,
            info.permission
        ] );
    } );
    this.connection.query( insertQuery, [ toInsert ], callback );
};

DatabaseManager.prototype.removeUser = function ( userId, callback ) {
    var queryString = 'DELETE FROM users WHERE user_id = ?';
    this.connection.query( queryString, [ userId ], callback );
};

DatabaseManager.prototype.dumpUsers = function ( callback ) {
    this.connection.query( 'SELECT user_id, account, permission, eth_address, registration_time, last_login_time FROM users', callback );
};

DatabaseManager.prototype.changeUserPermission = function ( userId, permission, callback ) {
    var queryString = 'UPDATE users SET permission = ? WHERE user_id = ?';
    this.connection.query( queryString, [ permission, userId ], callback );
};


DatabaseManager.prototype.addTransaction = function ( info, callback ) {
    var insertString =
        'INSERT INTO transactions (tx_id, cashier_address, tx_type, amount, timestamp, description) values (?, ?, ?, ?, ?, ?)';
    this.connection.query( insertString, [
        info.txId,
        info.cashierAddress,
        info.txType,
        info.amount,
        info.timestamp,
        info.description
    ], callback );
};

DatabaseManager.prototype.addTransactions = function ( infos, callback ) {
    var queryString = 'INSERT INTO transactions (tx_id, tx_type, cashier_address, amount, timestamp, description) values ?';

    var values = [];
    infos.forEach( function ( info ) {
        values.push( [
            info.txId,
            info.txType,
            info.cashierAddress,
            info.amount,
            info.timestamp,
            info.description
        ] );
    } );
    this.connection.query( queryString, [ values ], callback );
};

DatabaseManager.prototype.queryTransaction = function ( txId, callback ) {
    var queryString = 'SELECT * FROM transactions WHERE tx_id = ?';
    this.connection.query( queryString, [ txId ], callback );
};

DatabaseManager.prototype.queryTransactions = function ( txIds, callback ) {
    var queryString = 'SELECT * FROM transactions WHERE tx_id IN (?)';
    this.connection.query( queryString, [ txIds ], callback );
};

DatabaseManager.prototype.addWriteOffEntity = function ( info, callback ) {
    var self = this;
    var queryString =
        'INSERT INTO writeoffs (writeoff_id, tx_id, cashier_address, description, timestamp) values (?, ?, ?, ?, ?)';
    this.connection.query( queryString, [ info.writeOffId, info.txId, info.cashierAddress, info.description, info.timestamp ],
        function ( err, result ) {
            if ( err ) {
                callback( err, result );
            } else {
                self.connection.query( 'UPDATE transactions SET valid = FALSE WHERE tx_id = ?', [ info.txId ], callback );
            }
        }
    );
};

DatabaseManager.prototype.addWriteOffEntities = function ( infos, callback ) {
    var self = this;
    var queryString =
        'INSERT INTO writeoffs (writeoff_id, tx_id, cashier_address, description, timestamp) values ?';

    var txIds = [];
    var values = [];
    infos.forEach( function ( info ) {
        values.push( [
            info.writeOffId,
            info.txId,
            info.cashierAddress,
            info.description,
            info.timestamp
        ] );
        txIds.push( info.txId );
    } );

    this.connection.query( queryString, [ values ], function ( err, result ) {
        if ( err ) {
            callback( err, result );
        } else {
            self.connection.query( 'UPDATE transactions SET valid = FALSE WHERE tx_id IN (?)', [ txIds ], callback );
        }
    } );
};

DatabaseManager.prototype.queryWriteOffEntity = function ( writeOffId, callback ) {
    var queryString =
        'SELECT * FROM writeoffs WHERE writeoff_id = ? ';
    this.connection.query( queryString, [ writeOffId ], callback );
};

DatabaseManager.prototype.queryWriteOffEntities = function ( ids, callback ) {
    var queryString =
        'SELECT * FROM writeoffs WHERE writeoff_id IN (?) ';
    this.connection.query( queryString, [ ids ], callback );
};

DatabaseManager.prototype.getBalance = function ( callback ) {
    var self = this;
    this.connection.query(
        'SELECT tx_type, amount FROM transactions WHERE tx_id NOT IN (SELECT tx_id FROM writeoffs)',
        function ( err, result ) {
            if ( err ) {
                callback( err, {
                    amount: -1
                } );
                return;
            }

            var amount = 0;
            result.forEach( function ( row ) {
                if ( row.tx_type === TxIncome ) {
                    amount += row.amount;
                } else if ( row.tx_type === TxExpense ) {
                    amount -= row.amount;
                }
            } );
            if ( callback !== undefined ) {
                callback( err, {
                    amount: amount
                } );
            }
        } );
};

DatabaseManager.prototype.dumpTransactions = function ( callback ) {
    this.connection.query( 'SELECT * from transactions', callback );
};

DatabaseManager.prototype.dumpWriteOffEntities = function ( callback ) {
    this.connection.query( 'SELECT * from writeoffs', callback );
};

DatabaseManager.prototype.getTransactionCount = function ( callback ) {
    var self = this;
    this.connection.query( 'SELECT COUNT(*) from transactions;', function ( err, result ) {
        self.txCount = result[ 0 ][ 'COUNT(*)' ];
        self.emit( 'gotTxCount' );
        if ( callback !== undefined ) {
            callback( err, {
                tx_count: self.txCount
            } );
        }
    } );
};

DatabaseManager.prototype.getWriteOffCount = function ( callback ) {
    var self = this;
    this.connection.query( 'SELECT COUNT(*) from writeoffs;', function ( err, result ) {
        self.writeOffCount = result[ 0 ][ 'COUNT(*)' ];
        self.emit( 'gotWriteOffCount' );
        if ( callback !== undefined ) {
            callback( err, {
                woff_count: self.writeOffCount
            } );
        }
    } );
};

module.exports = function ( dbconfig ) {
    return new DatabaseManager( dbconfig );
};
