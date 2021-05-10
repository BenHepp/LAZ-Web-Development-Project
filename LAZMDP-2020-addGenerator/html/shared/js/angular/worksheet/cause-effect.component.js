(function () {
    'use strict';

    angular.module('shared.worksheet')

        .component('causeEffect', {
            templateUrl: '/shared/js/angular/worksheet/cause-effect.html',
            controller: 'CauseEffectController',
            bindings: {
                questionData: '<',
                studentAnswers: '<',
                isLastQuestion: '<'
            }
        })

        .controller('CauseEffectController', ['worksheetService', 'worksheetActivityCompletion', 'worksheetUtils',
            function (worksheetService, worksheetActivityCompletion, worksheetUtils) {
                var ctrl = this;
                ctrl.dragAndDrop = {};
                ctrl.dragAndDrop = {};
                ctrl.dragAndDrop.droppedItems = [];
                ctrl.causeEffectResponseArray = [];
                ctrl.correctAnswers = [];
                ctrl.isPerfectScore = false;
                ctrl.isAttemptTwo = false;

                ctrl.$onInit = function () {
                    ctrl.skipAutoGrade = ctrl.questionData.skipAutoGrade;
                    ctrl.dragAndDrop.answerBank = angular.copy(ctrl.questionData.choices);
                    ctrl.charts = ctrl.establishChoicesPerChart(angular.copy(ctrl.questionData.charts));
                    ctrl.setUpDroppedItemsStructure(ctrl.charts);

                    ctrl.establishPrepopulatedItems();
                 //   ctrl.readOnly = worksheetService.getReadOnly();
                    ctrl.isPreview = worksheetService.getIsPreview();
                    if (worksheetService.getReadOnly()) {
                        ctrl.correctAnswers = ctrl.populateCorrectAnswers();
                        ctrl.dragAndDrop.droppedItems = ctrl.correctAnswers;
                        ctrl.populateChartsWithCorrectAnswers(ctrl.charts, ctrl.dragAndDrop.droppedItems);
                    }

                    ctrl.dragAndDrop.autoRegenerate = ctrl.questionData.autoRegenerate;

                    if (ctrl.studentAnswers) {
                        ctrl.drawStudentAnswers();
                    }
                };

                ctrl.isCause = function (choice) {
                    return choice.answer_type === 'statement';
                };

                ctrl.isEffect = function (choice) {
                    return choice.answer_type === 'effect';
                };

                ctrl.isResponse = function (choice) {
                    return choice.answer_type === 'response';
                };

                ctrl.establishChoicesPerChart = function (charts) {
                    var chartsArray = [];

                    _.each(charts, function (chart) {
                        var chartObj = {};
                        chartObj.causes = [];
                        chartObj.effects = [];
                        chartObj.response = [];

                        chartObj.causes.displayName = chart.chart_name === 'cause-to-effects' ? 'Cause' : 'Effect';
                        chartObj.effects.displayName = chart.chart_name === 'cause-to-effects' ? 'Effect' : 'Cause';
                        chartObj.response.displayName = 'Response';

                        //Cause and effect chart contains of cause(s), effect(s), and a response
                        _.each(chart.choices, function (choice, idx) {
                            if (ctrl.isCause(choice)) {
                                chartObj.causes.push(idx);
                            } else if (ctrl.isEffect(choice)) {
                                chartObj.effects.push(idx);
                            } else {
                                chartObj.response.push(idx);
                            }
                        });
                        chartsArray.push(chartObj);
                    });
                    return chartsArray;
                };

                ctrl.setUpDroppedItemsStructure = function (charts, droppedItems) {
                    var droppedItemsIdx = 0;
                    _.each(charts, function (chart) {
                        ctrl.dragAndDrop.droppedItems.push({
                            'answers': _.range(chart.causes.length)
                                .fill()
                                .map(function () {
                                    return {'item': undefined}
                                })
                        });
                        var causeDisplayName = chart.causes.displayName;
                        var effectDisplayName = chart.effects.displayName;
                        var responseDisplayName = chart.response.displayName;

                        chart.causes = {};
                        chart.causes.displayName = causeDisplayName;
                        chart.causes.answers = ctrl.dragAndDrop.droppedItems[droppedItemsIdx].answers;
                        chart.causes.dragTarget = droppedItemsIdx + 1;
                        ++droppedItemsIdx;
                        ctrl.dragAndDrop.droppedItems.push({
                            'answers': _.range(chart.effects.length)
                                .fill()
                                .map(function () {
                                    return {'item': undefined}
                                })
                        });
                        chart.effects = {};
                        chart.effects.displayName = effectDisplayName;
                        chart.effects.answers = ctrl.dragAndDrop.droppedItems[droppedItemsIdx].answers;
                        chart.effects.dragTarget = droppedItemsIdx + 1;
                        ++droppedItemsIdx;
                        if (chart.response.length == 1) {
                            ctrl.dragAndDrop.droppedItems.push({
                                'answers': _.range(chart.response.length)
                                    .fill()
                                    .map(function () {
                                        return {'item': undefined}
                                    })
                            });
                            chart.response = {};
                            chart.response.displayName = responseDisplayName;
                            chart.response.answers = ctrl.dragAndDrop.droppedItems[droppedItemsIdx].answers;
                            chart.response.dragTarget = droppedItemsIdx + 1;
                            ++droppedItemsIdx;
                        }
                    });
                };

                ctrl.establishPrepopulatedItems = function () {
                    worksheetUtils.establishPrepopulatedItemsForCharts(ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.droppedItems);
                };

                ctrl.populateCorrectAnswers = function () {
                    return worksheetUtils.populateCorrectAnswersForDragAndDrop(ctrl.questionData.choices, ctrl.correctAnswers, ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.autoRegenerate);
                };

                ctrl.populateChartsWithCorrectAnswers = function(charts, droppedItems) {
                    var droppedItemsIdx = 0;
                    _.each(charts, function(chart){
                        chart.causes.answers = droppedItems[droppedItemsIdx].answers;
                        ++droppedItemsIdx;
                        chart.effects.answers = droppedItems[droppedItemsIdx].answers;
                        ++droppedItemsIdx;
                        if (chart.response.answers) {
                            chart.response.answers = droppedItems[droppedItemsIdx].answers;
                            ++droppedItemsIdx;
                        }
                    })
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
                    return worksheetUtils.getIsIncorrect(item, worksheetService.getReadOnly(), ctrl.isAttemptTwo, true);
                };

                ctrl.getIsRemovable = function (item) {
                    return worksheetUtils.getIsRemovable(item, worksheetService.getReadOnly(), ctrl.isPerfectScore, ctrl.isAttemptTwo);
                };

                ctrl.drawStudentAnswers = function () {
                    var attemptNumber = ctrl.studentAnswers.attemptNumber;
                    ctrl.isPerfectScore = ctrl.studentAnswers.isPerfectScore;
                    ctrl.isAttemptTwo = attemptNumber == 2 ? true : false;
                    var correctIds = ctrl.studentAnswers.ids;
                    var keepIncorrectInTarget = false;
                    worksheetUtils.drawStudentAnswersForDragTargetQuestion(ctrl.studentAnswers, ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.droppedItems,
                        ctrl.dragAndDrop.autoRegenerate, ctrl.isAttemptTwo, correctIds, keepIncorrectInTarget, ctrl.skipAutoGrade, null, 'causeEffect');
                    // TODO: Allow for switching of charts

                    return ctrl.isPerfectScore;
                };

                ctrl.initGrade = function() {
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

                    var previousDragTargetNumber = null;
                    _.each(dragTargets, function (dragTarget) {
                        var dragTargetNumber = dragTarget.getAttribute('data-target');
                        var underscoreIndex = dragTargetNumber.indexOf('_');
                        dragTargetNumber = dragTargetNumber.substring(0, underscoreIndex != -1 ? underscoreIndex : dragTargetNumber.length);

                        // Prepopulated answers do not count toward score
                        if (!angular.element(dragTarget).hasClass('is-prepopulated')) {

                            if (dragTargetNumber != previousDragTargetNumber) {
                                answersInDragTarget[dragTargetNumber] = [];
                                previousDragTargetNumber = dragTargetNumber;
                            }

                            answersInDragTarget[dragTargetNumber].push({
                                'answer_id': dragTarget.getAttribute('data-answerid'),
                                'drag_target': dragTargetNumber,
                                'prepopulate': angular.element(dragTarget).hasClass('is-prepopulated')
                            });
                        }
                    });
                    ctrl.studentAnswers['attempt'][ctrl.studentAnswers['attemptNumber']]['dragTarget'] = answersInDragTarget;
                };

                ctrl.evaluateResults = function(data) {
                    if (data == undefined || data == null) {
                        return;
                    }
                    ctrl.studentAnswers.ids = data.ids;
                    ctrl.studentAnswers.isPerfectScore = (data.possiblePoints >= 0 && data.correctPoints == data.possiblePoints);
                    if (ctrl.studentAnswers.isPerfectScore) {
                        worksheetService.setBookmarkedQuestionIndex(worksheetService.getQuestionIndex() + 1);
                    }
                    return ctrl.drawStudentAnswers();
                };


                // TODO: Identical to main idea/detail :(
                ctrl.gradeWorksheetQuestion = function () {
                    ctrl.initGrade();
                    return worksheetActivityCompletion.evaluateStudentAnswers(ctrl.studentAnswers, ctrl.questionData.index)
                        .then(function (data) {
                            return ctrl.evaluateResults(data);
                        });
                };

            }]);
})();
