var express = require( 'express' );
var router = express.Router();
var auth = require( '../app/auth' );

router.get( '/', function ( req, res, next ) {
    res.render( 'profile.ejs', {
        user: req.user,
        role: auth.getRole( req.user.permission )
    } );
} );

module.exports = router;
