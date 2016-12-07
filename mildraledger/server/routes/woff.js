#!/usr/bin/node env

var express = require( 'express' );
var router = express.Router();

router.get( '/', function ( req, res ) {
    res.render( 'woff.ejs', {
        title: 'writeoff editor page'

    } );
} );



module.exports = router;
