#!/usr/bin/node env

var express = require( 'express' );
var router = express.Router();

router.get( '/', function ( req, res ) {
    res.render( 'usermanagement.ejs', {
        title: 'user management page',
        permission: req.user.permission

    } );
} );



module.exports = router;
