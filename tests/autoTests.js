
    /**
 * Created by rbailey on 17/02/14.
 */
// https://www.npmjs.org/package/should

var should = require("should");
var async = require("async");
var db = require("./services/db");

describe('Auto tests - ', function() {
    describe("When invoking functions with dependencies via [async] auto Implementation", function() {
        it('Functions should be executed in the correct order', function(done) {
            // Arrange
            var actualFunctionCallOrder = [];

            // Act
            // Simulates a single "process" which requires multiple logical functions to fulfill.
            // In this example, we are creating a report, but in doing so, we need to perform many steps, some of which
            // are dependent on earlier steps completing.  E.g. we cant load "posts" until we know the user ID.
            // We cant write the report until the report folder is created etc.

            async.auto({
                get_user_id: function(callback, results){
                    // simulate a remote call to load the next user ID to process
                    setTimeout(function(){
                        actualFunctionCallOrder.push('get_user_id');
                        callback(null, 100);
                    }, 10)
                },
                make_folder: ['get_user_id', function(callback, results){
                    // Simulate a call to make a folder for the new user
                    setTimeout(function(){
                        actualFunctionCallOrder.push('make_folder');
                        callback(null, 'c:\\' + results.get_user_id);
                    }, 1000)
                }],
                get_user_details: ['get_user_id', function(callback, results){
                    // Simulate a call to load the users details from a remote store
                    db.query('users', 'your filter', function(err, data){
                        actualFunctionCallOrder.push('get_user_details');
                        callback(null, data);
                    })
                }],
                get_user_posts: ['get_user_id', function(callback, results){
                    // Simulate a call to load the users details from a remote store
                    setTimeout(function(){
                        db.query('posts', 'your filter', function(err, data){
                            actualFunctionCallOrder.push('get_user_posts');
                            callback(null, data);
                        });
                    }, 10);
                }],
                generate_report: ['get_user_details', 'get_user_posts', 'make_folder', function(callback, results){
                    // simulate a process generating a report from all the data gained above, and sticking it in the new folder.
                    setTimeout(function(){
                        actualFunctionCallOrder.push('generate_report');
                        callback(null, true);
                    }, 1)
                }]
            },
            function(err, results){
                checkResults(results);
            });

            // Assert
            function checkResults(results) {
                // Check order of function execution is correct.
                var expectedFunctionCallOrder = ['get_user_id', 'get_user_details', 'get_user_posts', 'make_folder', 'generate_report'];
                actualFunctionCallOrder.should.eql(expectedFunctionCallOrder);

                // Check the final values for each stage are as expected
                results.get_user_id.should.eql(100);
                results.get_user_details.should.have.lengthOf(3);
                results.get_user_posts.should.have.lengthOf(5);
                results.make_folder.should.eql('c:\\100');
                results.generate_report.should.be.true;

                // Signal back to mocha that we are all done.
                done();
            }
        });
    });
});

