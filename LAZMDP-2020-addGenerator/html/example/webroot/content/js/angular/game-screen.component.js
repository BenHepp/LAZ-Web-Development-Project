(function () {
    "use strict";

    angular.module("crossword")
        .component("gameScreen", {
            templateUrl: "content/js/angular/game-screen.html",
            controller: "gameScreen"
        })
        .controller("gameScreen", ['orchestration', 'tutorial', 'grid',
            function GameScreenController(orchestration, tutorial, grid) {
                var ctrl = this;
                var greatJobAudio = "shared/sounds/greatJobYouFinishedAllTheWords.mp3";
                var victoryAudio = "shared/sounds/victory.mp3";
                var playedCompletedAudio = false;
                ctrl.isShowEnding = function () {
                    var showEnding = orchestration.isFinished() && !tutorial.isTutorial();
                    if(showEnding && !playedCompletedAudio) {
                        playedCompletedAudio = true;
                        var audio = new Audio(victoryAudio);
                        audio.play();
                        setTimeout(function () {
                            audio = new Audio(greatJobAudio);
                            audio.play();
                        }, 3);
                    }
                        
                    return showEnding;
                }

                // Missing loading functionality that exists in 
                // crossword grid component
                // var loading = true;
                // ctrl.isShowEnding()

                ctrl.clickPlayAgain = function () {
                    orchestration.setIsFinished(false);
                    ctrl.initCrosswordGame();
                }

                ctrl.initCrosswordGame = function () {
                    grid.getGameGrid().then(setGrid);
                }

                function setGrid(crossword) {
                    // ctrl.grid = crossword;
                    // loading = false;
                    orchestration.resetGameStateProgress();
                    orchestration.ON_PAGE_LOAD_setVariables();
                    // ctrl.userCrosswordState = orchestration.ON_PAGE_LOAD_setVariables();
                }
            }]);
})();