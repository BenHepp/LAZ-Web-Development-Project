(function () {
    "use strict";
    
    angular.module("crossword")
        .service('activeWord', ['grid', function(grid) {
            var self = this;

            self.activeWordData = { // still consider creating factory for this
                word: "",
                definition: "",
                horzOrVert: "",
                activeCellData: {
                    x: null,
                    y: null
                }
            }

            self.initializeActiveWord = function(word) {
                self.activeWordData.word = word;
                self.activeWordData.definition = grid.wordCollection[word].definition;
                self.activeWordData.activeCellData.x = null;
                self.activeWordData.activeCellData.y = null;
                if(grid.wordCollection[word].startRow == grid.wordCollection[word].endRow) {
                    self.activeWordData.horzOrVert = "horizontal"; 
                }
                else {
                    self.activeWordData.horzOrVert = "vertical"; 
                }
            }

            self.isMemberOfActiveWord = function(x, y) {
                if(grid.crossword[x][y].horizontalWord == self.activeWordData.word || grid.crossword[x][y].verticalWord == self.activeWordData.word) {
                    return true;
                }
                return false;
            }

            self.adjustActiveWord = function(x, y) {
                var wordHorz = grid.crossword[x][y].horizontalWord;
                var wordVert = grid.crossword[x][y].verticalWord;
                var isIntersection = (wordHorz && wordVert) ? true : false;
                var clickedSameWord = (wordHorz == self.activeWordData.word || wordVert == self.activeWordData.word) ? true : false;

                if(!clickedSameWord && isIntersection) {
                    self.activeWordData.word = (self.activeWordData.horzOrVert == "vertical") ? wordVert : wordHorz;
                }
                else if(!clickedSameWord && !isIntersection) {
                    self.activeWordData.word = (wordHorz) ? wordHorz : wordVert;
                }
                else if(isIntersection && x == self.activeWordData.activeCellData.x && y == self.activeWordData.activeCellData.y) {
                    self.activeWordData.word = (self.activeWordData.word == wordHorz) ? wordVert : wordHorz;
                }

                self.activeWordData.definition = grid.wordCollection[self.activeWordData.word].definition;
                self.activeWordData.horzOrVert = (wordHorz == self.activeWordData.word) ? "horizontal" : "vertical";
                self.activeWordData.activeCellData.x = x;
                self.activeWordData.activeCellData.y = y;
            }

        }]);
})();