(function () {
    "use strict";
    
    angular.module("crossword")
        .service('autoFocus', ['grid', 'activeWord', function(grid, activeWord) {
            var self = this;

            self.setFocusOnNextCell = function(x, y, letter) {
                var id = (x * grid.crosswordSize) + y;
                var x = x;
                var y = y;
                if(letter && activeWord.activeWordData.horzOrVert == "horizontal" && y+1 < grid.crosswordSize && grid.crossword[x][y+1].letter != "") {
                    ++id;
                    document.getElementById(id).focus();
                    document.getElementById(id).select();
                    y = y + 1;
                }
                else if(letter && activeWord.activeWordData.horzOrVert == "vertical" && x+1 < grid.crosswordSize && grid.crossword[x+1][y].letter != "") {
                    id += grid.crosswordSize;
                    document.getElementById(id).focus();
                    document.getElementById(id).select();
                    x = x + 1;
                }
                var cell = {x: x, y: y};
                return cell;
            }

    }]);
})();