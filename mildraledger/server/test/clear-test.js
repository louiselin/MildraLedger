var http = require( 'http' );

var Web3 = require( 'web3' );
var web3 = new Web3( new Web3.providers.HttpProvider( "http://localhost:8545" ) );

var postData = {
    sender: web3.eth.coinbase
};

var postDataString = JSON.stringify( postData );
var postOptions = {
    host: 'localhost',
    port: 3000,
    path: '/api/all',
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength( postDataString )
    }
};

var postReq = http.request( postOptions, function ( res ) {
    res.setEncoding( 'utf8' );
    res.on( 'data', function ( chunk ) {
        console.log( 'Response:', chunk );
    } );
} );

postReq.write( postDataString );
postReq.end();
