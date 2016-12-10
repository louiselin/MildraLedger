#!/usr/bin/node env

var auth = require( '../app/auth' );
var express = require( 'express' );
var router = express.Router();


function sendJSON( res, err, results ) {
    if ( err ) {
        res.writeHead( 500, {
            'Content-Type': 'x-application/json'
        } );
        res.end( JSON.stringify( {
            error: 'Internal error.'
        } ) );
    } else {
        res.writeHead( 200, {
            'Content-Type': 'x-application/json'
        } );
        res.end( JSON.stringify( results ) );
    }
}

module.exports = function ( db, contract ) {
    // router.get( '/txs', auth.checkPermission( auth.CanReadLedger ), function ( req, res, next ) {
    router.get( '/txs', function ( req, res, next ) {
        db.dumpTransactions( function ( err, results ) {
            sendJSON( res, err, results );
        } );
    } );

    router.get( '/woffs', function ( req, res, next ) {
        db.dumpWriteOffEntities( function ( err, results ) {
            sendJSON( res, err, results );
        } );
    } );

    router.get( '/users', function ( req, res, next ) {
        db.dumpUsers( function ( err, results ) {
            sendJSON( res, err, results );
        } );
    } );

    router.delete( '/user/:user_id', function ( req, res, next ) {
        var id = req.params.user_id;
        db.removeUser( id, function ( err, result ) {
            sendJSON( res, err, result );
        } );
    } );

    router.get( '/balance', function ( req, res, next ) {
        db.getBalance( function ( err, amount ) {
            sendJSON( res, err, amount );
        } );
    } );

    router.get( '/tx_count', function ( req, res, next ) {
        db.getTransactionCount( function ( err, info ) {
            sendJSON( res, err, info );
        } );
    } );

    router.get( '/woff_count', function ( req, res, next ) {
        db.getWriteOffCount( function ( err, info ) {
            sendJSON( res, err, info );
        } );
    } );

    return router;
};
