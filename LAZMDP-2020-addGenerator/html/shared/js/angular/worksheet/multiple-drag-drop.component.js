(function () {
    'use strict';

    angular.module('shared.worksheet')

        .component('multipleDragDrop', {
            templateUrl: '/shared/js/angular/worksheet/multiple-drag-drop.html',
            controller: 'MultipleDragDropController',
            bindings: {
                questionData: '<',
                studentAnswers: '<',
                isLastQuestion: '<'
            }
        })

        .controller('MultipleDragDropController', ['worksheetService', 'worksheetActivityCompletion', 'worksheetUtils','$scope',
            function (worksheetService, worksheetActivityCompletion, worksheetUtils, $scope) {
                var ctrl = this;
                ctrl.dragAndDrop = {};
                //ctrl.readOnly = false;
                ctrl.correctAnswers = [];
                ctrl.dragAndDrop.droppedItems = [];
                ctrl.isAttemptTwo = false;

                ctrl.$onInit = function () {

                    _.each(ctrl.questionData.charts, function (chart) {
                            if (chart.chart_name === 'target') {

                                ctrl.dragAndDrop.answerBank = angular.copy(ctrl.questionData.choices);
                                ctrl.hasTargetBorder = ctrl.questionData.hasTargetBorder;
                                ctrl.skipAutoGrade = ctrl.questionData.skipAutoGrade;
                                ctrl.targetsPerContainer = ctrl.questionData.choices.length;

                                ctrl.cols = _.range(chart.columns.length);
                                ctrl.rows = _.range(chart.rows.length);

                                if (chart.chart_layout === 'Table') {
                                    ctrl.mode = 'table';
                                    ctrl.choicesWithDragTargets = _.range(chart.columns.length * chart.rows.length);
                                    ctrl.dragAndDrop.droppedItems = ctrl.choicesWithDragTargets.map(function (c, idx) {
                                        return {'answers': [{'item': undefined}], 'index': idx};
                                    });
                                    ctrl.headings = chart.columns;
                                } else if (chart.chart_layout === 'Container') {
                                    ctrl.mode = 'container';

                                    if (ctrl.skipAutoGrade) {
                                        ctrl.dragAndDrop.droppedItems = _.range(chart.columns.length).map(function () {
                                            return {
                                                'answers': [{'item': undefined}]
                                            }
                                        });
                                    } else if (ctrl.hasTargetBorder) {
                                        ctrl.dragAndDrop.droppedItems = _.range(chart.columns.length).map(function (c, idx) {
                                            return {
                                                'answers': ctrl.getAnswersPerDragTarget(idx + 1)
                                            }
                                        });
                                    } else {
                                        // Set up answers arrays to be size of answerbank since that is the max size
                                        ctrl.dragAndDrop.droppedItems = _.range(chart.columns.length).map(function () {
                                            return {
                                                'answers': _.range(ctrl.dragAndDrop.answerBank.length)
                                                    .fill()
                                                    .map(function () {
                                                        return {'item': undefined}
                                                    })
                                            }
                                        });
                                    }
                                    _.each(chart.columns, function (col, idx) {
                                        ctrl.cols[idx] = col;
                                    });
                                }
                            }
                        }
                    );

                    ctrl.dragAndDrop.autoRegenerate = ctrl.questionData.autoRegenerate;
                    ctrl.establishPrepopulatedItems();
                    //ctrl.readOnly = worksheetService.getReadOnly();
                    ctrl.isPreview = worksheetService.getIsPreview();

                    if (worksheetService.getReadOnly()) {
                        if (!ctrl.skipAutoGrade) {
                            ctrl.correctAnswers = ctrl.populateCorrectAnswers();
                        } else {
                            ctrl.correctAnswers = ctrl.dragAndDrop.droppedItems;
                        }
                        if (ctrl.mode == 'table') {
                            _.each(ctrl.correctAnswers, function (answer, idx) {
                                answer.index = idx;
                            });

                        }
                        ctrl.dragAndDrop.droppedItems = ctrl.correctAnswers;
                    }

                    if (ctrl.mode == 'table') {
                        ctrl.rows = worksheetUtils.chunk(ctrl.dragAndDrop.droppedItems, ctrl.cols.length);
                    } else {
                        _.each(ctrl.dragAndDrop.droppedItems, function (droppedItem, index) {
                            droppedItem.col = ctrl.cols[index];
                            droppedItem.index = index;
                        });
                    }

                    if (ctrl.studentAnswers) {
                        ctrl.drawStudentAnswers();
                    }
                };

                ctrl.getAnswersPerDragTarget = function (dragTarget) {
                    var numAnswers = 0;
                    _.each(ctrl.questionData.choices, function (choice) {
                        _.each(choice.drag_target, function (dragTargetForChoice) {
                            if (dragTargetForChoice == dragTarget) {
                                ++numAnswers;
                            }
                        })
                    });
                    return _.range(numAnswers).fill().map(function () {
                            return {'item': undefined};
                        }
                    )
                };

                ctrl.getNumItemsInDragTarget = function (dragTarget) {
                    // If showing target borders, find the first index where the item is undefined - that's
                    // where the next answer should go in the droppedItems array
                    if (ctrl.hasTargetBorder) {
                        return ctrl.dragAndDrop.droppedItems[dragTarget - 1].answers.findIndex(function (answer) {
                            return answer.item === undefined || answer.item.is_correct === false;
                        });
                    }

                    return ctrl.dragAndDrop.droppedItems[dragTarget - 1].answers.findIndex(function (answer) {
                        return answer.item === undefined || answer.item.placeholder;
                    });
                };

                ctrl.establishPrepopulatedItems = function () {
                    worksheetUtils.establishPrepopulatedItems(ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.droppedItems, ctrl.skipAutoGrade);
                };

                ctrl.populateCorrectAnswers = function () {
                    return worksheetUtils.populateCorrectAnswersForDragAndDrop(ctrl.questionData.choices, ctrl.correctAnswers, ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.autoRegenerate);
                };

                ctrl.removeDroppedItem = function (choiceToRemove, indexOfDropped, isContainerMode) {
                    if (ctrl.mode === 'container') {
                        // Since we're keeping incorrect answers in the containers, when they're removed
                        // they revert back to being null for is_correct
                        choiceToRemove.is_correct = null;
                    }
                    worksheetUtils.removeDroppedItem(ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.droppedItems,
                        choiceToRemove, indexOfDropped, isContainerMode, ctrl.hasTargetBorder, ctrl.attemptNumber,
                        ctrl.getAnswersPerDragTarget(indexOfDropped + 1).length);
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
                    if (ctrl.isPreview) {
                        return false;
                    }

                    // Special cases for this template
                    if (ctrl.mode === 'container' && !ctrl.hasTargetBorder) {
                        if ((!item && ctrl.attemptNumber) || (item && item.placeholder)) {
                            return true;
                        } else if (item.is_correct === undefined || item.is_correct === null) {
                            return false;
                        } else {
                            return !item.is_correct;
                        }
                    } else {
                        if (!item && ctrl.attemptNumber) {
                            return true;
                        }
                        return worksheetUtils.getIsIncorrect(item, worksheetService.getReadOnly(), ctrl.isAttemptTwo, true);
                    }
                };

                ctrl.getIsRemovable = function (item) {
                    return worksheetUtils.getIsRemovable(item, worksheetService.getReadOnly(), ctrl.isPerfectScore, ctrl.isAttemptTwo);
                };

                ctrl.drawStudentAnswers = function () {
                    var attemptNumber = ctrl.studentAnswers.attemptNumber;
                    ctrl.isPerfectScore = ctrl.studentAnswers.isPerfectScore;
                    ctrl.isAttemptTwo = attemptNumber == 2 ? true : false;
                    ctrl.attemptNumber = attemptNumber;
                    var correctIds = ctrl.studentAnswers.ids;
                    var keepIncorrectInTarget = !ctrl.hasTargetBorder && ctrl.mode === "container";
                    worksheetUtils.drawStudentAnswersForDragTargetQuestion(ctrl.studentAnswers, ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.droppedItems,
                        ctrl.dragAndDrop.autoRegenerate, ctrl.isAttemptTwo, correctIds, keepIncorrectInTarget, ctrl.skipAutoGrade, null, null);
                };

                // TODO (Alex B): Refactor since all drag target related questions share this code :(
                ctrl.gradeWorksheetQuestion = function () {
                    ctrl.initGrade();
                    if (ctrl.mode === 'table') {
                        return ctrl.gradeTableWorksheetQuestion();
                    } else {
                        return ctrl.gradeContainerWorksheetQuestion();
                    }
                };

                ctrl.initGrade = function() {
                    if (ctrl.mode === 'table') {
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

                            var answersInTarget = angular.element(dragTarget).find('span');
                            _.each(answersInTarget, function (answer) {
                                // Prepopulated answers do not count toward score
                                if (!angular.element(answer).parent().hasClass('is-prepopulated')) {
                                    // Add the answer if there is a target border (since there is a fixed number of answers per box) or
                                    // if the answerid is not empty or
                                    // if it's attempt 2 since we are showing placeholders to guide the student and need to grab all of student's answer data
                                    if (ctrl.hasTargetBorder || answer.getAttribute('data-answerid') != '' || ctrl.studentAnswers['attemptNumber'] == 2) {
                                        answers.push({
                                            'answer_id': answer.getAttribute('data-answerid'),
                                            'drag_target': dragTargetNumber,
                                            'prepopulate': angular.element(answer).parent().hasClass('is-prepopulated')
                                        });
                                    }
                                }
                            });
                            answersInDragTarget[dragTargetNumber] = answers;
                        });

                        ctrl.studentAnswers['attempt'][ctrl.studentAnswers['attemptNumber']]['dragTarget'] = answersInDragTarget;
                    }
                }

                ctrl.gradeTableWorksheetQuestion = function () {
                    return worksheetActivityCompletion.evaluateStudentAnswers(ctrl.studentAnswers, ctrl.questionData.index)
                        .then(function (data) {
                            if (data != null && data != undefined) {
                                ctrl.evaluateResults(data);
                            }
                            return ctrl.isPerfectScore;
                        });
                };

                ctrl.evaluateResults = function(data) {
                    if (data == undefined || data == null) {
                        return;
                    }
                    ctrl.studentAnswers.ids = data.ids;
                    ctrl.studentAnswers.isPerfectScore = (data.possiblePoints >= 0 && data.correctPoints == data.possiblePoints);
                    ctrl.isPerfectScore = ctrl.studentAnswers.isPerfectScore;
                    if (ctrl.studentAnswers.isPerfectScore) {
                        worksheetService.setBookmarkedQuestionIndex(worksheetService.getQuestionIndex() + 1);
                    }
                    if (!ctrl.skipAutoGrade) {
                        ctrl.drawStudentAnswers();
                    }
                }

                ctrl.gradeContainerWorksheetQuestion = function () {
                    return worksheetActivityCompletion.evaluateStudentAnswers(ctrl.studentAnswers, ctrl.questionData.index)
                        .then(function (data) {
                            if (data != null && data != undefined) {
                                ctrl.evaluateResults(data);
                            }
                            return ctrl.isPerfectScore;
                        });
                }

            }]);
})();
