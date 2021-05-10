(function () {
    'use strict';

    angular.module('shared.worksheet')

        .component('fillInTheBlanks', {
            templateUrl: '/shared/js/angular/worksheet/fill-in-the-blanks.html',
            controller: 'FillInTheBlanksController',
            bindings: {
                questionData: '<',
                studentAnswers: '<',
                isLastQuestion: '<'
            }
        })

        .controller('FillInTheBlanksController', ['worksheetService', 'worksheetActivityCompletion', 'worksheetUtils', '$sce',
            function (worksheetService, worksheetActivityCompletion, worksheetUtils, $sce) {
                var ctrl = this;
                var numTargets = 0;
                ctrl.BLANK_TOKEN = '::blank::';
                ctrl.DRAG_AND_DROP = 'dragAndDrop';
                ctrl.DRAG_AND_REPLACE = 'dragAndReplace';
                ctrl.dragAndDrop = {};
                ctrl.dragAndReplace = {};
                ctrl.dragAndDrop.droppedItems = [];
                ctrl.dragAndReplace.items = [];
                ctrl.correctAnswers = [];
                ctrl.isPerfectScore = false;
                ctrl.isAttemptTwo = false;
                ctrl.currentDragTarget = 0;

                ctrl.$onInit = function () {
                    ctrl.skipAutoGrade = ctrl.questionData.skipAutoGrade;
                    ctrl.mode = ctrl.questionData.dragAndReplace === true ? ctrl.DRAG_AND_REPLACE : ctrl.DRAG_AND_DROP;
                    ctrl.division = ctrl.questionData.division;
                    ctrl.isWordLayout = ctrl.questionData.isWord;

                    if (ctrl.mode === ctrl.DRAG_AND_REPLACE) {
                        ctrl.dragAndReplace.items = angular.copy(ctrl.questionData.choices);
                    }

                    ctrl.sentences = ctrl.questionData.sentences.map(function (sentence) {
                        return {
                            'sentence': sentence,
                            'fragments': sentence.sentence_text.split(new RegExp('(' + ctrl.BLANK_TOKEN + ')')).map(function (fragment) {
                                if (fragment === ctrl.BLANK_TOKEN) {
                                    ++numTargets;
                                    if (ctrl.mode === ctrl.DRAG_AND_REPLACE) {
                                        return {'tokens': ctrl.BLANK_TOKEN, 'dragTarget': ctrl.getCurrentDragTarget(), 'answerId': ctrl.getItem(numTargets).answer_id};
                                    } else {
                                        return {'tokens': ctrl.BLANK_TOKEN, 'dragTarget': ctrl.getCurrentDragTarget()};
                                    }
                                } else {
                                    return {'tokens': $sce.trustAsHtml(fragment), 'dragTarget': null, 'answerId': null};
                                }
                            })
                        };
                    });

                    if (ctrl.mode === ctrl.DRAG_AND_DROP) {
                        ctrl.dragAndDrop.answerBank = angular.copy(ctrl.questionData.choices);
                        ctrl.dragAndDrop.droppedItems = _.range(numTargets).map(function (c) {
                            return {'answers': [{'item': undefined}]};
                        });
                        ctrl.establishPrepopulatedItemsForDragAndDrop();
                    }

                    //ctrl.readOnly = worksheetService.getReadOnly();
                    ctrl.isPreview = worksheetService.getIsPreview();
                    ctrl.dragAndDrop.autoRegenerate = ctrl.questionData.autoRegenerate;
                    if (worksheetService.getReadOnly()) {
                        if (ctrl.mode === ctrl.DRAG_AND_DROP) {
                            ctrl.correctAnswers = ctrl.populateCorrectAnswersForDragAndDrop();
                            ctrl.dragAndDrop.droppedItems = ctrl.correctAnswers;
                        } else {
                            ctrl.correctAnswers = ctrl.populateCorrectAnswersForDragAndReplace();
                            ctrl.dragAndReplace.items = ctrl.correctAnswers;
                        }
                    }

                    if (ctrl.studentAnswers) {
                        ctrl.drawStudentAnswers();
                    }
                };

                ctrl.getCurrentDragTarget = function () {
                    ctrl.currentDragTarget++;
                    return ctrl.currentDragTarget;
                };

                ctrl.getItem = function (dragTarget) {
                    if (dragTarget === null) {
                        return undefined;
                    }
                    var index = dragTarget - 1;

                    if (ctrl.mode === ctrl.DRAG_AND_DROP) {
                        return ctrl.dragAndDrop.droppedItems[index].answers[0].item;
                    } else {
                        return ctrl.dragAndReplace.items[index];
                    }
                };

                ctrl.isEmptyTarget = function (dragTarget) {
                    if (ctrl.getItem(dragTarget) === undefined) {
                        return true;
                    }
                    return !ctrl.getItem(dragTarget).answer;
                };

                ctrl.establishPrepopulatedItemsForDragAndDrop = function () {
                    worksheetUtils.establishPrepopulatedItems(ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.droppedItems, ctrl.skipAutoGrade)
                };

                ctrl.populateCorrectAnswersForDragAndDrop = function () {
                    ctrl.cloneNewSentencesBasedOnPermutations();
                    return worksheetUtils.populateCorrectAnswersForDragAndDrop(angular.copy(ctrl.questionData.choices), ctrl.correctAnswers, ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.autoRegenerate);
                };

                ctrl.populateCorrectAnswersForDragAndReplace = function () {
                    ctrl.cloneNewSentencesBasedOnPermutations();
                    return worksheetUtils.populateCorrectAnswersForDragAndReplace(ctrl.dragAndReplace.items);
                };

                ctrl.cloneNewSentencesBasedOnPermutations = function () {
                    // Map of sentence ids to how many duplicates should be reflected
                    var sentenceIdsWithMultipleTargetTypesToNumberClones = [];
                    var sentenceIdToPermutations = {};
                    _.each(ctrl.questionData.choices, function (choice) {
                        if (choice.multiple_target_type === 'or') {
                            var permutations = ctrl.createAllPossiblePermutations(angular.copy(choice.drag_target));
                            sentenceIdToPermutations[choice.sentence_ids[0]] = permutations;
                            if (!sentenceIdsWithMultipleTargetTypesToNumberClones[choice.sentence_ids[0]]) {
                                sentenceIdsWithMultipleTargetTypesToNumberClones[choice.sentence_ids[0]] = permutations.length;
                            }
                        }
                    });

                    // For all the sentences
                    var sentence_index = 0;
                    while (sentence_index < ctrl.sentences.length) {
                        var sentence_id = parseInt(ctrl.sentences[sentence_index].sentence.sentence_id);
                        var permutations = sentenceIdToPermutations[sentence_id];
                        var numSentenceClonesForSentenceId = sentenceIdsWithMultipleTargetTypesToNumberClones[sentence_id];
                        if (numSentenceClonesForSentenceId) {
                            for (var i = 0; i < numSentenceClonesForSentenceId - 1; ++i) {
                                var sentenceObj = angular.copy(ctrl.sentences[sentence_index]);

                                // Set up drag target permutations
                                var dragTargetIndexInPermutation = 0;
                                _.each(sentenceObj.fragments, function (fragment) {
                                    // If it is a blank, and its current drag target is one that needs to be permuted
                                    if (fragment.tokens === ctrl.BLANK_TOKEN && permutations[i + 1].indexOf(fragment.dragTarget) > -1) {
                                        fragment.dragTarget = permutations[i + 1][dragTargetIndexInPermutation];
                                        ++dragTargetIndexInPermutation;
                                    }
                                });
                                ctrl.sentences.splice(sentence_index, 0, sentenceObj);
                                ++sentence_index;
                            }
                        }
                        ++sentence_index;
                    }
                };

                ctrl.createAllPossiblePermutations = function (permutation) {
                    var length = permutation.length;
                    var result = [permutation.slice()];
                    var c = ctrl.getZeroFilledArray(length);
                    var i = 1, k, p;

                    // Heap's Algorithm
                    while (i < length) {
                        if (c[i] < i) {
                            k = i % 2 && c[i];
                            p = permutation[i];
                            permutation[i] = permutation[k];
                            permutation[k] = p;
                            ++c[i];
                            i = 1;
                            result.push(permutation.slice());
                        } else {
                            c[i] = 0;
                            ++i;
                        }
                    }
                    return result;
                };

                ctrl.getZeroFilledArray = function (length) {
                    var zeroes = [];
                    var i = 0;
                    zeroes.length = length;
                    while (i < length) {
                        zeroes[i++] = 0;
                    }
                    return zeroes;
                };

                ctrl.removeDroppedItem = function (choiceToRemove, indexOfDropped) {
                    worksheetUtils.removeDroppedItem(ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.droppedItems, choiceToRemove, indexOfDropped);
                };

                ctrl.getIsDraggable = function () {
                    return worksheetUtils.getIsDraggable(worksheetService.getReadOnly(), ctrl.isPerfectScore, ctrl.isAttemptTwo);
                };

                ctrl.getIsDropped = function (item) {
                    return worksheetUtils.getIsDropped(item);
                };

                ctrl.getIsCorrect = function (item) {
                    return worksheetUtils.getIsCorrect(item, worksheetService.getReadOnly());
                };

                ctrl.getIsIncorrect = function (item) {
                    return worksheetUtils.getIsIncorrect(item, worksheetService.getReadOnly(), ctrl.isAttemptTwo, ctrl.mode === ctrl.DRAG_AND_DROP);
                };

                ctrl.getIsRemovable = function (item) {
                    return worksheetUtils.getIsRemovable(item, worksheetService.getReadOnly(), ctrl.isPerfectScore, ctrl.isAttemptTwo);
                };

                ctrl.getReadOnly = function() {
                    return worksheetService.getReadOnly();
                };

                ctrl.drawStudentAnswers = function () {
                    var attemptNumber = ctrl.studentAnswers.attemptNumber;
                    ctrl.isPerfectScore = ctrl.studentAnswers.isPerfectScore;
                    ctrl.isAttemptTwo = attemptNumber == 2 ? true : false;
                    var correctIds = ctrl.studentAnswers.ids;
                    var keepIncorrectInTarget = false;
                    var isTimeline = false;
                    if (ctrl.mode === ctrl.DRAG_AND_DROP) {
                        worksheetUtils.drawStudentAnswersForDragTargetQuestion(ctrl.studentAnswers, ctrl.dragAndDrop.answerBank,
                            ctrl.dragAndDrop.droppedItems, ctrl.dragAndDrop.autoRegenerate, ctrl.isAttemptTwo, correctIds,
                            keepIncorrectInTarget, ctrl.skipAutoGrade, ctrl.studentAnswers.multipleTargetTypes, null);
                    } else {
                        worksheetUtils.drawStudentAnswersForDragReplaceQuestion(ctrl.studentAnswers, ctrl.dragAndReplace.items,
                            ctrl.isAttemptTwo, correctIds, isTimeline, ctrl.studentAnswers.multipleTargetTypes);
                    }
                    return ctrl.isPerfectScore;
                };

                ctrl.gradeWorksheetQuestion = function () {
                    ctrl.initGrade();
                    if (ctrl.mode === ctrl.DRAG_AND_DROP) {
                        return ctrl.gradeDragAndDropWorksheetQuestion();
                    } else {
                        return ctrl.gradeDragAndReplaceWorksheetQuestion();
                    }
                };

                ctrl.initGrade = function() {
                    if (ctrl.mode === ctrl.DRAG_AND_DROP) {
                        var dragTargets = angular.element('.drop-target:visible');
                        if (!ctrl.studentAnswers) {
                            ctrl.studentAnswers = {};
                            ctrl.studentAnswers['attemptNumber'] = 1;
                        } else {
                            ctrl.studentAnswers['attemptNumber'] = 2;
                        }
                        ctrl.studentAnswers['attempt'] = {};
                        ctrl.studentAnswers['attempt'][ctrl.studentAnswers['attemptNumber']] = {};
                        var answersInDragTarget = {};

                        _.each(dragTargets, function (dragTarget) {
                            var answers = [];
                            var dragTargetNumber = dragTarget.getAttribute('data-dragtarget');
                            answersInDragTarget[dragTargetNumber] = {};

                            // Prepopulated answers do not count toward score
                            if (!angular.element(dragTarget).hasClass('is-prepopulated')) {
                                answers.push({
                                    'answer_id': dragTarget.getAttribute('data-answerid'),
                                    'drag_target': dragTargetNumber,
                                    'prepopulate': angular.element(dragTarget).hasClass('is-prepopulated')
                                });
                            }
                            answersInDragTarget[dragTargetNumber] = answers;
                        });
                        ctrl.studentAnswers['attempt'][ctrl.studentAnswers['attemptNumber']]['dragTarget'] = answersInDragTarget;
                    } else {
                        var draggableItems = angular.element('.js-draggable:visible');
                        if (!ctrl.studentAnswers) {
                            ctrl.studentAnswers = {};
                            ctrl.studentAnswers['attemptNumber'] = 1;
                        } else {
                            ctrl.studentAnswers['attemptNumber'] = 2;
                        }
                        ctrl.studentAnswers['attempt'] = {};
                        ctrl.studentAnswers['attempt'][ctrl.studentAnswers['attemptNumber']] = {};
                        var answersInDragTarget = {};

                        _.each(draggableItems, function (item) {
                            var answers = [];
                            var dragTargetNumber = item.getAttribute('data-dragtarget');
                            if (dragTargetNumber) {
                                answersInDragTarget[dragTargetNumber] = {};

                                // Prepopulated answers do not count toward score
                                if (!angular.element(item).hasClass('is-prepopulated')) {
                                    if (item.getAttribute('data-answerid') != '' || ctrl.studentAnswers['attemptNumber'] == 2) {
                                        answers.push({
                                            'answer_id': item.getAttribute('data-answerid'),
                                            'drag_target': dragTargetNumber,
                                            'prepopulate': angular.element(item).hasClass('is-prepopulated')
                                        });
                                    }
                                }
                                answersInDragTarget[dragTargetNumber] = answers;
                            }

                        });
                        ctrl.studentAnswers['attempt'][ctrl.studentAnswers['attemptNumber']]['dragTarget'] = answersInDragTarget;
                    }
                };

                ctrl.evaluateResults = function(data) {
                    if (data == undefined || data == null) {
                        return;
                    }
                    if (ctrl.mode === ctrl.DRAG_AND_DROP) {
                        ctrl.studentAnswers.ids = data.ids;
                        ctrl.studentAnswers.isPerfectScore = (data.possiblePoints >= 0 && data.correctPoints == data.possiblePoints);
                        if (ctrl.studentAnswers.isPerfectScore) {
                            worksheetService.setBookmarkedQuestionIndex(worksheetService.getQuestionIndex() + 1);
                        }
                        ctrl.studentAnswers.multipleTargetTypes = data.multipleTargetTypes;
                        return ctrl.drawStudentAnswers();

                    } else {
                        ctrl.studentAnswers.ids = data.ids;
                        ctrl.studentAnswers.isPerfectScore = (data.possiblePoints >= 0 && data.correctPoints == data.possiblePoints);
                        ctrl.isPerfectScore = ctrl.studentAnswers.isPerfectScore;
                        if (ctrl.studentAnswers.isPerfectScore) {
                            worksheetService.setBookmarkedQuestionIndex(worksheetService.getQuestionIndex() + 1);
                        }
                        ctrl.studentAnswers.multipleTargetTypes = data.multipleTargetTypes;
                        return ctrl.drawStudentAnswers();
                    }
               };

                ctrl.gradeDragAndDropWorksheetQuestion = function () {
                    return worksheetActivityCompletion.evaluateStudentAnswers(ctrl.studentAnswers, ctrl.questionData.index)
                        .then(function (data) {
                            return ctrl.evaluateResults(data);
                        });
                };

                ctrl.gradeDragAndReplaceWorksheetQuestion = function () {
                    return worksheetActivityCompletion.evaluateStudentAnswers(ctrl.studentAnswers, ctrl.questionData.index)
                        .then(function (data) {
                            return ctrl.evaluateResults(data);
                        });

                };
            }]);
})();
