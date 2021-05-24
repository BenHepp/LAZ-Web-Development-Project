(function () {
    "use strict";
    
    angular.module("crossword")
        .factory('wordInfo', function() {
            function wordInfo(word){
                this.definition = word.definition;
                this.startRow = word.startLocation.row;
                this.startCol = word.startLocation.col;
                this.endRow = word.endLocation.row;
                this.endCol = word.endLocation.col;
                this.id = word.id;
            }
            return wordInfo;
        });
})();