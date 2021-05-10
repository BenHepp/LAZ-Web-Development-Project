(function () {
    'use strict';

    angular.module('shared.worksheet')

        .component('mainIdeaDetail', {
            templateUrl: '/shared/js/angular/worksheet/main-idea-detail.html',
            controller: 'MainIdeaDetailController',
            bindings: {
                questionData: '<',
                studentAnswers: '<',
                isLastQuestion: '<'
            }
        })
        .controller('MainIdeaDetailController', ['worksheetService', 'worksheetActivityCompletion', 'worksheetUtils','$scope',
            function (worksheetService, worksheetActivityCompletion, worksheetUtils,$scope) {
                var ctrl = this;
                ctrl.dragAndDrop = {};
                ctrl.ideaAndDetailMap = [];
                ctrl.ideaDetailArray = [];
                ctrl.readOnly = false;
                ctrl.correctAnswers = [];
                ctrl.numIdeas = 0;
                ctrl.numDetails = 0;
                ctrl.isAttemptTwo = false;

                ctrl.$onInit = function () {
                    var ideas = ctrl.questionData.ideas;
                    var chartFormat = ctrl.questionData.formatOptions[ideas[0].chart_type_id - 1];
                    ctrl.parentBoxName = chartFormat.parent_name;
                    ctrl.childBoxName = chartFormat.child_name;
                    ctrl.skipAutoGrade = ctrl.questionData.skipAutoGrade;

                    ctrl.dragAndDrop.answerBank = angular.copy(ctrl.questionData.choices);
                    ctrl.dragAndDrop.droppedItems = _.range(ideas.length * 2).map(function (c, idx) {
                        // Details have even drag targets, and the idea they belong to is this drag_target - 1
                        // Establish correct array size with placeholders for details
                        if (ctrl.isDetail(idx + 1)) {
                            return {'answers': _.range(parseInt(ideas[Math.floor(idx/2)].details))
                                    .fill()
                                    .map(function() {
                                        return {'item': undefined}
                                    }
                                )};
                        }
                        return {'answers': [{'item': undefined}]};
                    });

                    ctrl.establishPrepopulatedItems();
                    ctrl.readOnly = worksheetService.getReadOnly();
                    ctrl.isPreview = worksheetService.getIsPreview();
                    if (worksheetService.getReadOnly()) {
                        ctrl.correctAnswers = ctrl.populateCorrectAnswers();
                        ctrl.dragAndDrop.droppedItems = ctrl.correctAnswers;
                    }

                    ctrl.setUpIdeaAndDetails();
                    ctrl.dragAndDrop.autoRegenerate = ctrl.questionData.autoRegenerate;

                    if (ctrl.studentAnswers) {
                        ctrl.drawStudentAnswers();
                    }
                };

                ctrl.isMainIdea = function (dragTarget) {
                    return dragTarget % 2 !== 0;
                };

                ctrl.isDetail = function (dragTarget) {
                    return dragTarget % 2 === 0;
                };

                // Establish array with subarrays of each idea/detail couplings
                // ideas = [{idea: main1, details: [detail1, detail1]} , {idea: main2, details: [detail2, detail2 ...]}, ... ]
                ctrl.setUpIdeaAndDetails = function () {
                    ctrl.ideaDetailArray = [];

                    _.each(ctrl.questionData.ideas, function (idea, idx) {
                        ++ctrl.numIdeas;
                        var ideaDetailObject = {};
                        // Ideas are in even indices and details are in odd indices
                        ideaDetailObject.idea = ctrl.dragAndDrop.droppedItems[idx * 2];
                        ideaDetailObject.idea.dragTarget = (idx * 2 + 1);
                        ideaDetailObject.idea.details = ctrl.dragAndDrop.droppedItems[idx * 2 + 1];
                        ideaDetailObject.idea.details.dragTarget = (idx * 2 + 2);
                        ctrl.ideaDetailArray.push(ideaDetailObject);
                    });
                };

                ctrl.establishPrepopulatedItems = function () {
                    worksheetUtils.establishPrepopulatedItemsForCharts(ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.droppedItems);
                };

                ctrl.populateCorrectAnswers = function() {
                    return worksheetUtils.populateCorrectAnswersForDragAndDrop(ctrl.questionData.choices, ctrl.correctAnswers, ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.autoRegenerate);
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
                        ctrl.dragAndDrop.autoRegenerate, ctrl.isAttemptTwo, correctIds, keepIncorrectInTarget, ctrl.skipAutoGrade, null, 'mainIdea');
                    return ctrl.isPerfectScore;
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
                }

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
                }

                ctrl.gradeWorksheetQuestion = function () {
                    ctrl.initGrade();

                    return worksheetActivityCompletion.evaluateStudentAnswers(ctrl.studentAnswers, ctrl.questionData.index)
                        .then(function (data) {
                            return ctrl.evaluateResults(data);
                        });
                };

            }]);
})();
