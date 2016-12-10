#!/usr/bin/node env

var express = require( 'express' );
var router = express.Router();

router.get( '/', function ( req, res ) {
    res.render( 'usermanagement.ejs', {
        user: req.user,
        permission: req.user.permission,
        title: 'user management page'
    } );
} );



module.exports = router;
