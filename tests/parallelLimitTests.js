/**
 * Created by rbailey on 17/02/14.
 */
// https://www.npmjs.org/package/should

var should = require("should");
var async = require("async");

describe('Parallel Limit tests - ', function() {
    describe("When parallelLimit via [async] Implementation", function() {
        it('it should limit concurrent task execution and return correct data ordered when all completed', function(done) {
            // Arrange
            var taskList = [],
                currentlyExecuting= 0,
                totalCompleted= 0,
                maxExecuting=0;
            var constNumTasks = 20,
                constMaxConcurrent = 2;

            for (var i=0; i < constNumTasks; i++) {
                var task = (function() {
                    var closuredI = i;
                    return function (callback){
                        currentlyExecuting++;
                        maxExecuting = currentlyExecuting > maxExecuting ? currentlyExecuting : maxExecuting;
                        setTimeout(function() {
                                totalCompleted++;
                                currentlyExecuting--;
                                callback(null, "done: " + closuredI);
                            },
                            20);
                    }
                })();

                taskList.push(task);
            }

            // Act
            async.parallelLimit(
                taskList,
                constMaxConcurrent,
                function(err, results) { //This function gets called after the two tasks have called their "task callbacks"
                    if (err) throw err;
                    // Results for parallel "steps" are available in the results array as individual elements.  Step1 == element 1 etc.

                    // Check all done, and limit worked
                    totalCompleted.should.eql(constNumTasks);
                    currentlyExecuting.should.eql(0);
                    maxExecuting.should.eql(constMaxConcurrent);

                    // Check the results as we expected
                    results.should.have.lengthOf(constNumTasks);
                    var expectedResults = [];
                    for (var i=0; i < constNumTasks; i++) {
                        expectedResults.push('done: ' + i);
                    }
                    results.should.eql(expectedResults);

                    // Signal back to mocha that our test is completed.
                    done();
                }
            );
        });
    });
});

