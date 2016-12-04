 /* jshint esversion: 6 */

 var Web3 = require( 'web3' );
 var fs = require( 'fs' );
 var solc = require( 'solc' );
 var events = require( 'events' );
 var util = require( 'util' );
 var sloc = require( 'solc' );
 var web3 = new Web3( new Web3.providers.HttpProvider( "http://localhost:8545" ) );

 var ContractManager = function ( contractConfig, userEthAddress ) {
     this.contractName = '';
     this.contractAddress = contractConfig.contractAddress;
     this.rootAddress = contractConfig.rootAddress;
     this.binaryCode = '';
     this.abiFile = contractConfig.abiFile;
     this.sourceFile = contractConfig.sourceFile;
     this.binaryFile = contractConfig.binaryFile;

     this.interface = JSON.parse( String( fs.readFileSync( this.abiFile ) ) );
     this.instance = {};
 };


 util.inherits( ContractManager, events.EventEmitter );

 ContractManager.prototype.compile = function ( sourceFile ) {
     var sourceCode = '';
     if ( sourceFile && sourceFile.length !== 0 ) {
         this.sourceFile = sourceFile;
     }
     console.log( this.sourceFile );
     sourceCode = String( fs.readFileSync( this.sourceFile ) );
     var output = solc.compile( sourceCode, 1 ); // 1 activates the optimiser
     for ( var contractName in output.contracts ) {
         // code and ABI that are needed by web3
         this.contractName = contractName;
         this.binaryCode = output.contracts[ contractName ].bytecode;
         this.interface = JSON.parse( output.contracts[ contractName ].interface );
     }

     this.emit( 'compiled' );
 };

 ContractManager.prototype.deploy = function () {
     if ( !this.interface || !this.rootAddress || !this.binaryCode ) {
         throw new Error( 'Failed to deploy smart contract.' );
     }
     var self = this;
     this.instance = web3.eth.contract( this.interface ).new( {
         from: this.rootAddress,
         data: this.binaryCode,
         gas: '4700000'
     }, function ( err, contract ) {
         if ( typeof contract.address !== 'undefined' ) {
             console.log( 'Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash );
             self.contractAddress = contract.address;
             self.emit( 'deployed', true );
         } else {
             self.emit( 'deployed', false );
         }
     } );
 };

 ContractManager.prototype.loadInstance = function () {
     var self = this;

     web3.eth.contract( this.interface ).at( this.contractAddress, function ( err, instance ) {
         if ( err ) {
             self.emit( 'loaded', false, self.contractAddress );
         } else {
             self.instance = instance;
             self.emit( 'loaded', true, self.contractAddress );
         }
     } );

 };

 ContractManager.prototype.getInterface = function () {
     return this.interface;
 };

 ContractManager.prototype.getInstance = function () {
     return this.instance;
 };



 module.exports = ContractManager;
