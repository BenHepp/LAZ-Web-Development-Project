(function () {
    'use strict';

    angular.module('shared.worksheet')

        .component('eventSequence', {
            templateUrl: '/shared/js/angular/worksheet/event-sequence.html',
            controller: 'EventSequenceController',
            bindings: {
                questionData: '<',
                studentAnswers: '<',
                isLastQuestion: '<'
            }
        })

        .controller('EventSequenceController', ['worksheetService', 'worksheetActivityCompletion', 'worksheetUtils',
            function (worksheetService, worksheetActivityCompletion, worksheetUtils) {
                var ctrl = this;
                ctrl.dragAndDrop = {};
                ctrl.dragAndDrop.droppedItems = [];
                ctrl.correctAnswers = [];
                ctrl.isPerfectScore = false;
                ctrl.isAttemptTwo = false;

                ctrl.$onInit = function () {
                    ctrl.choicesWithDragTargets = _.filter(ctrl.questionData.choices, function (choice) {
                        return worksheetUtils.isValidDragTarget(choice);
                    });
                    ctrl.skipAutoGrade = ctrl.questionData.skipAutoGrade;
                    ctrl.dragAndDrop.answerBank = angular.copy(ctrl.questionData.choices);
                    ctrl.dragAndDrop.droppedItems = ctrl.choicesWithDragTargets.map(function (c) {
                        return {'answers': [{'item': undefined}]};
                    });
                    ctrl.establishPrepopulatedItems();

                    //ctrl.readOnly = worksheetService.getReadOnly();
                    ctrl.isPreview = worksheetService.getIsPreview();
                    if (worksheetService.getReadOnly()) {
                        ctrl.correctAnswers = ctrl.populateCorrectAnswers();
                        ctrl.dragAndDrop.droppedItems = ctrl.correctAnswers;
                    }

                    ctrl.dragAndDrop.autoRegenerate = ctrl.questionData.autoRegenerate;

                    if (ctrl.studentAnswers) {
                        ctrl.drawStudentAnswers();
                    }
                };

                ctrl.establishPrepopulatedItems = function () {
                    worksheetUtils.establishPrepopulatedItems(ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.droppedItems, ctrl.skipAutoGrade)
                };

                ctrl.populateCorrectAnswers = function () {
                    return worksheetUtils.populateCorrectAnswersForDragAndDrop(ctrl.questionData.choices, ctrl.correctAnswers, ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.autoRegenerate);
                };

                ctrl.removeDroppedItem = function (choiceToRemove, indexOfDropped) {
                    worksheetUtils.removeDroppedItem(ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.droppedItems, choiceToRemove, indexOfDropped);
                };

                ctrl.getIsDraggable = function () {
                    return worksheetUtils.getIsDraggable(ctrl.readOnly, ctrl.isPerfectScore, ctrl.isAttemptTwo);
                };

                ctrl.getIsDropped = function (item) {
                    return worksheetUtils.getIsDropped(item);
                };

                ctrl.getIsCorrect = function (item) {
                    return worksheetUtils.getIsCorrect(item, ctrl.readOnly);
                };

                ctrl.getIsIncorrect = function (item) {
                    return worksheetUtils.getIsIncorrect(item, ctrl.readOnly, ctrl.isAttemptTwo, true);
                };

                ctrl.getIsRemovable = function (item) {
                    return worksheetUtils.getIsRemovable(item, ctrl.isReadOnly, ctrl.isPerfectScore, ctrl.isAttemptTwo);
                };

                ctrl.drawStudentAnswers = function () {
                    var attemptNumber = ctrl.studentAnswers.attemptNumber;
                    ctrl.isPerfectScore = ctrl.studentAnswers.isPerfectScore;
                    ctrl.isAttemptTwo = attemptNumber == 2 ? true : false;
                    var correctIds = ctrl.studentAnswers.ids;
                    var keepIncorrectInTarget = false;
                    worksheetUtils.drawStudentAnswersForDragTargetQuestion(ctrl.studentAnswers, ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.droppedItems,
                        ctrl.dragAndDrop.autoRegenerate, ctrl.isAttemptTwo, correctIds, keepIncorrectInTarget, ctrl.skipAutoGrade, null, null);
                    return ctrl.isPerfectScore;
                };

                ctrl.initGrade = function() {
                    var dragTargets = angular.element('.drop-target:visible');
                    var chart = angular.element('.js-chart:visible')[0];

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


                ctrl.gradeWorksheetQuestion = function () {
                    ctrl.initGrade();
                    return worksheetActivityCompletion.evaluateStudentAnswers(ctrl.studentAnswers, ctrl.questionData.index)
                        .then(function (data) {
                            return ctrl.evaluateResults(data);
                        });
                };
            }]);
})();
