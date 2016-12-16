#!/usr/bin/env node

/* jshint esversion: 6 */

var crypto = require( 'crypto' );
var events = require( 'events' );
var util = require( 'util' );


var createTxHash = function ( txId, timestamp, cashier, amount, txType ) {
    return crypto.createHash( 'sha256' ).update(
        txId.toString() +
        timestamp.toString() +
        cashier.toString() +
        amount.toString() +
        txType.toString() ).digest( 'hex' );
};

var createWriteOffHash = function ( writeOffId, txId, timestamp, senderAddress ) {
    return crypto.createHash( 'sha256' ).update(
        writeOffId.toString() +
        txId.toString() +
        timestamp.toString() +
        senderAddress.toString()
    ).digest( 'hex' );
};

// Transaction type
const TxIncome = 0;
const TxExpense = 1;


var Transaction = function () {
    this.txId = 0; // Transaction id in database. auto increment
    this.timestamp = 0; // Transaction creation timestamp in database
    this.cashier = ''; // Who created this transaction
    this.amount = 0;
    this.txType = 0;
    this.txHash = '';
};

var ContractLedger = function ( contract ) {
    var self = this;

    this.contract = contract;
    this.txCount = this.contract.getTransactionCount();
    this.writeOffCount = this.contract.getWriteOffCount();

    this.transactionEventWatcher = this.contract.TransactionAddedEvent( {} );
    this.transactionEventWatcher.watch( function ( err, data ) {
        self.emit( 'transactionAdded', err, {
            contractTxHash: data.transactionHash,
            txId: data.args.txId
        } );
    } );

    this.writeOffEventWatcher = this.contract.WriteOffAddedEvent( {} );
    this.writeOffEventWatcher.watch( function ( err, data ) {
        self.emit( 'writeOffEntityAdded', err, {
            contractTxHash: data.transactionHash,
            writeOffId: data.args.writeOffId,
            txId: data.args.txId
        } );
    } );
};

util.inherits( ContractLedger, events.EventEmitter );

ContractLedger.prototype.txObject = function ( senderAddress ) {
    return {
        from: senderAddress,
        gas: 4700000
    };
};

ContractLedger.prototype.addTransaction = function ( senderAddress, amount, txType ) {

    var self = this;
    var txId = this.nextTxId();
    var timestamp = Date.now();
    var txHash = createTxHash( txId, timestamp, senderAddress, amount, txType );

    console.log( 'In Contractledger.addTransaction', senderAddress, txId, timestamp, amount, txType, txHash );

    var data = this.contract.addTransaction(
        txId,
        timestamp,
        amount,
        txType,
        txHash,
        this.txObject( senderAddress ) );
};


ContractLedger.prototype.addIncomeTransaction = function ( senderAddress, amount ) {
    this.addTransaction( senderAddress, amount, TxIncome );
};


ContractLedger.prototype.addExpenseTransaction = function ( senderAddress, amount ) {
    this.addTransaction( senderAddress, amount, TxExpense );
};


ContractLedger.prototype.queryTransaction = function ( txId ) {
    var data = this.contract.queryTransaction( txId );
    this.emit( 'transactionQueryed', {
        txId: txId,
        timestamp: data[ 0 ],
        cashier: data[ 1 ],
        amount: data[ 2 ],
        txType: data[ 3 ],
        txHash: data[ 4 ]
    } );
};

ContractLedger.prototype.dumpTransactions = function ( beginTxId, endTxId, callback ) {
    // TODO
    // Dump transactions from database

};

ContractLedger.prototype.addWriteOffEntity = function ( senderAddress, txId ) {
    var self = this;
    var writeOffId = this.nextWriteOffId();
    var timestamp = Date.now();
    var writeOffHash = createWriteOffHash( writeOffId, txId, timestamp, senderAddress );

    console.log( 'In Contractledger.addWriteOffEntity',
        senderAddress,
        writeOffId,
        txId,
        timestamp,
        writeOffHash );

    this.contract.addWriteOffEntity(
        writeOffId,
        txId,
        timestamp,
        writeOffHash,
        this.txObject( senderAddress ) );
};

ContractLedger.prototype.queryWriteOffEntity = function ( writeOffId ) {
    var data = this.contract.queryWriteOffEntity( writeOffId );
    this.emit( 'writeOffEntityQueryed', {
        writeOffId: writeOffId,
        timestamp: data[ 0 ],
        cashier: data[ 1 ],
        amount: data[ 2 ],
        txId: data[ 3 ],
        txType: data[ 4 ],
        writeOffHash: data[ 5 ]
    } );
};

ContractLedger.prototype.nextTxId = function () {
    return this.txCount++;
};

ContractLedger.prototype.nextWriteOffId = function () {
    return this.writeOffCount++;
};

ContractLedger.prototype.getBalance = function () {
    return this.contract.getBalance();
};

ContractLedger.prototype.getFastBalance = function () {
    return this.contract.getFastBalance();
};

ContractLedger.prototype.getWriteOffCount = function () {
    return this.contract.getWriteOffCount();
};

ContractLedger.prototype.getTransactionCount = function () {
    return this.contract.getTransactionCount();
};

module.exports = ContractLedger;
module.exports.TxIncome = TxIncome;
module.exports.TxExpense = TxExpense;
