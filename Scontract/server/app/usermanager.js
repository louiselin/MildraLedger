/* jshint esversion: 6 */

var util = require( 'utils' );
var events = require( 'events' );
var bcrypt = require( 'bcrypt-nodejs' );

const CanModifyUser = 4;
const CanModifyLedger = 2;
const CanRead = 1;

const RootPermission = CanModifyUser | CanModifyLedger | CanRead;
const CashierPermission = CanModifyLedger | CanRead;
const UserPermission = CanRead;
const NoPermission = 0;

var UserAccount = function () {
    this.userId = 0;

    this.accountName = ' ';
    this.accountPassword = '';
    this.accountPasswordSalt = '';

    this.ethAddress = '';

    this.permission = NoPermission;
    this.registerTime = 0;
    this.lastLogin = 0;
};

var UserManager = function ( database, web3, contract ) {
    "use strict";
    this.web3 = web3;
    this.contract = contract;
    this.database = database;
};

util.inherits( UserManager, event.EventEmitter );


UserManager.portotype.getUser = function ( account ) {
    var user = new UserAccount();
    // TODO
    // this.database.getUser
    return user;
};


UserManger.prototype.getUserEthAddress = function ( userName ) {
    // TODO
};


UserManager.prototype.addUser = function ( account, password, permission, ethAddress ) {
    var user = new UserAccount();
    user.accountName = userName;
    user.password = bcrypt.hashSync( password, null, null );

    if ( ethAddress.length !== 0 ) {
        this.contract.registerUser( ethAddress, permission );
    }
    // TODO
};


UserManager.prototype.addUserIntoContract = function () {

};

UserManager.prototype.removeUser = function ( userId ) {
    this.contract.unregisterUser( getUserEthAddress( userId ) );

};

UserManger.prototype.activateUser = function ( userId ) {
    this.contract.activateUser( getUserEthAddress( userId ) );
};

UserManger.prototype.deactivateUser = function ( userId ) {
    var user = this.getUser( userId );
    if ( !user ) {
        this.emit( 'userDeactivated', false );
        return;
    }

    var address = user.ethAddress;
    var self = this;
    // TODO
    // this.contract.deactivateUser( address, function ( err, userId, address ) {
    //
    // } );
    // this.database.deactivateUser( userId );
    self.emit( 'userDeactivated', true );
};

UserManager.prototype.changeUserPermission = function ( userId, newPermission ) {
    // TODO
};

module.exports = UserManager;
