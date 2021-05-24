(function () {
    "use strict";

    angular.module("crossword")
        .component("toolbar", {
            templateUrl: "content/js/angular/toolbar.html",
            controller: "toolbar"
        })
        .controller("toolbar", ['orchestration', 'tutorial', 'toolbar', 'STEPNUM', 'grid', 'validateInput', 'activeWord',
            function ToolbarController(orchestration, tutorial, toolbar, STEPNUM, grid, validateInput, activeWord) {
                var ctrl = this;
                var clicked = false;

                ctrl.totalHints = 0;
                ctrl.remainingHints = 0;

                ctrl.TUTORIALBUTTON = STEPNUM.TUTORIALBUTTON;
                
                ctrl.clickHint = function () {
                    clicked = true;
                    // if (ctrl.remainingHints > 0) {
                    orchestration.setHintedWord();
                        // --ctrl.remainingHints;
                    // }
                    validateInput.updateCompletedWordsSet(activeWord.activeWordData.word);
                }

                ctrl.clickTutorial = function () {
                    toolbar.toggleTutorialModal();
                    orchestration.saveGameStateProgress();
                }

                ctrl.isTutorial = function () {
                    return tutorial.isTutorial();
                }

                ctrl.getRemainingHints = function () {
                    return ctrl.remainingHints;
                }

                ctrl.getTotalHints = function () {
                    ctrl.totalHints = orchestration.getMaxHints();
                    if (!clicked) {
                        ctrl.remainingHints = ctrl.totalHints;
                    }
                    return ctrl.totalHints;
                }

                ctrl.getProgress = function() {
                    return orchestration.getProgress();
                }
                
                ctrl.getOpacity = function() {
                    var percentOpacity = 1 - (orchestration.getProgress()/100);
                    return percentOpacity;
                }

                ctrl.isStepNum = function(num) { 
                    return tutorial.isTutorial() && tutorial.getStepNum() == num;
                }

                ctrl.getInstructions = function() {
                    return tutorial.getInstructions();
                }



                }]);

}) ();