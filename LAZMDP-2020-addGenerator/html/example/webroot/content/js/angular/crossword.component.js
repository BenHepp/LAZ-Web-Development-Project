(function () {
    "use strict";

    angular.module("crossword")
        .component("crossword", {
            templateUrl: "content/crossword.html",
            controller: "crossword"
        })
        .controller("crossword", ['orchestration', 
            function GameScreenController(orchestration) {
                var ctrl = this;
                ctrl.getOpacity = function () {
                    var progress = orchestration.getProgress();
                    var percentOpacity = 1 - (progress / 100);
                    return percentOpacity;
                }
            }]);
})();