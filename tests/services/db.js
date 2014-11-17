// A spoof DB module, which is all in memory
// but uses a "timer" to simulate an async load.

var async = require('async');

var buckets = [
    {
        name: "users",
        records: [
            { id: "1", username: "bscratchit", name: "Bob Scratchit", role: "Admin" },
            { id: "2", username: "egardner", name: "Eva Gardener", role: "Clerk" },
            { id: "3", username: "chestom", name: "Charlton Heston", role: "BOSS" },
        ]
    },
    {
        name: "posts",
        records: [
            { id: "1", username: "bscratchit", text: "My first post!", created: "2014/02/17" },
            { id: "2", username: "bscratchit", text: "My second post!", created: "2014/02/18" },
            { id: "3", username: "egardner", text: "My super first post!", created: "2014/02/17" },
            { id: "4", username: "egardner", text: "My super second post!", created: "2014/02/18" },
            { id: "5", username: "chestom", text: "My AMAZING first post!", created: "2014/02/16" },
        ]
    }
];

var asyncDelay = 200;

exports.query=query;

function query(bucketName, filter, callback) {
    // Note. we are not gonna implement "filtering", implementing just enough to demo control flow scenarios
    setTimeout(function() {
        var bucket = async.filter(buckets,
            function(item, itemCallback) {
                itemCallback(item.name === bucketName);
            },
            function(buckets){
                if (buckets.length === 0) {
                    callback(new Error("No bucket found"));
                } else {
                    callback(null, buckets[0].records);
                }
            });
    }, asyncDelay);
}