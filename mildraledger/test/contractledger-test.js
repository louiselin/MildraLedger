/* jshint esversion: 6 */

var contractConfig = require( '../config/contract' );
var ContractManager = require( '../app/contractmanager' );
var ContractLedger = require( '../app/contractledger' );
var Web3 = require( 'web3' );

var events = require( 'events' );
var util = require( 'util' );

var web3 = new Web3( new Web3.providers.HttpProvider( "http://localhost:8545" ) );

var ledger = null;
var senderAddress = contractConfig.rootAddress;
var senderPassword = contractConfig.rootAddressPassword;

console.log( contractConfig );
var cm = new ContractManager( contractConfig );
var instance = {};
//
// cm.on( 'compiled', function () {
//     cm.deploy();
// } );
//
// cm.on( 'deployed', function ( deployed ) {
//     if ( deployed ) {
//         console.log( 'deployed' );
//         cm.loadInstance();
//
//     } else {
//         console.log( 'not deployed' );
//     }
// } );
//
// cm.compile();


cm.on( 'loaded', function ( loaded, contractAddress ) {
    if ( loaded ) {
        instance = cm.getInstance();
        console.log( 'Contract loaded, address: ' + contractAddress );
        ledger = new ContractLedger( instance );

        ledger.on( 'transactionAdded', function ( err, info ) {
            if ( err ) {
                console.log( err );
                return;
            }
            console.log(
                'On transaction added',
                'txHash:', info.contractTxHash,
                'txId:', JSON.stringify( info.txId ) );
            var balance = instance.getFastBalance();
            ledger.queryTransaction( info.txId );
        } );

        ledger.on( 'writeOffEntityAdded', function ( err, info ) {
            if ( err ) {
                console.log( err );
                return;
            }
            console.log(
                'On write-off entity added',
                'txHash:', info.contractTxHash,
                'writeOffId:', JSON.stringify( info.writeOffId ),
                'txId:', JSON.stringify( info.txId ) );
            var balance = instance.getFastBalance();
            console.log( 'balance', balance );
            ledger.queryWriteOffEntity( info.writeOffId );
        } );

        ledger.on( 'transactionQueryed',
            function ( info ) {

                console.log(
                    'On transaction queryed',
                    'txId:', info.txId,
                    'timestamp:', info.timestamp,
                    'cashier:', info.cashier,
                    'amount:', info.amount,
                    'txType:', info.txType,
                    'txHash:', info.txHash );
            } );

        ledger.on( 'writeOffEntityQueryed',
            function ( info ) {
                console.log(
                    'On writeoff queryed',
                    'writeoffId:', info.writeOffId,
                    'txId:', info.txId,
                    'timestamp:', info.timestamp,
                    'cashier:', info.cashier,
                    'amount:', info.amount,
                    'txType:', info.txType,
                    'writeOffHash:', info.writeOffHash );
            } );

        web3.personal.unlockAccount( senderAddress, senderPassword, 10 * 60 );
        ledger.addTransaction( senderAddress, 1000, ContractLedger.TxIncome );
        ledger.addTransaction( senderAddress, 2000, ContractLedger.TxIncome );
        ledger.addTransaction( senderAddress, 3000, ContractLedger.TxIncome );
        ledger.addTransaction( senderAddress, 4000, ContractLedger.TxIncome );
        ledger.addTransaction( senderAddress, 5000, ContractLedger.TxExpense );
        ledger.addWriteOffEntity( senderAddress, 2 );
        ledger.addWriteOffEntity( senderAddress, 4 );

        try {
            ledger.queryTransaction( 11111111 );
        } catch ( err ) {
            console.log( 'In try queryTransaction(11111111) Expected error: ', err );
        }

    } else {
        console.log( 'Failed to load contract.', contractAddress );
    }
} );


cm.loadInstance();
