#!/usr/bin/node env


var express = require( 'express' );
var router = express.Router();

router.get( '/', function ( req, res ) {
    res.render( 'ledger.ejs', {
        user: req.user,
        title: 'ledger page'
    } );
} );

module.exports = router;
