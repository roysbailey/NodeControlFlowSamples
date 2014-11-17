/**
 * Created by rbailey on 17/02/14.
 */
// https://www.npmjs.org/package/should

var should = require("should");
var async = require("async");

describe('Queue tests - ', function() {
    describe("When invoking tasks via [async] queue Implementation", function() {
        it('it should call drain when all items processed', function(done) {
            // Arrange
            var maxConcurrentWorkers = 2;
            var taskProcessor = function(task, callback) {
                // Do some work now!
                // Signal back to the queue manager that done without error
                callback();
            }

            var sut = async.queue(
                taskProcessor,
                maxConcurrentWorkers);

            sut.drain = function(){
                checkDone();
            };

            // Act
            for (var i=0; i<10; i++) {
                sut.push(i);
            }

            // Assert
            function checkDone() {
                // Nothing to assert, we are only testing here if the drain event is called on completion.
                done();
            }
        });
        it('it should limit concurrency when multiple items in the queue', function(done) {
            // Arrange
            var constMaxConcurrentWorkers = 2,
                currentConcurrentWorkersActual= 0,
                maxConcurrentWorkersActual=0;

            var taskProcessor = function(task, callback) {
                currentConcurrentWorkersActual++;
                maxConcurrentWorkersActual = currentConcurrentWorkersActual > maxConcurrentWorkersActual ? currentConcurrentWorkersActual : maxConcurrentWorkersActual;
                    setTimeout(function(){
                    // Do some work now
                    // Signal back to the queue manager that done without error
                    currentConcurrentWorkersActual--;
                    callback();
                }, 20);
            }

            var sut = async.queue(
                taskProcessor,
                constMaxConcurrentWorkers);

            sut.drain = function(){
                checkDone();
            };

            // Act
            for (var i=0; i<10; i++) {
                sut.push(i);
            }

            // Assert
            function checkDone() {
                maxConcurrentWorkersActual.should.eql(constMaxConcurrentWorkers);
                done();
            }
        });
        it('it should call the correct callbacks in the correct order', function(done) {
            // Arrange
            var constMaxConcurrentWorkers = 2,
                constTaskCount = 20,
                callbacksCalled = [];

            var taskProcessor = function(task, callback) {
                setTimeout(function(){
                    // Do something now!
                    // Signal back to the queue manager that done without error
                    callback(task);
                },
                20);
            }

            var sut = async.queue(
                taskProcessor,
                constMaxConcurrentWorkers);

            sut.saturated = function(){
                callbacksCalled.push("saturated");
            };

            sut.empty = function(){
                callbacksCalled.push("empty");
            };

            sut.drain = function(){
                callbacksCalled.push("drain");
                checkDone();
            };

            // Act
            for (var i=0; i<constTaskCount; i++) {
                sut.push(i);
            }

            // Assert
            function checkDone() {
                var expected = ['saturated', 'empty', 'drain'];
                callbacksCalled.should.eql(expected);
                done();
            }
        });
    });
});

