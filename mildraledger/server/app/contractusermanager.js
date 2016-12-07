/* jshint esversion: 6 */

var util = require( 'util' );
var events = require( 'events' );

var ContractUserManager = function ( contract, web3 ) {
    this.contract = contract;
    this.web3 = web3;
};

util.inherits( ContractUserManager, events.EventEmitter );

ContractUserManager.prototype.addUser = function ( senderAddress, ethAddress, permission ) {
    var gas = 300000;
    var hash = this.contract.registerUser( ethAddress, permission, {
        from: senderAddress,
        gas: gas
    } );
    var receipt = this.web3.eth.getTransactionReceipt( hash );
    this.emit( 'userAdded', gas != receipt.gasUsed ? null : new Error( 'Failed to add user: ' + ethAddress.toString() ), {
        ethAddress: ethAddress,
        permission: permission,
        txHash: hash
    } );
};

ContractUserManager.prototype.removeUser = function ( senderAddress, ethAddress ) {
    var gas = 300000;
    var hash = this.contract.unregisterUser( ethAddress, {
        from: senderAddress,
        gas: gas
    } );
    var receipt = this.web3.eth.getTransactionReceipt( hash );
    this.emit( 'userRemoved',
        gas != receipt.gasUsed ? null : new Error( 'Failed to unregister user: ' + ethAddress.toString() ), {
            ethAddress: ethAddress,
            txHash: hash
        } );
};

ContractUserManager.prototype.activateUser = function ( senderAddress, ethAddress ) {
    var gas = 300000;
    var hash = this.contract.activateUser( ethAddress, {
        from: senderAddress,
        gas: gas
    } );
    var receipt = this.web3.eth.getTransactionReceipt( hash );
    this.emit( 'userActivated', gas != receipt.gasUsed ? null : new Error( 'Failed to activate user: ' + ethAddress.toString() ), {
        ethAddress: ethAddress,
        txHash: hash
    } );
};

ContractUserManager.prototype.deactivateUser = function ( senderAddress, ethAddress ) {
    var gas = 300000;
    var hash = this.contract.deactivateUser( ethAddress, {
        from: senderAddress,
        gas: gas
    } );
    var receipt = this.web3.eth.getTransactionReceipt( hash );
    this.emit( 'userDeactivated', gas != receipt.gasUsed ? null : new Error( 'Failed to deactivate user: ' + ethAddress.toString() ), {
        ethAddress: ethAddress,
        txHash: hash
    } );
};

ContractUserManager.prototype.changeUserPermission = function ( senderAddress, ethAddress, permission ) {
    var gas = 300000;
    var hash = this.contract.changeUserPermission( ethAddress, permission, {
        from: senderAddress,
        gas: gas
    } );
    var receipt = this.web3.eth.getTransactionReceipt( hash );
    this.emit( 'userPermissionChanged', gas != receipt.gasUsed ? null : new Error( 'Failed to change permission of user: ' + ethAddress.toString() ), {
        ethAddress: ethAddress,
        permission: permission,
        txHash: hash
    } );
};

ContractUserManager.prototype.getUserPermission = function ( senderAddress, ethAddress ) {
    var gas = 300000;
    var data = this.contract.getUserPermission( ethAddress, {
        from: senderAddress,
        gas: gas
    } );
    console.log( 'in get user permission:', data );
    this.emit( 'userPermissionFetched', null, {
        ethAddress: ethAddress,
        permission: data.toNumber()
    } );
};



module.exports = ContractUserManager;
