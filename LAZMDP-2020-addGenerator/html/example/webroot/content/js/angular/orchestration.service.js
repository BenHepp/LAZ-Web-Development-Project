(function () {
    "use strict";

    angular.module("crossword")
        .service('orchestration', ['grid', 'userState', 'validateInput', 'saveState',
            'activeWord', 'arrowKeys', 'cleanInput', 'autoFocus', 'tutorial',
            function (grid, userState, validateInput, saveState, activeWord,
                arrowKeys, cleanInput, autoFocus, tutorial) {
                var self = this;

                var prevPercentFinished = 0;
                var percentFinished = 0;
                var prevPercentFinishedGameState = 0;
                var percentFinishedGameState = 0;
                var mermaidSays = "";

                var isCrosswordFinished = false;

                self.userStateArr = userState.userStateArr;

                self.transitionFromGameToTutorial = function () {
                    self.saveGameStateProgress();
                    self.resetGameStateProgress();
                }

                self.resetGameStateProgress = function () {
                    validateInput.clearSolvedWords();
                    percentFinished = 0;
                    prevPercentFinished = 0;
                }

                self.saveGameStateProgress = function () {
                    prevPercentFinishedGameState = prevPercentFinished;
                    percentFinishedGameState = percentFinished;
                    validateInput.saveGameStateProgress();
                    userState.saveGameStateProgress();
                    grid.saveGameStateProgress();
                }

                self.returnToGameStateProgress = function () {
                    prevPercentFinished = prevPercentFinishedGameState;
                    percentFinished = percentFinishedGameState;
                    grid.returnToGameStateProgress();
                    validateInput.returnToGameStateProgress();
                    userState.returnToGameStateProgress();
                }

                self.transitionFromTutorialToGame = function () {
                    // validateInput.returnToGameStateProgress();
                    self.returnToGameStateProgress();
                }

                self.setIsFinished = function (finished) {
                    isCrosswordFinished = finished;
                }
                self.isFinished = function () {
                    return isCrosswordFinished;
                }

                self.getProgress = function () {
                    return percentFinished;
                }

                self.mermaidSpeech = function () {
                    return mermaidSays;
                }
                // var inited = true;
                self.ON_PAGE_LOAD_setVariables = function () {
                    console.log("PAGE LOADED");
                    // validateInput.clearSolvedWords();
                    validateInput.initializeWrongLetterStateArr(grid.crosswordSize);
                    // if (inited) {
                    //     inited = false;
                    // }
                    // else {
                    //     userState.initializeUserStateArrays(grid.crosswordSize);
                    // }
                    percentFinished = 0;
                    prevPercentFinished = 0;
                    userState.initializeUserStateArrays(grid.crosswordSize);
                    saveState.initializeSaveStateArr(grid.crosswordSize);
                    saveState.initializeDb(userState.userStateArr, grid.crossword, grid.crosswordSize); //grid.crossword
                    if (tutorial.isTutorial()) {
                        activeWord.initializeActiveWord("black");
                    }
                    else {
                        activeWord.initializeActiveWord(Object.keys(grid.wordCollection)[0]);
                    }
                    return userState.dummyArr;
                }

                self.STYLING_isMemberOfSolvedWord = function (x, y) {
                    return validateInput.isMemberOfSolvedWord(x, y, grid.crossword);
                }

                self.STYLING_isMemberOfActiveWord = function (x, y) {
                    return activeWord.isMemberOfActiveWord(x, y);
                }

                self.STYLING_isMemberOfHintedWord = function (x, y) {
                    return validateInput.isMemberOfHintedWord(x, y);
                }

                self.STYLING_isWrongLetterOfCompletedWord = function (x, y) {
                    return validateInput.isWrongLetterOfCompletedWord(x, y, grid.crossword);
                }

                self.onUserEdit = function (x, y, letter) {
                    letter = cleanInput.cleanUserInput(letter);
                    validateInput.removeFromHintedWords(x, y);
                    if (arrowKeys.backspacePressed == false && arrowKeys.letterBeforeSpace != "") {
                        var newCell = autoFocus.setFocusOnNextCell(x, y, letter);
                        console.log("newcell", newCell['x'], newCell['y']);
                        if (self.STYLING_isMemberOfSolvedWord(newCell['x'], newCell['y'])) {
                            autoFocus.setFocusOnNextCell(newCell['x'], newCell['y'], letter);
                        }
                        userState.updateUserState(x, y, letter);
                    }
                    arrowKeys.backspacePressed = false;
                    validateInput.checkForValidWords(x, y, grid.crossword);
                    saveState.takeUserSnapshot(grid.crosswordSize, userState.userStateArr);
                    saveState.saveCurrentUserState(userState.userStateArr, grid.crossword, grid.crosswordSize);

                    //if student has finished the puzzle
                    console.log("grid word: ", grid.numWordsInPuzzle);
                    console.log("validateInput: ", validateInput.getCompletedWordsSetSize());
                    if (grid.numWordsInPuzzle == validateInput.getCompletedWordsSetSize()) {
                        saveState.saveFinishedPuzzle(userState.userStateArr);
                    }

                    percentFinished = validateInput.numCompletedChars / grid.totalNumChars * 100;
                    if (percentFinished > prevPercentFinished && percentFinished != 100) {
                        mermaidSays = "Good job!";
                        prevPercentFinished = percentFinished;
                    }
                    else {
                        mermaidSays = "You got this!";
                    }
                    //progress.onChange(percentFinished);
                    return { letter: userState.userStateArr[x][y], percent: percentFinished };
                }

                self.onClick_adjustActiveWord = function (x, y) {
                    activeWord.adjustActiveWord(x, y);
                }

                self.onArrowKey_adjustActiveWord = function (event) {
                    return arrowKeys.findNewCell(event, grid.crossword, activeWord.activeWordData);
                }

                self.onDefBoxUp_setActiveWord = function () {
                    var nextWord = grid.wordCollection_findNextWord(activeWord.activeWordData.word);
                    activeWord.initializeActiveWord(nextWord);
                }

                self.onDefBoxDown_setActiveWord = function () {
                    var prevWord = grid.wordCollection_findPrevWord(activeWord.activeWordData.word);
                    activeWord.initializeActiveWord(prevWord);
                }

                self.defBox_getActiveDef = function () {
                    return activeWord.activeWordData.definition;
                }

                self.getMaxHints = function () {
                    return Math.ceil(Object.keys(grid.wordCollection).length / 2);
                }

                self.setHintedWord = function () {
                    console.log("set hinted word", activeWord.activeWordData.word);
                    validateInput.correctFirstWrongLetterInActiveWord(activeWord.activeWordData.word);
                    // validateInput.addCellsToHintedSet(activeWord.activeWordData.word);
                }

                self.setActiveCelltoActiveWord = function (id) {
                    var col = id % grid.crosswordSize;
                    var row = (id - col) / grid.crosswordSize;
                    if (grid.crossword[row][col].horizontalWord != activeWord.activeWordData.word && grid.crossword[row][col].verticalWord != activeWord.activeWordData.word) {
                        activeWord.adjustActiveWord(row, col);
                    }
                }

            }]);
})();