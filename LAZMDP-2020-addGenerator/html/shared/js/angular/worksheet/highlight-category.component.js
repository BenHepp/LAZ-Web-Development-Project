(function () {
    'use strict';

    angular.module('shared.worksheet')

        .component('highlightCategory', {
            templateUrl: '/shared/js/angular/worksheet/highlight-category.html',
            controller: 'HighlightCategoryController',
            bindings: {
                questionData: '<',
                studentAnswers: '<',
                isLastQuestion: '<'
            }
        })

        .controller('HighlightCategoryController', ['worksheetService', 'worksheetActivityCompletion', 'worksheetUtils', '$sce', '$timeout',
            function (worksheetService, worksheetActivityCompletion, worksheetUtils, $sce, $timeout) {
                var ctrl = this;
                ctrl.selectCategoryMarkup = {};
                var numTargets = 0;
                ctrl.correctAnswers = [];
                ctrl.isPerfectScore = false;
                ctrl.isAttemptTwo = false;
                ctrl.passage = '';
                ctrl.hasStudentMarkedUpElt = false;

                ctrl.$onInit = function () {
                    ctrl.skipAutoGrade = ctrl.questionData.skipAutoGrade;
                    ctrl.selectCategoryMarkup.division = ctrl.questionData.division;
                    ctrl.isWordLayout = ctrl.questionData.isWord;
                    ctrl.selectCategoryMarkup.choiceDisplay = ctrl.questionData.answerkey[0].display;

                    if (ctrl.questionData.sentences) {
                        ctrl.selectCategoryMarkup.division = 'word';
                        ctrl.selectCategoryMarkup.isPassage = false;
                        ctrl.sentences = ctrl.questionData.sentences.map(function (sentence, index) {
                            return {
                                'sentence': worksheetUtils.splitTextByWord(sentence.sentence_text, index).map(function (fragment) {
                                    return $sce.trustAsHtml(fragment);
                                }),
                                'sentence_id': sentence.sentence_id
                            };
                        });
                        ctrl.selectCategoryMarkup.sentences = ctrl.sentences;
                    } else {
                        ctrl.selectCategoryMarkup.isPassage = true;
                        ctrl.selectCategoryMarkup.passage = ctrl.getPassage();
                    }

                    ctrl.answerBank = angular.copy(ctrl.questionData.answerkey);
                    ctrl.selectedItems = _.range(numTargets).map(function (c) {
                        return {'answers': [{'item': undefined}]};
                    });

                    //ctrl.readOnly = worksheetService.getReadOnly();
                    ctrl.isPreview = worksheetService.getIsPreview();
                    ctrl.autoRegenerate = ctrl.questionData.autoRegenerate;

                    $timeout(function () {
                        ctrl.establishPrepopulatedItems();
                        if (worksheetService.getReadOnly()) {
                            ctrl.populateCorrectAnswers();
                        }
                    }, 150);

                    ctrl.selectCategoryMarkup.markupDisplayTypes = [];
                    ctrl.selectCategoryMarkup.displayTypeIdToDisplay = [];
                    _.each(ctrl.questionData.answerkey, function (answerOption) {
                        if (ctrl.selectCategoryMarkup.markupDisplayTypes.indexOf(answerOption.display) == -1) {
                            ctrl.selectCategoryMarkup.markupDisplayTypes.push({
                                'display': answerOption.display,
                                'display_type_id': answerOption.display_type_id
                            });
                            ctrl.selectCategoryMarkup.displayTypeIdToDisplay[answerOption.display_type_id] = answerOption.display;
                        }
                    });

                    ctrl.selectCategoryMarkup.sentenceIdToIndex = [];
                    _.each(ctrl.questionData.sentences, function (sentence, idx) {
                        ctrl.selectCategoryMarkup.sentenceIdToIndex[sentence.sentence_id] = idx;
                    });

                    if (ctrl.selectCategoryMarkup.isPassage) {
                        ctrl.possiblePoints = ctrl.questionData.choices.filter(function(choice) { return !choice.prepopulate; }).length;
                    } else {
                        ctrl.possiblePoints = ctrl.sentences.length;
                    }
                    console.log("POSSIBLE: " + ctrl.possiblePoints);

                    if (ctrl.studentAnswers) {
                        // TODO (Alex B): Implement a promise
                        $timeout(function () {
                            ctrl.drawStudentAnswers();
                        }, 150);
                    }
                };

                ctrl.populateCorrectAnswers = function () {
                    return worksheetUtils.populateCorrectAnswersForSelectHighlight(angular.copy(ctrl.questionData.choices), ctrl.selectCategoryMarkup.isPassage, ctrl.selectCategoryMarkup.division);
                };

                ctrl.getIsSelectable = function () {
                    return worksheetUtils.getIsDraggable(worksheetService.getReadOnly(), ctrl.isPerfectScore, ctrl.isAttemptTwo);
                };

                ctrl.getReadOnly = function() {
                    return worksheetService.getReadOnly();
                };

                ctrl.getPassage = function () {
                    if (ctrl.selectCategoryMarkup.division == 'word') {
                        return worksheetUtils.splitTextByWord($sce.getTrustedHtml(ctrl.questionData.passage.text), undefined).map(function (fragment) {
                            return $sce.trustAsHtml(fragment);
                        });
                    }
                    return worksheetUtils.splitBySentence($sce.getTrustedHtml(ctrl.questionData.passage.text)).map(function (fragment) {
                        return $sce.trustAsHtml(fragment);
                    });
                };

                ctrl.getPrepopulatedSuperScriptIndex = function () {
                    return worksheetUtils.getPrepopulatedSuperScriptIndex(angular.copy(ctrl.questionData.choices));
                };

                ctrl.establishPrepopulatedItems = function () {
                    worksheetUtils.establishSelectHighlightPrepopulatedItems(angular.copy(ctrl.questionData.choices), ctrl.selectCategoryMarkup.isPassage, ctrl.selectCategoryMarkup.division);
                };

                ctrl.changeDisplay = function (display, index) {
                    if (ctrl.getIsSelectable()) {
                        angular.element(ctrl.choiceDisplay).removeClass('is-selected');
                        angular.element(display).addClass('is-selected');
                        ctrl.selectCategoryMarkup.choiceDisplay = display;
                        if (ctrl.isSuperscript(display)) {
                            ctrl.selectCategoryMarkup.choiceIndex = index;
                        }
                    }
                };

                ctrl.isSuperscript = function (display) {
                    if (display == 'superscript') {
                        return true;
                    }
                    return false;
                };

                ctrl.determineChoiceSelected = function (displaySelected, currentIndex) {
                    if (ctrl.getIsSelectable()) {
                        if (ctrl.isSuperscript(displaySelected)) {
                            if (ctrl.selectCategoryMarkup.choiceIndex == undefined) {
                                ctrl.selectCategoryMarkup.choiceIndex = 0;
                            }
                            return (ctrl.selectCategoryMarkup.choiceIndex == currentIndex);
                        }
                        return (ctrl.selectCategoryMarkup.choiceDisplay == displaySelected);
                    }
                };

                ctrl.getDisplayIndex = function () {
                    if (ctrl.selectCategoryMarkup.choiceIndex == undefined) {
                        ctrl.selectCategoryMarkup.choiceIndex = 1;
                    }
                    return ctrl.selectCategoryMarkup.choiceIndex + 1;
                };

                ctrl.getElementIdStartName = function () {
                    if (ctrl.selectCategoryMarkup.division === 'sentence') {
                        return 'highlight-sentence-';
                    } else if (ctrl.selectCategoryMarkup.division === 'word') {
                        return 'highlight-word-';
                    }
                };

                ctrl.hasStudentMarkedUp = function () {
                     _.each(angular.element('span .dummy-highlight'), function (elt) {
                        elt = angular.element(elt);
                        _.find(ctrl.selectCategoryMarkup.markupDisplayTypes, function (displayType) {
                            if (elt.hasClass('display-' + displayType.display) &&
                                !elt.hasClass('js-answer-bank') &&
                                !elt.hasClass('display-' + displayType.display + '-is-prepopulated')) {
                                console.log("Returning true");
                                ctrl.hasStudentMarkedUpElt = true;
                                return true;
                            }
                        });
                    });
                };

                ctrl.drawStudentAnswers = function () {
                    var attemptNumber = ctrl.studentAnswers.attemptNumber;
                    ctrl.isAttemptTwo = attemptNumber == 2 ? true : false;
                    var displayTypes = ctrl.selectCategoryMarkup.markupDisplayTypes.map(function(m) { return m.display; });
                    ctrl.correctPoints = worksheetUtils.drawStudentAnswersAndScoreForHighlightQuestion(
                        ctrl.studentAnswers, ctrl.isAttemptTwo, ctrl.questionData.choices, displayTypes,
                        ctrl.getElementIdStartName(), ctrl.selectCategoryMarkup.division, ctrl.selectCategoryMarkup.isPassage,
                        ctrl.sentences, ctrl.selectCategoryMarkup.displayTypeIdToDisplay, ctrl.selectCategoryMarkup.sentenceIdToIndex
                    );
                    ctrl.isPerfectScore = ctrl.possiblePoints >= 0 && ctrl.correctPoints == ctrl.possiblePoints;
                    ctrl.studentAnswers.isPerfectScore = ctrl.isPerfectScore;
                    ctrl.studentAnswers.correctPoints = ctrl.correctPoints;
                    ctrl.studentAnswers.possiblePoints = ctrl.possiblePoints;
                };

                ctrl.gradeWorksheetQuestion = function () {
                    return ctrl.gradeHighlightCategoryWorksheetQuestion();
                };

                ctrl.initGrade = function() {
                    ctrl.studentAnswers = ctrl.buildStudentAnswersStructure();
                    ctrl.drawStudentAnswers();
                };

                ctrl.evaluateResults = function(data) {
                    return ctrl.studentAnswers.isPerfectScore;
                };


                ctrl.gradeHighlightCategoryWorksheetQuestion = function () {
                    ctrl.initGrade();
                    return worksheetActivityCompletion.evaluateStudentAnswers(ctrl.studentAnswers, ctrl.questionData.index)
                        .then(function (data) {
                            // Grading is done client side, nothing else to do
                            return ctrl.evaluateResults(data);
                        });
                };

                ctrl.buildStudentAnswersStructure = function () {
                    var elementIdStartName = ctrl.getElementIdStartName();

                    if (!ctrl.studentAnswers) {
                        ctrl.studentAnswers = {};
                        ctrl.studentAnswers['attemptNumber'] = 1;
                    } else {
                        ctrl.studentAnswers['attemptNumber'] = 2;
                    }

                    ctrl.studentAnswers['attempt'] = {};
                    ctrl.studentAnswers['attempt'][ctrl.studentAnswers['attemptNumber']] = {};
                    var displayTypesObjs = {};
                    _.each(ctrl.selectCategoryMarkup.markupDisplayTypes, function (displayTypeData) {
                        var displayType = displayTypeData.display;
                        var displayTypeId = parseInt(displayTypeData.display_type_id);
                        var displayTypeObj = [];

                        // Get the number of highlightCategory_sentences... if there are none, it's a passage aka one 'sentence'
                        var totalSentences = angular.element('.js-highlightCategory_sentence').length || 1;
                        var foundStartOfRange = false;
                        var foundEndOfRange = false;

                        for (var sentenceIndex = 0; sentenceIndex < totalSentences; sentenceIndex++) {
                            var currentEltIndex = 0;
                            var startRange = 0;
                            var endRange = 0;
                            var superscript = 0;
                            var totalElts = 0;

                            if (ctrl.selectCategoryMarkup.division === 'sentence') {
                                totalElts = angular.element('span[id^="' + elementIdStartName +'"]').length;
                            } else {
                                if (ctrl.selectCategoryMarkup.isPassage) {
                                    totalElts = angular.element('span[id^="'+elementIdStartName + sentenceIndex + '"]').length;
                                } else {
                                    // Elements per sentence
                                    totalElts = angular.element('.js-highlightCategory_sentence span[id^="'+elementIdStartName + sentenceIndex + '"]').length;
                                }
                            }
                            while (currentEltIndex <= totalElts) {
                                var currentElt = worksheetUtils.getElt(ctrl.selectCategoryMarkup.division, elementIdStartName, sentenceIndex, currentEltIndex);

                                if (currentElt.hasClass('display-' + displayType + '-is-prepopulated')) {
                                    ++currentEltIndex;
                                    continue;
                                }
                                if (currentElt.hasClass('display-' + displayType)) {
                                    if (!foundStartOfRange) {
                                        startRange = currentEltIndex;
                                        foundStartOfRange = true;
                                        superscript = displayType === 'superscript' ? parseInt(currentElt.find('sup').html()) : 1;
                                    }
                                } else if (foundStartOfRange) {
                                    endRange = currentEltIndex - 1;
                                    foundEndOfRange = true;
                                }

                                if (foundStartOfRange && foundEndOfRange) {
                                    foundStartOfRange = false;
                                    foundEndOfRange = false;
                                    displayTypeObj.push({
                                        'start_position': startRange,
                                        'end_position': endRange,
                                        'display_order': superscript,
                                        'display_type_id': displayTypeId,
                                        'sentence_id': ctrl.sentences ? ctrl.sentences[sentenceIndex].sentence_id : null
                                    });
                                }
                                currentEltIndex++;
                            }
                            displayTypesObjs[displayType] = displayTypeObj;
                        }
                    });
                    ctrl.studentAnswers['attempt'][ctrl.studentAnswers['attemptNumber']]['displayType'] = displayTypesObjs;
                    return ctrl.studentAnswers;
                };

            }]);
})();
