/* jshint esversion: 6 */


var express = require( 'express' );
var session = require( 'express-session' );
var path = require( 'path' );
var favicon = require( 'serve-favicon' );
var logger = require( 'morgan' );
var cookieParser = require( 'cookie-parser' );
var bodyParser = require( 'body-parser' );
var passport = require( 'passport' );
var flash = require( 'connect-flash' );
var Web3 = require( 'web3' );
var web3 = new Web3( new Web3.providers.HttpProvider( "http://localhost:8545" ) );


var dbconfig = require( './config/database' );
var contractConfig = require( './config/contract-testrpc' );
var eventEmitter = require( './app/eventemitter' );
var auth = require( './app/auth' );
var db = require( './app/databasemanager' )( dbconfig );
var ContractManager = require( './app/contractmanager' );

var cm = new ContractManager( contractConfig );
contract = cm.loadInstance();

if ( !contract ) {
    var msg = 'Failed to load contract instance.';
    console.log( msg );
    throw new Error( msg );
} else {
    console.log( 'Contract loaded:', contract.address );
    contract.TransactionAddedEvent( {}, function ( err, event ) {
        console.log( "in TransactionAddedEvent:",
            'TransactionAddedEvent:' + event.args.txId );

        eventEmitter.emit(
            'TransactionAddedEvent:' + event.args.txId,
            event.args );
    } );
    contract.WriteOffAddedEvent( {}, function ( err, event ) {
        console.log( "in WriteOffAddedEvent:",
            'WriteOffAddedEvent:' + event.args.writeOffId );

        eventEmitter.emit(
            'WriteOffAddedEvent:' + event.args.writeOffId,
            event.args );
    } );
}

var routes = require( './routes/index' );
var login = require( './routes/login' );

var app = express();
require( './config/passport' )( db, passport );

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

app.use( '/profile', auth.isLoggedIn, require( './routes/profile' ) );
app.use( '/usermanagement', auth.checkPermission( auth.CanModifyUser ), require( './routes/usermanagement' ) );
app.use( '/ledger', auth.isLoggedIn, require( './routes/ledger' ) );
app.use( '/ledgereditor', auth.checkPermission( auth.CanModifyLedger ), require( './routes/ledgereditor' ) );
// app.use( '/api', auth.isLoggedIn, require( './routes/api' )( db, contract ) );
app.use( '/api', require( './routes/api' )( db, contract ) );

// app.use( '/ledgereditor/woff', checkPermission( CanModifyLedger ), require( './routes/woff' ) );
// app.use( '/ledgereditor', checkModifyLedgerPermission, require( './routes/ledgereditor' ) );
// app.use( '/ledgereditor/woff', checkModifyLedgerPermission, require( './routes/woff' ) );

app.get( '/accessdenied', auth.isLoggedIn, function ( req, res ) {
    res.render( 'accessdenied.ejs', {
        user: req.user
    } );
} );

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
