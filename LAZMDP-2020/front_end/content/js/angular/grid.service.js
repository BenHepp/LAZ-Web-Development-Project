(function () {
    "use strict";
    angular.module("crossword")
        .service('grid', ['crosswordState', 'tutorial', '$q', '_', function (crosswordState, tutorial, $q, _) {
            var self = this;
            self.wordCollection = {};
            self.crossword = [];
            self.crosswordSize = 0;
            self.totalNumChars = 0;
            self.numWordsInPuzzle = 0;
            self.tutorialGrid = tutorial.tutorialGrid;
            self.tutorialCollection = tutorial.tutorialCollection;
            self.isPlayingGame = false;

            var prevCrossword = [];
            var prevTotalNumChars = 0;
            var prevNumWordsInPuzzle = 0;
            var prevWordCollection = {};

            // Depending on isTutorial -> use correct self.crossword & self.wordCollectoin
            // Next step, hard code set css for step 2 based on tutorial crossword & wordcollection values
            self.setGrid = function (tempGrid) {
                if (self.crossword.length > 0) {
                    self.crossword.splice(0, self.crossword.length);
                }
                for (var row = 0; row < tempGrid.length; ++row) {
                    self.crossword[row] = []
                    for (var col = 0; col < tempGrid[row].length; ++col) {
                        self.crossword[row][col] = {};
                        self.crossword[row][col].letter = tempGrid[row][col].letter;
                        self.crossword[row][col].horizontalWord = tempGrid[row][col].horizontalWord;
                        self.crossword[row][col].verticalWord = tempGrid[row][col].verticalWord;
                    }
                }
            }

            self.getTutorialGrid = function () {
                self.setGrid(self.tutorialGrid);
                self.crosswordSize = 5;
                self.wordCollection = self.tutorialCollection;
                self.numWordsInPuzzle = Object.keys(self.wordCollection).length;
                self.totalNumChars = 0;
                for (var i = 0; i < Object.keys(self.wordCollection).length; ++i) {
                    self.totalNumChars += Object.keys(self.wordCollection)[i].length;
                }
                return self.crossword;
            }

            self.getGameGrid = function () {
                // TODO - add functionality for retrieving user state from back end
                self.isPlayingGame = true;
                var crosswordPromise = crosswordState.getCrossword().then(function (crossword) {
                    self.setGrid(crossword);
                    self.crosswordSize = crossword.length;
                    //console.log('cross', self.crossword);
                }).catch(function (reason) {
                    console.debug(reason);
                    messageHandler.publishError("There was a problem processing your request.");
                });
                var wordCollectionPromise = crosswordState.getWordCollection().then(function (wordCollection) {
                    //THIS PROIMSE IS CALLED TWICE FOR SOME REASON
                    self.wordCollection = wordCollection;
                    self.numWordsInPuzzle = Object.keys(self.wordCollection).length;
                    self.totalNumChars = 0;
                    for (var i = 0; i < Object.keys(self.wordCollection).length; ++i) {
                        self.totalNumChars += Object.keys(self.wordCollection)[i].length;
                    }
                    //console.log('coll', self.wordCollection);
                }).catch(function (reason) {
                    console.debug(reason);
                    messageHandler.publishError("There was a problem processing your request.");
                });
                return $q.all([crosswordPromise, wordCollectionPromise]).then(function () {
                    return self.crossword;
                });
            }

            self.saveGameStateProgress = function () {
                prevCrossword = self.crossword.slice(0);
                prevTotalNumChars = self.totalNumChars;
                prevNumWordsInPuzzle = self.numWordsInPuzzle;
                prevWordCollection = self.wordCollection;
            }

            self.returnToGameStateProgress = function () {
                self.setGrid(prevCrossword);
                self.crosswordSize = prevCrossword.length;
                self.totalNumChars = prevTotalNumChars;
                self.numWordsInPuzzle = prevNumWordsInPuzzle;
                self.wordCollection = prevWordCollection;
            }

            self.wordCollection_findNextWord = function (currentWord) {
                var currentID = self.wordCollection[currentWord].id;
                var nextID = (currentID == Object.keys(self.wordCollection).length - 1) ? 0 : currentID + 1;
                return Object.keys(self.wordCollection)[nextID];
            }
            self.wordCollection_findPrevWord = function (currentWord) {
                var currentID = self.wordCollection[currentWord].id;
                var prevID = (currentID == 0) ? Object.keys(self.wordCollection).length - 1 : currentID - 1;
                return Object.keys(self.wordCollection)[prevID];
            }

            self.isSpecialCharacter = function (x, y) {
                var permittedLetters = /^[a-zA-Z0-9]+$/;
                var letter = self.crossword[x][y].letter;
                //console.log("letter", letter);
                if (letter && !letter.match(permittedLetters)) {
                    //console.log("this IS a special character");
                    return true;
                }
                return false;
            }
        }]);
})();