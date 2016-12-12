var express = require( 'express' );
var router = express.Router();


module.exports = function ( passport ) {
    router.get( '/', function ( req, res, next ) {
        res.render( 'login.ejs', {
            message: req.flash( 'loginMessage' )
        } );
    } );

    router.post( '/', passport.authenticate( 'local-login', {
        successRedirect: '/ledger', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    } ), function ( req, res ) {
        if ( req.body.remember ) {
            req.session.cookie.maxAge = 1000 * 60 * 3;
        } else {
            req.session.cookie.expires = false;
        }
        res.redirect( '/' );
    } );
    return router;
};
