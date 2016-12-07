#!/usr/bin/node env

var express = require( 'express' );
var router = express.Router();

router.get( '/', function ( req, res ) {
    res.render( 'main.ejs', {
        title: 'main page'

    } );
} );



module.exports = router;
