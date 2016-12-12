#!/usr/bin/node env

var express = require( 'express' );
var router = express.Router();

router.get( '/', function ( req, res ) {
    res.render( 'ledgereditor.ejs', {
        user: req.user,
        title: 'ledger editor page'
    } );
} );



module.exports = router;
