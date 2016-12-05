var mysql = require( 'mysql' );
var bcrypt = require( 'bcrypt-nodejs' );

var DataBaseManager = function ( dbconfig ) {
    this.dbconfig = dbconfig;
    this.connection = mysql.createConnection( dbconfig.connection );
    this.connection.query( 'USE ' + dbconfig.database );

};

DataBaseManager.prototype.addUser = function ( obj, callback ) {
    var insertQuery = 'INSERT INTO users (account, password, permission, ethAddress) values (?, ?, ?, ?);';
    this.connection.query( insertQuery, [ obj.account, obj.password, obj.permission, obj.ethAddress ], callback );
};


module.exports = DataBaseManager;
