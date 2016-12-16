var mysql = require('mysql');

// http://nodejs.org/docs/v0.6.5/api/fs.html#fs.writeFile
var fs = require('fs');

var client = mysql.createConnection({
   host: 'localhost',
   user: 'root',
   password: '104753014' 
});

client.query('select user_id, account, eth_address, permission from mildraledger.users;', function(err, results, fields) {
    if(err) throw err;

    fs.writeFile('userjson.json', JSON.stringify(results, false, 4), function (err) {
      if (err) throw err;
      console.log('Saved!');
    });

    client.end();   
});