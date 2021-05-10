(function () {
    "use strict";

    angular.module("crossword")
        .service('userState', ['grid', function (grid) {
            var self = this;
            self.userStateArr = [];
            self.dummyArr = [];

            var prevUserStateArr = [];

            self.initializeUserStateArrays = function (size) {
                console.log('before spliced', self.userStateArr);
                if (self.userStateArr.length > 0) {
                    self.userStateArr.splice(0, self.userStateArr.length);
                    console.log('spliced', self.userStateArr);
                }
                for (var row = 0; row < size; ++row) {
                    self.userStateArr[row] = [];
                    self.dummyArr[row] = [];
                    for (var col = 0; col < size; ++col) {
                        if (grid.isSpecialCharacter(row, col)) {
                            self.userStateArr[row][col] = grid.crossword[row][col].letter;
                            self.dummyArr[row][col] = grid.crossword[row][col].letter;
                        }
                        else {
                            self.userStateArr[row][col] = '';
                            self.dummyArr[row][col] = '';
                        }
                    }
                }
            }

            self.updateUserState = function (x, y, letter) {
                self.userStateArr[x][y] = letter;
            }

            self.saveGameStateProgress = function () {
                console.log('user state arr',  self.userStateArr);
                prevUserStateArr = self.userStateArr.slice(0);
                console.log('prev user state arr',  prevUserStateArr);
            }

            self.returnToGameStateProgress = function () {
                if (self.userStateArr.length > 0) {
                    self.userStateArr.splice(0, self.userStateArr.length);
                    console.log('spliced tutorial', self.userStateArr);
                }
                console.log('prev user state arr', prevUserStateArr);
                console.log('grid crossword', grid.crossword);
                for (var row = 0; row < prevUserStateArr.length; ++row) {
                    self.userStateArr[row] = [];
                    self.dummyArr[row] = [];
                    for (var col = 0; col < prevUserStateArr[row].length; ++col) {
                        if (grid.isSpecialCharacter(row, col)) {
                            self.userStateArr[row][col] = prevUserStateArr[row][col];
                            self.dummyArr[row][col] = prevUserStateArr[row][col];
                        }
                        else {
                            self.userStateArr[row][col] = prevUserStateArr[row][col];
                            self.dummyArr[row][col] = prevUserStateArr[row][col];
                        }
                    }
                }

            }
        }]);
})();