/**
 * Created by rbailey on 17/02/14.
 */
// https://www.npmjs.org/package/should

var should = require("should");
var async = require("async");
var db = require("./services/db");

describe('Series tests - ', function() {
    describe("When async via [async] Implementation", function() {
        it('it should return the correct records', function(done) {

            // Arrange
            var actual = [];
            var name = "";
            var userId; //Define userId out here, so both series tasks can access the variable

            async.series([
                //Load user to get userId first
                function(callback) {
                    actual.push('Started Step 1');
                    db.query('users', {name: name}, function(err, users) {
                        if (err) return callback(err);
                        //Check that a user was found
                        if (users.length == 0) {
                            return callback(new Error('No user with name '+name+' found.'));
                        }
                        var user = users[0];
                        userId = user.id; //Set the userId here, so the next task can access it
                        var user = {
                            name: user.name,
                            username: user.username,
                            role: user.role
                        };
                        actual.push('Completed Step 1');
                        callback(null, user);
                    });
                },
                //Load posts (won't be called before task 1's "task callback" has been called)
                function(callback) {
                    actual.push('Started Step 2');
                    db.query('posts', {userId: userId}, function(err, posts) {
                        if (err) return callback(err);
                        var posts = posts;
                        actual.push('Completed Step 2');
                        callback(null, posts);
                    });
                }
                ],
                function(err, results) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) throw err;
                    // Results for series "steps" are available in the results array as individual elements.  Step1 == element 1 etc.

                    // 2 steps
                    results.should.have.length(2);
                    // first step gave us user (which has a name property)
                    results[0].should.have.property('name');
                    // second step gave us posts, there should be 5 of those
                    results[1].should.have.length(5);

                    // Check order of step execution was correct
                    actual.should.eql(['Started Step 1', 'Completed Step 1', 'Started Step 2', 'Completed Step 2']);

                    // Signal back to mocha that our test is completed.
                    done();
                }
            );
        });
    });
});






