#!/usr/bin/env node 

var Web3 = require('web3');
var fs = require('fs'); 

var web3 = new Web3( new Web3.providers.HttpProvider( "http://localhost:8545" ) );

var mildraledgerContract = web3.eth.contract(JSON.parse(String(fs.readFileSync('MildraLedger.abi'))));
var mildraledger = mildraledgerContract.new(
   {
        from: web3.eth.coinbase, 
        data: String(fs.readFileSync('MildraLedger.bin')),
        gas: '4700000'
   });



