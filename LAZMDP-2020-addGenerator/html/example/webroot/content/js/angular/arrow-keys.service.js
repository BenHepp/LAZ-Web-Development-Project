(function () {
    "use strict";
    
    angular.module("crossword")
        .service('arrowKeys', ['userState', 'activeWord', function(userState, activeWord) {
            var self = this;
            var crosswordCopy = [];
            var crosswordSize = 0;
            var sizeSquared = 0;
            self.backspacePressed = false;
            self.letterBeforeSpace = "";

            function constructNewCellObj(id) {
                var col = id % crosswordSize;
                var row = (id - col) / crosswordSize;
                return {x: row, y: col, newEvent: document.getElementById(id)};
            }

            function getLetterFromID(id) {
                if(id < 0 || id >= sizeSquared) {
                    return null;
                }
                var col = id % crosswordSize;
                var row = (id - col) / crosswordSize;
                var letter = crosswordCopy[row][col].letter;
                return letter;
            }

            function isBorderCell(id, arrowKey) {
                var direction = (arrowKey == "up" || arrowKey == "down") ? "vertical" : "horizontal";
                if((id < crosswordSize || id >= sizeSquared - crosswordSize) && direction == "vertical") {
                    return true;
                }
                else if((id % crosswordSize == 0 || id % crosswordSize == crosswordSize - 1) && direction == "horizontal") {
                    return true;
                }
                return false;
            }

            function findNextAvailableCell(id, arrowKey, increment) {
                var nextID = id - (increment * -1); // work around concatenation issue
                if(isBorderCell(id, arrowKey) && isBorderCell(nextID, arrowKey)) {
                    return id;
                }
                while(getLetterFromID(nextID) == null) {
                    if(isBorderCell(nextID, arrowKey)) {
                        nextID = id;
                        break;
                    }
                    nextID += increment;
                }
                return nextID;
            }

            function getNewCell(currentCellID, arrowKey, increment) {
                var nextCellID = findNextAvailableCell(currentCellID, arrowKey, increment);
                return constructNewCellObj(nextCellID);
            }

            function backspace(event, newCell) {
                var id = event.target.id;
                var y = id % crosswordSize;
                var x = (id - y) / crosswordSize;
                if(event.target.value == "" || event.shiftKey) {
                    var startingWord = (activeWord.activeWordData.horzOrVert == "horizontal") ? crosswordCopy[x][y].horizontalWord: crosswordCopy[x][y].verticalWord;
                    newCell = (activeWord.activeWordData.horzOrVert == "horizontal") ? getNewCell(event.target.id, "left", -1): getNewCell(event.target.id, "up", crosswordSize * -1);
                    var endingWord = (activeWord.activeWordData.horzOrVert == "horizontal") ? crosswordCopy[newCell.x][newCell.y].horizontalWord : crosswordCopy[newCell.x][newCell.y].verticalWord;
                }
                if(startingWord != endingWord || newCell.newEvent == null) {
                    return {x: -1, y: -1, newEvent: null};
                }
                self.backspacePressed = (userState.dummyArr[newCell.x][newCell.y] == "") ? false : true;
                if(event.shiftKey && userState.dummyArr[newCell.x][newCell.y] != "") {
                    self.backspacePressed = true;
                }
                return newCell;
            }

            function space(event) {
                var id = event.target.id;
                var y = id % crosswordSize;
                var x = (id - y) / crosswordSize;

                if(activeWord.activeWordData.horzOrVert == "horizontal" && crosswordCopy[x][y].verticalWord != null) {
                    activeWord.initializeActiveWord(crosswordCopy[x][y].verticalWord);
                }
                else if(activeWord.activeWordData.horzOrVert == "vertical" && crosswordCopy[x][y].horizontalWord != null) {
                    activeWord.initializeActiveWord(crosswordCopy[x][y].horizontalWord);
                }
                self.letterBeforeSpace = "";
            }

            function enter(event, newCell){
                var id = event.target.id;
                var y = id % crosswordSize;
                var x = (id - y) / crosswordSize;
                var startingWord = (activeWord.activeWordData.horzOrVert == "horizontal") ? crosswordCopy[x][y].horizontalWord: crosswordCopy[x][y].verticalWord;
                newCell = (activeWord.activeWordData.horzOrVert == "horizontal") ? getNewCell(event.target.id, "right", 1): getNewCell(event.target.id, "down", crosswordSize);
                var endingWord = (activeWord.activeWordData.horzOrVert == "horizontal") ? crosswordCopy[newCell.x][newCell.y].horizontalWord : crosswordCopy[newCell.x][newCell.y].verticalWord;
                if(startingWord != endingWord || newCell.newEvent == null) {
                    return {x: -1, y: -1, newEvent: null};
                }
                return newCell;
            }
    
            self.findNewCell = function(event, crossword) {
                crosswordCopy = crossword;
                crosswordSize = crosswordCopy.length;
                sizeSquared = crosswordSize * crosswordSize;
                self.letterBeforeSpace = "0";
                
                var newCell = {x: -1, y: -1, newEvent: null};
                switch(event.keyCode){
                    case 37: //left arrow key
                        newCell = getNewCell(event.target.id, "left", -1);
                        break;
                    case 38: //Up arrow key
                        newCell = getNewCell(event.target.id, "up", crosswordSize * -1);
                        break;
                    case 39: //right arrow key
                        newCell = getNewCell(event.target.id, "right", 1);
                        break;
                    case 40: //down arrow key
                        newCell = getNewCell(event.target.id, "down", crosswordSize);
                        break;	
                    case 8: //backspace	
                        newCell = backspace(event, newCell);
                        break;
                    case 13: //enter
                        newCell = enter(event, newCell);
                        break;
                    case 32: //space
                        space(event);
                        break;
                } 
                var id = event.target.id;
                var y = id % crosswordSize;
                var x = (id - y) / crosswordSize;
                if(event.key == userState.userStateArr[x][y]) {
                    newCell = enter(event, newCell);
                    self.letterBeforeSpace = "";
                }
                return newCell.newEvent; 
            }
        }]);
})();