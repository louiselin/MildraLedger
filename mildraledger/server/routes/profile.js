var express = require( 'express' );
var router = express.Router();


function getRole( permission ) {
    if ( permission & ( 4 | 2 | 1 ) ) {
        return 'root';
    } else if ( permission & ( 2 | 1 ) ) {
        return 'cashier';
    } else if ( permission & ( 1 ) ) {
        return 'normal user';
    }
    return 'no permission';
}


router.get( '/', function ( req, res, next ) {
    res.render( 'profile.ejs', {
        user: req.user, // get the user out of session and pass to template
        permission: getRole( req.user.permission )
    } );
} );



module.exports = router;
