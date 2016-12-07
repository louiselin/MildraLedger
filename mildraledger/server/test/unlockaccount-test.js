#!/usr/bin/env node

var Web3 = require( 'web3' );
var web3 = new Web3( new Web3.providers.HttpProvider( "http://localhost:8545" ) );
var contractConfig = require( '../config/contract' );


console.log( contractConfig );
var ok = web3.personal.unlockAccount( contractConfig.rootAddress, contractConfig.rootAddressPassword, 600 );
console.log( ok );
