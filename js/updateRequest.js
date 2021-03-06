
// Target Table
//
//CREATE TABLE Request
//(
//           request_id INTEGER PRIMARY KEY NOT NULL,
//    request_seniority INTEGER NOT NULL,
//          request_pid INTEGER NOT NULL REFERENCES Person (person_id)
//);

// Source snapshop table
//
//CREATE TABLE Daily_20140414
//(
//	 changesid INTEGER,
//	       dob DATE,
//	       pos INTEGER,
//	 seniority INTEGER,
//	    caseid INTEGER
//);

var         sqlite3 = require('sqlite3'),
             dbfile = "/home/pogilvie/Dropbox/Projects/311/db/311.db",
                 db = new sqlite3.Database(dbfile),
 currentRequestsSQL = "SELECT * FROM Request order by request_id",
newDailyRequestsSQL = "SELECT changesid, seniority, caseid from Daily_" + process.argv[2] + " order by caseid",
   insertRequestSQL = "INSERT INTO Request (request_id,   request_seniority,   request_pid) VALUES (?, ?, ?)",
   uptimeRequestSQL = "UPDATE Request SET request_seniority = ? WHERE request_id = ?";

function binarySearch(requests, v, iLow, iHigh) {
    var iMiddle = Math.round((iLow + iHigh) / 2);

    // console.log("v: " + v + " iLow: " + iLow + " iMiddle: " + iMiddle + " iHigh: " + iHigh);

    if (iMiddle == iLow || iMiddle == iHigh)
	return null;
    
    if (requests[iMiddle].request_id === v)
	return requests[iMiddle];
    else if (requests[iMiddle].request_id > v)
	return binarySearch(requests, v, iLow, iMiddle);
    else
	return binarySearch(requests, v, iMiddle, iHigh);
}


var stats = {};
stats.processed = 0;
    stats.newid = 0;
   stats.update = 0;

db.serialize(function () {
    var r;

    db.all(currentRequestsSQL, function (requestErr, requests) {

	if (requestErr)
	    throw (requestErr);

	db.all(newDailyRequestsSQL, function (dailyErr, dailyRequests) {

	    if (dailyErr)
		throw (dailyErr);

	    dailyRequests.forEach(function (row) {
		stats.processed++;

		r = binarySearch(requests, row.caseid, 0, requests.length);

		if (r === null)
		{
		    r = {};
		           r.request_id = row.caseid;
		    r.request_seniority = row.seniority;
		          r.request_pid = row.changesid;
		    stats.newid++;
		    console.log("new id: " + r.request_id);
		    db.run(insertRequestSQL, r.request_id, r.request_seniority, r.request_pid); 
		}
		else if (r.request_seniority !== row.seniority)
		{
		    console.log("update id: " + r.request_id + " old seniority: " + r.request_seniority + " new seniority: " + row.seniority);
		    stats.update++;
		    db.run(uptimeRequestSQL, row.seniority, r.request_id);
		}
	    });
	    console.log("Processed: " + stats.processed + " New: " + stats.newid + " stats.update: " + stats.update);
	});
    });
});


