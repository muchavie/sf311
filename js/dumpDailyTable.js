
var sqlite3 = require('sqlite3'),
     dbfile = '/home/pogilvie/Dropbox/Projects/311/db/311.db',
   dailySQL = 'SELECT * FROM Daily_20140414 order by caseid',
         db = new sqlite3.Database(dbfile);


db.all(dailySQL, function (err, requests) {

    if (err)
	throw(err);

    console.log(requests);
});

