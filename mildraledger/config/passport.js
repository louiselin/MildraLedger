// load all the things we need
var LocalStrategy = require( 'passport-local' ).Strategy;
var bcrypt = require( 'bcrypt-nodejs' );

module.exports = function ( db, passport ) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser( function ( user, done ) {
        done( null, user.user_id );
    } );

    // used to deserialize the user
    passport.deserializeUser( function ( id, done ) {
        db.connection.query( "SELECT * FROM users WHERE user_id = ? ", [ id ], function ( err, rows ) {
            done( err, rows[ 0 ] );
        } );
    } );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy( {
                // by default, local strategy uses username and password, we will override with email
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            function ( req, username, password, done ) { // callback with email and password from our form
                console.log( 'Try to login:', username );
                db.connection.query(
                    "SELECT * FROM users WHERE account = ?", [ username ],
                    function ( err, rows ) {
                        if ( err ) {
                            return done( err );
                        }

                        if ( !rows.length ) {
                            // req.flash is the way to set flashdata using connect-flash
                            return done( null, false, req.flash( 'loginMessage', 'No user found.' ) );
                        }

                        var info = rows[ 0 ];
                        console.log( info );

                        // if the user is found but the password is wrong
                        if ( !bcrypt.compareSync( password, info.password ) ) {
                            // create the loginMessage and save it to session as flashdata
                            return done( null, false, req.flash( 'loginMessage', 'Oops! Wrong password.' ) );
                        }

                        // all is well, return successful user
                        console.log( 'user logged in: ', username );
                        return done( null, info );
                    } );
            } )
    );
};
