/* jshint esversion: 6 */

const CanModifyUser = 4;
const CanModifyLedger = 2;
const CanReadLedger = 1;

module.exports.isLoggedIn = function ( req, res, next ) {
    // if user is authenticated in the session, carry on
    if ( req.isAuthenticated() ) {
        return next();
    }
    // if they aren't redirect them to the home page
    res.redirect( '/' );
};

module.exports.checkPermission = function ( flags ) {
    return function ( req, res, next ) {
        if ( typeof req.user != 'undefined' && req.user.permission & flags ) {
            return next();
        } else {
            res.redirect( '/accessdenied' );
        }
    };
};

module.exports.getRole = function ( permission ) {
    if ( permission & ( CanModifyUser | CanModifyLedger | CanReadLedger ) ) {
        return 'Root';
    } else if ( permission & ( CanModifyLedger | CanReadLedger ) ) {
        return 'Cashier';
    } else if ( permission & CanReadLedger ) {
        return 'Normal user';
    }
    return 'No permission';
};

module.exports.CanModifyUser = CanModifyUser;
module.exports.CanModifyLedger = CanModifyLedger;
module.exports.CanReadLedger = CanReadLedger;
