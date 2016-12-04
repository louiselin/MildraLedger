/* jshint esversion: 6 */

var contractConfig = require( './config/contract' );
var ContractManager = require( './app/contractmanager' );
var ContractLedger = require( './app/contractledger' );
var Web3 = require( 'web3' );

var events = require( 'events' );
var util = require( 'util' );

var web3 = new Web3( new Web3.providers.HttpProvider( "http://localhost:8545" ) );

var ledger = null;
var senderAddress = web3.eth.coinbase;

contractConfig.rootAddress = web3.eth.coinbase;
console.log( contractConfig );
var cm = new ContractManager( contractConfig, web3.eth.coinbase );
cm.compile();
cm.deploy();
var instance = {};
cm.on( 'deployed', function ( deployed ) {
    if ( deployed ) {
        console.log( 'deployed' );
        cm.loadInstance();

    } else {
        console.log( 'not deployed' );
    }
} );

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
            console.log( 'txHash:', info.contractTxHash, 'txId:', JSON.stringify( info.txId ) );
            var balance = instance.getFastBalance();
            ledger.queryTransaction( txId );
        } );

        ledger.on( 'writeOffEntityAdded', function ( err, info ) {
            if ( err ) {
                console.log( err );
                return;
            }
            console.log(
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
                    'on transaction queryed',
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
                    'on writeoff queryed',
                    'writeoffId:', info.writeOffId,
                    'txId:', info.txId,
                    'timestamp:', info.timestamp,
                    'cashier:', info.cashier,
                    'amount:', info.amount,
                    'txType:', info.txType,
                    'writeOffHash:', info.writeOffHash );
            } );



        ledger.addTransaction( senderAddress, 1000, ContractLedger.TxIncome );
        ledger.addTransaction( senderAddress, 2000, ContractLedger.TxIncome );
        ledger.addTransaction( senderAddress, 3000, ContractLedger.TxIncome );
        ledger.addTransaction( senderAddress, 4000, ContractLedger.TxIncome );
        ledger.addTransaction( senderAddress, 5000, ContractLedger.TxExpenses );
        ledger.addWriteOffEntity( senderAddress, 2 );
        ledger.addWriteOffEntity( senderAddress, 4 );

        try {
            ledger.queryTransaction( 1111111111111111111230 );
        } catch ( err ) {
            console.log( 'Expected error: ', err );
        }

    } else {
        console.log( 'Failed to load contract.', contractAddress );
    }
} );
