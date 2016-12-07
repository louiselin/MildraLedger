var DatabaseManager = require( '../app/databasemanager' );
var dbconfig = require( '../config/database.js' );



var db = new DatabaseManager( dbconfig );
db.on( 'ready', function () {
    console.log( 'ready', 'txCount:', db.txCount, 'writeOffCount:', db.writeOffCount );

    db.on( 'gotBalance', function ( amount ) {
        console.log( 'balnace', amount );
    } );

    var infos = [];

    for ( var i = 0; i < 10; ++i ) {
        var id = db.nextTxId();
        infos.push( {
            txId: id,
            cashierAddress: 'cashierAddress ' + id,
            txType: 0,
            amount: id * 40,
            timestamp: Date.now(),
            description: 'this is a description.'
        } );
    }

    db.addTransactions( infos, function ( err, results ) {
        if ( err ) {
            throw err;
        }
        console.log( 'Ok' );
        db.dumpTransactions( function ( err, results ) {
            console.log( 'Dump tx' );
            results.forEach( function ( row ) {
                console.log( row );
            } );
        } );

        db.queryTransaction( 1, function ( err, result ) {
            if ( err ) {
                throw err;
            }
            console.log( 'Query on tx' );
            result.forEach( function ( row ) {
                console.log( row );
            } );
        } );
        db.queryTransactions( [ 1, 3, 5, 7 ], function ( err, results ) {
            if ( err ) {
                throw err;
            }
            console.log( 'Query on multiple txs' );
            results.forEach( function ( row ) {
                console.log( row );
            } );
        } );

        var writeoffs = [];
        for ( var i = 0; i < 3; ++i ) {
            var id = db.nextWriteOffId();
            writeoffs.push( {
                writeOffId: id,
                txId: i,
                cashierAddress: 'adfs-s0',
                description: 'this is a write-off entity',
                timestamp: Date.now()
            } );
        }
        // db.addWriteOffEntities( writeoffs, function ( err, results ) {
        //     if ( err ) {
        //         throw err;
        //     }
        //     console.log( 'Add write-off entities' );
        //     db.queryWriteOffEntities( [ 0, 1, 2 ], function ( err, results ) {
        //         if ( err ) {
        //             throw err;
        //         }
        //         console.log( 'query write-off entities' );
        //         console.log( results );
        //     } );
        // } );

        db.queryWriteOffEntities( [ 0, 1, 2 ], function ( err, results ) {
            if ( err ) {
                throw err;
            }
            console.log( 'query write-off entities' );
            console.log( results );
        } );

        db.getBalance();
    } );


} );
