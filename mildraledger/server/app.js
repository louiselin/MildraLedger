const CanModifyUser = 4;
const CanModifyLedger = 2;
const CanReadLedger = 1;

var express = require( 'express' );
var session = require( 'express-session' );
var path = require( 'path' );
var favicon = require( 'serve-favicon' );
var logger = require( 'morgan' );
var cookieParser = require( 'cookie-parser' );
var bodyParser = require( 'body-parser' );
var passport = require( 'passport' );
var flash = require( 'connect-flash' );


var routes = require( './routes/index' );
var login = require( './routes/login' );

var app = express();
require( './config/passport' )( passport );

// view engine setup
app.set( 'views', path.join( __dirname, 'views' ) );
app.set( 'view engine', 'ejs' );

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use( logger( 'dev' ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( {
    extended: false
} ) );
app.use( cookieParser() );
app.use( express.static( path.join( __dirname, 'public' ) ) );

// required for passport
app.use( session( {
    secret: 'vidyapathaisalwaysrunning',
    resave: true,
    saveUninitialized: true
} ) ); // session secret
app.use( passport.initialize() );
app.use( passport.session() ); // persistent login sessions
app.use( flash() );

app.use( '/', routes );
app.use( '/login', login( passport ) );
app.use( '/logout', function ( req, res ) {
    req.logout();
    res.redirect( '/' );
} );
// app.use( '/main', isLoggedIn, require( './routes/main' ) );
app.use( '/profile', isLoggedIn, require( './routes/profile' ) );
app.use( '/usermanagement', checkmanagementLoggedIn, require( './routes/usermanagement' ) );
app.use( '/ledger', isLoggedIn, require( './routes/ledger' ) );
app.use( '/ledgereditor', checkEditingLoggedIn, require( './routes/ledgereditor' ) );
app.use( '/ledgereditor/woff', checkEditingLoggedIn, require( './routes/woff' ) );

app.get('/auth', isLoggedIn, function(req, res){
    res.render('auth.ejs', {
        user: req.user
    });
});


function isLoggedIn( req, res, next ) {
    // if user is authenticated in the session, carry on
    if ( req.isAuthenticated() ) {
        return next();
    }
    // if they aren't redirect them to the home page
    res.redirect( '/' );
}

function checkmanagementLoggedIn(req, res, next) {
    
    if (req.user.permission & CanModifyUser){
        return next();
        
    } else {
        res.redirect('/auth');
    }
}

function checkEditingLoggedIn(req, res, next) {
    // console.log(req.user);
    if (req.user.permission & CanModifyLedger) {
        return next();
    } else {
        res.redirect('/auth');
    }
}

// catch 404 and forward to error handler
app.use( function ( req, res, next ) {
    var err = new Error( 'Not Found' );
    err.status = 404;
    next( err );
} );

// error handlers

// development error handler
// will print stacktrace
if ( app.get( 'env' ) === 'development' ) {
    app.use( function ( err, req, res, next ) {
        res.status( err.status || 500 );
        res.render( 'error', {
            message: err.message,
            error: err
        } );
    } );
}

// production error handler
// no stacktraces leaked to user
app.use( function ( err, req, res, next ) {
    res.status( err.status || 500 );
    res.render( 'error', {
        message: err.message,
        error: {}
    } );
} );


module.exports = app;
