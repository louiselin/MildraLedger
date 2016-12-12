var http = require( 'http' );

var Web3 = require( 'web3' );
var web3 = new Web3( new Web3.providers.HttpProvider( "http://localhost:8545" ) );

var reqs = [];

function createRequest() {
    var postData = {
        cashier_address: web3.eth.coinbase,
        tx_type: Math.round( Math.random() ),
        amount: Math.floor( 1000 * Math.random() ),
        timestamp: Date.now(),
        description: "This is the description"
    };

    var postDataString = JSON.stringify( postData );
    var postOptions = {
        host: 'localhost',
        port: 3000,
        path: '/api/tx/add',
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
    reqs.push( postReq );

    postReq.write( postDataString );
    postReq.end();
}

var times = 1;
times = parseInt( process.argv[ 2 ] );

if ( times < 1 ) {
    times = 1;
}
console.log( 'times:', times );

function onTimeout() {
    if ( times-- > 0 ) {
        createRequest();
        setTimeout( onTimeout, 2000 );
    }
}

onTimeout();
