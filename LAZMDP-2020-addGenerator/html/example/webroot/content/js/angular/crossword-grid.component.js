(function () {
    "use strict";

    angular.module("crossword")
        .component("crosswordGrid", {
            templateUrl: "content/js/angular/crossword-grid.html",
            controller: "crosswordGrid",
        })
        .controller("crosswordGrid", ['orchestration', 'grid', 'tutorial', 'toolbar', '$timeout', 'STEPNUM',
            function CrosswordGridController(orchestration, grid, tutorial, toolbar, $timeout, STEPNUM) {
                var ctrl = this;

                ctrl.TUTORIALMODAL = STEPNUM.TUTORIALMODAL;
                ctrl.DEFINITIONBOX = STEPNUM.DEFINITIONBOX;
                ctrl.ENTERFIRSTWORD = STEPNUM.ENTERFIRSTWORD;
                ctrl.SWITCHVERTICAL = STEPNUM.SWITCHVERTICAL;
                ctrl.REMEMBERCLICK = STEPNUM.REMEMBERCLICK;
                ctrl.TUTORIALBUTTON = STEPNUM.TUTORIALBUTTON;

                // provider
                // save state in BACKEND (persistent api?)
                // accessibility: hint button
                ctrl.prevProgress = 0;
                ctrl.numWordsCorrect = 0;
                var correctWordAudio = new Audio("shared/sounds/correctWord.mp3")
                var amazingAudio = new Audio("shared/sounds/amazing.mp3");
                var goodJobAudio = new Audio("shared/sounds/goodJob.mp3");
                ctrl.grid = grid.crossword;
                ctrl.userCrosswordState = orchestration.userStateArr;

                var loading = true;
                ctrl.$onInit = function () {
                    if (tutorial.isTutorial) {
                        setGrid(grid.getTutorialGrid());
                    }
                    else {
                        grid.getGameGrid().then(setGrid);
                    }
                }

                ctrl.initCrosswordGame = function () {
                    grid.getGameGrid().then(setGrid);
                }

                function setGrid(crossword) {
                    // ctrl.grid = crossword;
                    loading = false;
                    orchestration.ON_PAGE_LOAD_setVariables();
                    // ctrl.userCrosswordState = orchestration.ON_PAGE_LOAD_setVariables();
                }

                ctrl.isSpecialCharacter = function (x, y) {
                    return grid.isSpecialCharacter(x, y);
                }

                ctrl.isTutorial = function () {
                    return tutorial.isTutorial();
                }

                ctrl.playTutorialAudio = function(){
                    tutorial.playAudio();
                }

                ctrl.clickNextStep = function () {
                    tutorial.incrementStepNum();
                    if (!tutorial.isTutorial()) {
                        if (!grid.isPlayingGame) {
                            console.log("init crosswordGame not playing game yet");
                            ctrl.initCrosswordGame();
                        }
                        else {
                            orchestration.transitionFromTutorialToGame();
                        }
                    }
                }

                ctrl.isShowHelpModal = function () {
                    return toolbar.showTutorialModal;
                }

                ctrl.clickTutorial = function () {
                    orchestration.transitionFromGameToTutorial();
                    toolbar.toggleTutorialModal();
                    tutorial.turnOnTutorial();
                    setGrid(grid.getTutorialGrid());
                }

                ctrl.clickBack = function () {
                    tutorial.decrementStepNum();
                }

                ctrl.clickSkip = function () {
                    ctrl.startGameEndTutorial();
                }

                ctrl.clickPlayGame = function () {
                    if (tutorial.isTutorial()) {
                        console.log("click play game")
                        toolbar.toggleTutorialModal();
                        ctrl.startGameEndTutorial();
                    }
                }

                ctrl.startGameEndTutorial = function () {
                    tutorial.turnOffTutorial();
                    console.log('isPlayingGame', grid.isPlayingGame);
                    if (!grid.isPlayingGame) {
                        console.log("init crosswordGame not playing game yet");
                        ctrl.initCrosswordGame();
                    }
                    else {
                        orchestration.transitionFromTutorialToGame();
                    }
                }

                ctrl.isLoading = function () {
                    if (!loading) {
                        return true;
                    }
                    return false;
                }

                ctrl.hideEmptyFields = function (cell) {
                    return !cell;
                }

                ctrl.isStepNum = function (num) {
                    return tutorial.isTutorial() && tutorial.getStepNum() == num;
                }

                ctrl.getInstructions = function () {
                    return tutorial.getInstructions();
                }

                ctrl.isTutorialCellHighlighted = function (x, y) {
                    let showCell = tutorial.isTutorialCellHighlighted(x, y);
                    return showCell;
                }

                ctrl.isTutorialCellHighlightedShadow = function (x, y) {
                    let showCell = tutorial.isTutorialCellWithHighlightedShadow(x, y)
                    return showCell;
                }

                //alert when word is correct
                //definition box: case of long definition
                ctrl.onChange = function (x, y) {
                    console.log(ctrl.userCrosswordState)
                    var obj = orchestration.onUserEdit(x, y, ctrl.userCrosswordState[x][y]);
                    ctrl.userCrosswordState[x][y] = obj.letter;
                    if (tutorial.isTutorial()) {
                        if (ctrl.isMemberOfSolvedWord(x, y)) {
                            $timeout(tutorial.incrementStepNum, 500);
                        }
                    }
                    else {
                        if (ctrl.prevProgress < obj.percent) {
                            ctrl.prevProgress = obj.percent;
                            correctWordAudio.play();
                            ctrl.numWordsCorrect++;
                            if (ctrl.numWordsCorrect % 2 == 0) {
                                setTimeout(function () {
                                    amazingAudio.play();
                                }, 3);
                            }
                            else {
                                setTimeout(function () {
                                    goodJobAudio.play();
                                }, 3);
                            }
                        }
                        if (obj.percent >= 100) {
                            orchestration.setIsFinished(true);
                            ctrl.prevProgress = 0;
                        }
                    }
                }

                ctrl.isMemberOfSolvedWord = function (x, y) {
                    return orchestration.STYLING_isMemberOfSolvedWord(x, y);
                }

                ctrl.isMemberOfClickedWord = function (x, y) {
                    return orchestration.STYLING_isMemberOfActiveWord(x, y);
                }

                ctrl.isMemberOfHintedWord = function (x, y) {
                    return orchestration.STYLING_isMemberOfHintedWord(x, y);
                }

                ctrl.isWrongLetterOfCompletedWord = function (x, y) {
                    return orchestration.STYLING_isWrongLetterOfCompletedWord(x, y);
                }

                ctrl.highlightCorrespondingClickedWord = function (x, y, event) {
                    if (tutorial.isTutorial) {
                        var completedStepThree = tutorial.automateStepThree(x, y);
                        if (completedStepThree) {
                            orchestration.onClick_adjustActiveWord(x, y);
                        }
                    }
                    orchestration.onClick_adjustActiveWord(x, y);
                }

                ctrl.selectInput = function (event) {
                    selectText(event.target.id);
                }

                ctrl.arrowKeyPressed = function (keyEvent) {
                    var newEvent = orchestration.onArrowKey_adjustActiveWord(keyEvent);
                    if (newEvent) {
                        document.getElementById(newEvent.id).focus();
                        selectText(newEvent.id);
                    }
                }

                ctrl.onFocus = function (event) {
                    orchestration.setActiveCelltoActiveWord(event.target.id);
                }

                function selectText(id) {
                    setTimeout(function () {
                        document.getElementById(id).select();
                    }, 1);
                }

            }
        ]);
})();
