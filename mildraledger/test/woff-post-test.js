var http = require( 'http' );

var Web3 = require( 'web3' );
var web3 = new Web3( new Web3.providers.HttpProvider( "http://localhost:8545" ) );

var postData = {
    cashier_address: web3.eth.coinbase,
    tx_id: parseInt( process.argv[ 2 ] ),
    description: "This is the description"
};

var postDataString = JSON.stringify( postData );
var postOptions = {
    host: 'localhost',
    port: 3000,
    path: '/api/woff/add',
    method: 'POST',
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

console.log( postData );

postReq.write( postDataString );
postReq.end();
