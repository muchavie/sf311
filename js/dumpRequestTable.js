
var sqlite3 = require('sqlite3'),
     dbfile = '/home/pogilvie/Dropbox/Projects/311/db/311.db',
 requestSQL = 'SELECT * FROM Request order by request_id',
         db = new sqlite3.Database(dbfile);


db.all(requestSQL, function (requestErr, requests) {

    if (requestErr)
	throw(requestErr);

    console.log(requests);
});

