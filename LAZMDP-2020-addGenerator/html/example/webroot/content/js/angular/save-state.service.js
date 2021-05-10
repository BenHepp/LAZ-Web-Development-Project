(function () {
    "use strict";
    
    angular.module("crossword")
        .service('saveState', ['$http', function($http) {

            var self = this;
            self.saveStateArr = [];
            var incomplete_crossword_id = 0;

            self.initializeSaveStateArr = function(size) {
                for(var row = 0; row < size; ++row) {
                    self.saveStateArr[row] = [];
                    for(var col = 0; col < size; ++col) {
                        self.saveStateArr[row][col] = '';
                    }
                }
            }

            self.takeUserSnapshot = function(size, userStateArr) {
                var tempStateArr = [];
                for(var row = 0; row < size; ++row) {
                    tempStateArr[row] = [];
                    for(var col = 0; col < size; ++col) {
                        tempStateArr[row][col] = userStateArr[row][col];
                    }
                }
                self.saveStateArr.push(tempStateArr);
            }

            self.initializeDb = function(userArray, ansKey, ansKeySize) {
                console.log("INITIALIZE");
                var backendData = {
                    incomplete_xword_id: incomplete_crossword_id,
                    userArray: userArray,
                    answerKey: convertAnswerKey(ansKey, ansKeySize),
                    studentID: 1
                }

                return $http.post("/api/firstState", backendData)
                    .then(function (result) {

                        console.log(result);
                        // Hi front-end team! Here's what's stored in 
                        // the return variable "result" for you to use
                        // in your regeneration code.
                        //
                        //    - If the user has a puzzle in progress, 
                        //      we'll return a json array that contains 
                        //      the unfinished puzzle. You can access this
                        //      2D array by doing:
                        //          var unfinishedPuzzle = result.data[0]['crossword']
                        // 
                        //    - If the user is starting a new puzzle, "result"
                        //      will contain the following string:
                        //          result = "nothing to regenerate"
                        //
                        // Let us know if you need any help! Good luck!
                        // Ben & Andy <3
                        
                    });
            }

            function convertAnswerKey(crossword, size) {
                var newAnswerKey = [];
                for(var row = 0; row < size; ++row) {
                    newAnswerKey[row] = [];
                    for(var col = 0; col < size; ++col) {
                        newAnswerKey[row][col] = (crossword[row][col].letter == null) ? "": crossword[row][col].letter;
                    }
                } 
                return newAnswerKey;
            }

            self.saveCurrentUserState = function(userArray, ansKey, ansKeySize) {

                var backendData = {
                    incomplete_xword_id: incomplete_crossword_id,
                    userArray: userArray,
                    answerKey: convertAnswerKey(ansKey, ansKeySize),
                    studentID: 1
                }

                return $http.post("/api/saveState", backendData)
                    .then(function (result) {
                        console.log(result);
                    });
            }

            self.saveFinishedPuzzle = function(userArray) {
                console.log("FINISHED");
                console.log("FINISHED");
                console.log("FINISHED");
                console.log(incomplete_crossword_id);
                console.log("completed");
                var backendData = {
                    incomplete_xword_id: incomplete_crossword_id,
                    userArray: userArray,
                    answerKey: 0,
                    studentID: 1
                }

                return $http.post("/api/lastState", backendData)
                    .then(function (result) {
                        console.log(result);
                    });
            }
            
        }]);
})();