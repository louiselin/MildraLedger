/* jshint esversion: 6 */

var contractConfig = require( '../config/contract' );
var ContractManager = require( '../app/contractmanager' );
var ContractUserManager = require( '../app/contractusermanager' );
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
        var um = new ContractUserManager( instance, web3 );
        um.on( 'userAdded', function ( err, info ) {
            if ( err ) {
                console.log( err );
            } else {
                console.log( 'user added', info.ethAddress );
                um.changeUserPermission( senderAddress, info.ethAddress, 3 );
            }

        } );
        um.on( 'userRemoved', function ( err, info ) {
            if ( err ) {
                console.log( err );
            } else {
                console.log( 'user removed', info.ethAddress );
            }
        } );

        um.on( 'userActivated', function ( err, info ) {
            if ( err ) {
                console.log( err );
            } else {
                console.log( 'user activated', info.ethAddress );
                um.removeUser( senderAddress, info.ethAddress );
            }
        } );

        um.on( 'userDeactivated', function ( err, info ) {
            if ( err ) {
                console.log( err );
            } else {
                console.log( 'user deactivated', info.ethAddress );
                um.activateUser( senderAddress, info.ethAddress );
            }
        } );

        um.on( 'userPermissionChanged', function ( err, info ) {
            if ( err ) {
                console.log( err );
            } else {
                console.log( 'user permission changed:', info.ethAddress, ' new permission:', info.permission );
                um.getUserPermission( senderAddress, info.ethAddress );
            }
        } );

        um.on( 'userPermissionFetched', function ( err, info ) {
            if ( err ) {
                console.log( err );
            } else {
                console.log( 'Permission of ', info.ethAddress, ':', info.permission );
                um.deactivateUser( senderAddress, info.ethAddress );
            }
        } );

        um.on( 'containsUserEvent', function ( info ) {
            console.log( 'Contains user', info.contains );
        } );



        um.addUser( senderAddress, '12345', 4 );
    }
} );
