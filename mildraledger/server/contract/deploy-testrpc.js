#!/usr/bin/env node

var Web3 = require( 'web3' );
var fs = require( 'fs' );
var contractConfig = require( '../config/contract-testrpc' );
var ContractManager = require( '../app/contractmanager' );

var web3 = new Web3( new Web3.providers.HttpProvider( "http://localhost:8545" ) );
contractConfig.rootAddress = web3.eth.coinbase;
console.log( contractConfig );

var cm = new ContractManager( contractConfig, web3.eth.coinbase );
cm.compile();
cm.deploy();
cm.on( 'deployed', function ( deployed ) {
    if ( deployed ) {
        console.log( 'deployed' );
        cm.loadInstance();

    } else {
        console.log( 'not deployed' );
    }
} );
