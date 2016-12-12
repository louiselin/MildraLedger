#!/usr/bin/node env

/* jshint esversion: 6 */

var auth = require( '../app/auth' );
var express = require( 'express' );
var crypto = require( 'crypto' );
var events = require( 'events' );
var eventEmitter = require( '../app/eventemitter' );

var router = express.Router();

var createTxHash = function ( txId, timestamp, cashier, amount, txType, description ) {
    return crypto.createHash( 'sha256' ).update(
        txId.toString() +
        timestamp.toString() +
        cashier.toString() +
        amount.toString() +
        txType.toString() +
        description ).digest( 'hex' );
};

var createWriteOffHash = function ( writeOffId, txId, timestamp, cashier, description ) {
    return crypto.createHash( 'sha256' ).update(
        writeOffId.toString() +
        txId.toString() +
        timestamp.toString() +
        cashier.toString() + description
    ).digest( 'hex' );
};

var txObject = function ( senderAddress ) {
    return {
        from: senderAddress,
        gas: 4700000
    };
};

// Transaction type
const TxIncome = 0;
const TxExpense = 1;


function sendJSON( res, err, results ) {
    if ( err ) {
        res.writeHead( 500, {
            'Content-Type': 'x-application/json'
        } );
        res.end( JSON.stringify( {
            error: 'Internal error.'
        } ) );
    } else {
        res.writeHead( 200, {
            'Content-Type': 'x-application/json'
        } );
        console.log( results );
        res.end( JSON.stringify( results ) );
    }
}

module.exports = function ( db, contract ) {
    // router.get( '/txs', auth.checkPermission( auth.CanReadLedger ), function ( req, res, next ) {
    router.get( '/txs', function ( req, res, next ) {
        db.dumpTransactions( function ( err, results ) {
            sendJSON( res, err, results );
        } );
    } );

    router.get( '/contract_txs', function ( req, res ) {
        var len = contract.getTransactionCount();
        var data = null;
        var results = [];
        for ( var i = 1; i <= len; ++i ) {
            data = contract.queryTransaction( i );
            results.push( {
                tx_id: i,
                timestamp: data[ 0 ],
                cashier_address: data[ 1 ],
                amount: data[ 2 ],
                tx_type: data[ 3 ],
                tx_hash: data[ 4 ],
                valid: data[ 5 ]
            } );
        }

        res.json( results );
    } );

    router.get( '/tx/:id', function ( req, res, next ) {
        var id = req.params.id;
        db.queryTransaction( id, function ( err, results ) {
            sendJSON( res, err, results );
        } );
    } );

    router.get( '/contract_tx/:id', function ( req, res ) {
        var id = req.params.id;
        if ( id >= contract.getTransactionCount().toNumber() ) {
            res.status( 404 ).json( {
                error: 'no such record.'
            } );
            return;
        }

        contract.queryTransaction( id, function ( err, data ) {
            if ( !err ) {
                res.json( {
                    tx_id: id,
                    timestamp: data[ 0 ],
                    cashier_address: data[ 1 ],
                    amount: data[ 2 ],
                    tx_type: data[ 3 ],
                    tx_hash: data[ 4 ],
                    valid: data[ 5 ]
                } );
            } else {
                console.log( 'In try queryTransaction() Expected error: ', err );
                res.status( 500 ).json( err );
            }
        } );

    } );

    router.get( '/woffs', function ( req, res, next ) {
        db.dumpWriteOffEntities( function ( err, results ) {
            sendJSON( res, err, results );
        } );
    } );


    router.get( '/contract_woffs', function ( req, res ) {
        var len = contract.getWriteOffCount();
        var data = null;
        var results = [];
        for ( var i = 1; i <= len; ++i ) {
            data = contract.queryWriteOffEntity( i );
            results.push( {
                writeoff_Id: id,
                timestamp: data[ 0 ],
                cashier_address: data[ 1 ],
                amount: data[ 2 ],
                tx_id: data[ 3 ],
                tx_type: data[ 4 ],
                writeoff_hash: data[ 5 ]
            } );
        }

        res.json( results );
    } );

    router.get( '/woff/:id', function ( req, res, next ) {
        var id = req.params.id;
        db.queryWriteOffEntity( id, function ( err, results ) {
            sendJSON( res, err, results );
        } );
    } );

    router.get( '/contract_woff/:id', function ( req, res, next ) {
        var id = req.params.id;
        if ( id >= contract.getWriteOffCount().toNumber() ) {
            res.status( 404 ).json( {} );
            return;
        }

        contract.queryWriteOffEntity( id, function ( err, data ) {
            if ( !err ) {
                res.json( {
                    writeoff_Id: id,
                    timestamp: data[ 0 ],
                    cashier_address: data[ 1 ],
                    amount: data[ 2 ],
                    tx_id: data[ 3 ],
                    tx_type: data[ 4 ],
                    writeoff_hash: data[ 5 ]
                } );
            } else {
                res.status( 404 ).json( err );
            }

        } );
    } );

    router.post( '/tx/add', function ( req, res, next ) {
        var tx = req.body;
        var txId = contract.getTransactionCount();
        txId = txId.toNumber() + 1;
        var timestamp = Date.now();

        var txHash = createTxHash(
            txId,
            timestamp,
            tx.cashier_address,
            tx.amount,
            tx.tx_type,
            tx.description );

        console.log( 'RESTful API addTransaction',
            tx.cashier_address,
            "tx_id:", txId,
            timestamp,
            tx.amount,
            tx.tx_type,
            txHash
        );

        console.log( 'Try to add transaction into contract.' );
        contract.addTransaction(
            txId,
            timestamp,
            tx.amount,
            tx.tx_type,
            txHash,
            txObject( tx.cashier_address ),
            function ( err, hash ) {
                if ( err ) {
                    res.status( 500 ).json( err );
                } else {
                    eventEmitter.once( 'TransactionAddedEvent:' + txId,
                        function ( event ) {
                            console.log( 'Try to add transaction into database.' );
                            db.addTransaction( {
                                txId: txId,
                                cashierAddress: tx.cashier_address,
                                txType: tx.tx_type,
                                amount: tx.amount,
                                timestamp: timestamp,
                                description: tx.description
                            }, function ( err, result ) {
                                res.json( event );
                            } );
                        } );
                }
            } );

    } );


    router.post( '/woff/add', function ( req, res, next ) {
        var woff = req.body;
        if ( !contract.isTransactionValid( woff.tx_id, txObject( woff.cashier_address ) ) ) {
            res.status( 200 ).json( {} );
            return;
        }

        var writeOffId = contract.getWriteOffCount();
        writeOffId = writeOffId.toNumber() + 1;
        var timestamp = Date.now();

        var writeOffHash = createWriteOffHash(
            writeOffId,
            woff.tx_id,
            timestamp,
            woff.cashier_address,
            woff.description );


        console.log( 'RESTful API addWriteOffEntity',
            "cashier:", woff.cashier_address,
            "tx_id:", woff.tx_id,
            "timestamp:", timestamp,
            "woff hash", writeOffHash,
            "woff description", woff.description
        );

        console.log( 'Try to add write-off entity into contract.' );
        contract.addWriteOffEntity(
            writeOffId,
            woff.tx_id,
            timestamp,
            writeOffHash,
            txObject( woff.cashier_address ),
            function ( err, hash ) {
                if ( err ) {
                    res.status( 500 ).json( err );
                } else {
                    eventEmitter.once( 'WriteOffAddedEvent:' + writeOffId,
                        function ( event ) {
                            console.log( 'Try to add write-off entity into database.' );
                            db.addWriteOffEntity( {
                                writeOffId: writeOffId,
                                txId: woff.tx_id,
                                cashierAddress: woff.cashier_address,
                                description: woff.description,
                                timestamp: timestamp
                            }, function ( err, result ) {
                                if ( !err ) {
                                    res.json( event );
                                } else {
                                    res.status( 500 ).json( err );
                                }
                            } );
                        } );
                }
            } );

    } );

    router.get( '/users', function ( req, res, next ) {
        db.dumpUsers( function ( err, results ) {
            sendJSON( res, err, results );
        } );
    } );

    router.delete( '/user/:user_id', function ( req, res, next ) {
        var id = req.params.user_id;
        db.removeUser( id, function ( err, result ) {
            sendJSON( res, err, result );
        } );
    } );

    router.get( '/balance', function ( req, res, next ) {
        db.getBalance( function ( err, amount ) {
            sendJSON( res, err, amount );
        } );
    } );

    router.get( '/contract_balance', function ( req, res, next ) {
        contract.getBalance( function ( err, amount ) {
            sendJSON( res, err, {
                amount: amount.toNumber()
            } );
        } );
    } );

    router.get( '/tx_count', function ( req, res, next ) {
        db.getTransactionCount( function ( err, info ) {
            sendJSON( res, err, info );
        } );
    } );

    router.get( '/contract_tx_count', function ( req, res, next ) {
        contract.getTransactionCount( function ( err, count ) {
            sendJSON( res, err, {
                tx_count: count.toNumber()
            } );
        } );
    } );

    router.get( '/woff_count', function ( req, res, next ) {
        db.getWriteOffCount( function ( err, info ) {
            sendJSON( res, err, info );
        } );
    } );


    router.get( '/contract_woff_count', function ( req, res, next ) {
        contract.getWriteOffCount( function ( err, count ) {
            sendJSON( res, err, {
                woff_count: count.toNumber()
            } );
        } );
    } );

    router.delete( '/all', function ( req, res, next ) {
        console.log( 'Clearing contract.' );
        contract.clear( txObject( req.body.sender ),
            function ( err, hash ) {
                if ( err ) {
                    console.log( err );
                    res.status( 500 ).json( err );
                } else {
                    console.log( 'Contract has been cleared.' );
                    console.log( 'Clearing database.' );
                    db.connection.query( 'TRUNCATE TABLE users;',
                        function ( err, result ) {
                            if ( err ) {
                                console.log( err );
                                res.status( 500 ).json( err );
                            } else {
                                db.connection.query( 'SET FOREIGN_KEY_CHECKS = 0', function ( err, result ) {
                                    if ( err ) {
                                        consolo.log( err );
                                        res.status( 500 ).json( err );
                                    } else {
                                        db.connection.query( 'TRUNCATE TABLE writeoffs;', function ( err, result ) {
                                            if ( err ) {
                                                console.log( err );
                                                res.status( 500 ).json( err );
                                            } else {
                                                db.connection.query( 'TRUNCATE TABLE transactions;', function ( err, result ) {
                                                    if ( err ) {
                                                        console.log( err );
                                                        res.status( 500 ).json( err );
                                                    } else {
                                                        console.log( 'Database and contract has been cleared.' );
                                                        res.status( 202 ).json( {} );
                                                    }
                                                } );
                                            }
                                        } );
                                    }
                                } );
                            }
                        } );
                }
            } );
    } );

    return router;
};
