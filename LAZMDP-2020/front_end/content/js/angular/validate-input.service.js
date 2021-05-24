(function () {
    "use strict";
    
    angular.module("crossword")
        .service('validateInput', ['grid', 'userState', function(grid, userState) {
            var self = this;

            var completedWordsSet = new Set();
            self.hintedCharsSet = new Set();
            self.numCompletedChars = 0;

            var completedWordsGameState = new Set();
            self.hintedCharsGameState = new Set();
            self.numCompletedCharsGameState = 0;

            self.wrongLetterStateGrid = [];
            var filledOutWordsSet = new Set();

            self.wrongLetterStateGridGameState = [];
            var filledOutWordsSetGameState = new Set();

            self.initializeWrongLetterStateArr = function(size) {
                for(var row = 0; row < size; ++row) {
                    self.wrongLetterStateGrid[row] = [];
                    self.wrongLetterStateGridGameState[row] = [];
                    for(var col = 0; col < size; ++col) {
                        self.wrongLetterStateGrid[row][col] = false;
                        self.wrongLetterStateGridGameState[row][col] = false;
                    }
                }
            }
            
            self.saveGameStateProgress = function () {
                 // Save current game state
                 completedWordsGameState = completedWordsSet;
                 self.hintedCharsGameState = self.hintedCharsSet;
                 self.numCompletedCharsGameState = self.numCompletedChars;
                 console.log('complWordsGS', completedWordsGameState);
                 self.wrongLetterStateGridGameState = self.wrongLetterStateGrid;
                 console.log("Saving WL GS", self.wrongLetterStateGrid);
                 console.log("wrongLetterGS", self.wrongLetterStateGridGameState);
                 filledOutWordsSetGameState = filledOutWordsSet;
                 


            }            
            
            self.clearSolvedWords = function() {
                self.saveGameStateProgress();
                // Clear the game progress
                completedWordsSet = new Set();
                self.hintedCharsSet = new Set();
                self.numCompletedChars = 0;

                self.wrongLetterStateGrid = []
                filledOutWordsSet = new Set();
            }

            self.returnToGameStateProgress = function () {
                completedWordsSet = completedWordsGameState;
                self.hintedCharsSet = self.hintedCharsGameState;
                self.numCompletedChars = self.numCompletedCharsGameState;
                console.log('complWordsSet', completedWordsSet);
                self.wrongLetterStateGrid = self.wrongLetterStateGridGameState;
                console.log("Returning to WL", self.wrongLetterStateGrid);
                filledOutWordsSet = filledOutWordsSetGameState;
            }

            self.getCompletedWordsSetSize = function() {
                return completedWordsSet.size;
            }

            self.isMemberOfHintedWord = function(x, y) {
                var id = y + (x * grid.crosswordSize);
                if(grid.crossword[x][y].letter != userState.userStateArr[x][y] && self.hintedCharsSet.has(id)
                        && !completedWordsSet.has(grid.crossword[x][y].horizontalWord) 
                        && !completedWordsSet.has(grid.crossword[x][y].verticalWord)) {
                    return true;
                }
                return false;
            }

            self.correctFirstWrongLetterInActiveWord = function(word) {
                var startRow = grid.wordCollection[word].startRow;
                var startCol = grid.wordCollection[word].startCol;
                var endRow = grid.wordCollection[word].endRow;
                var endCol = grid.wordCollection[word].endCol;
                console.log("hinted word", word);

                var foundFirstWrongLetter = false;
                for(var row = startRow; row <= endRow; ++row) {
                    if (foundFirstWrongLetter) {break;}
                    for(var col = startCol; col <= endCol; ++col) { 
                        var id = col + (row * grid.crosswordSize);
                        if(grid.crossword[row][col].letter != userState.userStateArr[row][col]
                            && !completedWordsSet.has(grid.crossword[row][col].horizontalWord) 
                            && !completedWordsSet.has(grid.crossword[row][col].verticalWord)) {
                                console.log("found first wrong letter", userState.userStateArr[row][col]);
                                userState.userStateArr[row][col] = grid.crossword[row][col].letter;
                                console.log("changed first wrong letter", userState.userStateArr[row][col]);
                                foundFirstWrongLetter = true;
                                break;
                        }
                    }//for
                }//for
            }

            self.addCellsToHintedSet = function(word) {
                var startRow = grid.wordCollection[word].startRow;
                var startCol = grid.wordCollection[word].startCol;
                var endRow = grid.wordCollection[word].endRow;
                var endCol = grid.wordCollection[word].endCol;

                for(var row = startRow; row <= endRow; ++row) {
                    for(var col = startCol; col <= endCol; ++col) { 
                        var id = col + (row * grid.crosswordSize);
                        self.hintedCharsSet.add(id);
                    }//for
                }//for
            }

            self.removeFromHintedWords = function(x, y) {
                var id = y + (x * grid.crosswordSize);
                if(self.hintedCharsSet.has(id)) {
                    self.hintedCharsSet.delete(id);
                }
            }
            
            self.updateCompletedWordsSet = function(word) {
                var startRow = grid.wordCollection[word].startRow;
                var startCol = grid.wordCollection[word].startCol;
                var endRow = grid.wordCollection[word].endRow;
                var endCol = grid.wordCollection[word].endCol;
    
                var validWord = true; // assume true, check if false
                var completedWord = true;
                for(var row = startRow; row <= endRow; ++row) {
                    for(var col = startCol; col <= endCol; ++col) { 
                        var guess = userState.userStateArr[row][col];
                        var answer = grid.crossword[row][col].letter;
                        if(guess !== answer) {
                            validWord = false;
                        } 
                        if(guess === '') {
                            completedWord = false;
                            // SET WRONG LETTER GRID FALSE HERE IF NEEDED 
                        }
                    }//for
                }//for

                // If completed, add to filled out words set
                if (completedWord && !filledOutWordsSet.has(word)) {
                    filledOutWordsSet.add(word);
                }
                else if(!completedWord && filledOutWordsSet.has(word)) {
                    filledOutWordsSet.delete(word);
                }
                

                console.log("word", word);
                console.log("completedWord", completedWord);
                for(var row = startRow; row <= endRow; ++row) {
                    for(var col = startCol; col <= endCol; ++col) { 
                        var guess = userState.userStateArr[row][col];
                        var answer = grid.crossword[row][col].letter;
                        if (filledOutWordsSet.has(grid.crossword[row][col].horizontalWord) || 
                            filledOutWordsSet.has(grid.crossword[row][col].verticalWord)) {
                            if(guess !== answer) {
                                self.wrongLetterStateGrid[row][col] = true;
                            }
                            else {
                                self.wrongLetterStateGrid[row][col] = false;
                            }
                        }
                        else {
                            self.wrongLetterStateGrid[row][col] = false;
                        }
                    }//for
                }//for
                    
                if (validWord && !completedWordsSet.has(word)) {
                    completedWordsSet.add(word);
                    self.numCompletedChars += word.length;
                }
                else if(!validWord && completedWordsSet.has(word)) {
                    completedWordsSet.delete(word);
                    self.numCompletedChars -= word.length;            
                }
            }

            self.isWrongLetterOfCompletedWord = function(x, y, crossword) {
                if (filledOutWordsSet.has(crossword[x][y].horizontalWord) || filledOutWordsSet.has(crossword[x][y].verticalWord)) {
                    return self.wrongLetterStateGrid[x][y];
                }
                return false;
            }
            
            self.isMemberOfSolvedWord = function(x, y, crossword) {
                return completedWordsSet.has(crossword[x][y].horizontalWord) || completedWordsSet.has(crossword[x][y].verticalWord);
            }

            self.checkForValidWords = function(x, y, crossword){
                if(crossword[x][y].horizontalWord) {
                    self.updateCompletedWordsSet(crossword[x][y].horizontalWord);
                }
                if(crossword[x][y].verticalWord) {
                    self.updateCompletedWordsSet(crossword[x][y].verticalWord);
                }
            } 

            self.getCompletedWordsSize = function() {
                return completedWordsSet.size;
            }

        }]);
})();