(function () {
    'use strict';

    angular.module('shared.worksheet')

        .component('timeline', {
            templateUrl: '/shared/js/angular/worksheet/timeline.html',
            controller: 'TimelineController',
            bindings: {
                questionData: '<',
                studentAnswers: '<',
                isLastQuestion: '<'
            }
        })

        .controller('TimelineController', ['worksheetService', 'worksheetActivityCompletion', 'worksheetUtils',
            function (worksheetService, worksheetActivityCompletion, worksheetUtils) {
                var ctrl = this;
                ctrl.dragAndReplace = {};
                ctrl.correctAnswers = [];

                ctrl.$onInit = function () {

                    // Odd numbered drag targets are dates
                    ctrl.dates = _.filter(ctrl.questionData.choices, function (choice) {
                        return choice.drag_target[0] % 2 !== 0;
                    });

                    // Even numbered drag targets are events
                    ctrl.events = _.filter(ctrl.questionData.choices, function (choice) {
                        return choice.drag_target[0] % 2 === 0;
                    });

                    ctrl.cols = ctrl.questionData.charts[0].columns;
                    ctrl.rows = ctrl.questionData.charts[0].rows.length;

                    //ctrl.readOnly = worksheetService.getReadOnly();
                    ctrl.isPreview = worksheetService.getIsPreview();

                    if (worksheetService.getReadOnly()) {
                        ctrl.correctAnswers = ctrl.populateCorrectAnswers();
                        ctrl.dragAndReplace.droppedItems = ctrl.correctAnswers;
                    }

                    if (ctrl.studentAnswers) {
                        ctrl.drawStudentAnswers();
                    }
                };

                ctrl.populateCorrectAnswers = function () {
                    return worksheetUtils.populateCorrectAnswersForDragAndReplace(ctrl.events);
                };

                ctrl.getIsDraggable = function () {
                    return worksheetUtils.getIsDraggable(worksheetService.getReadOnly(), ctrl.isPerfectScore, ctrl.isAttemptTwo);
                };

                ctrl.getIsCorrect = function (item) {
                    return worksheetUtils.getIsCorrect(item, worksheetService.getReadOnly());
                };

                ctrl.getIsIncorrect = function (item) {
                    return worksheetUtils.getIsIncorrect(item, worksheetService.getReadOnly(), ctrl.isAttemptTwo, false);
                };

                // TODO: Same as other drag and replace templates?
                ctrl.drawStudentAnswers = function () {
                    var attemptNumber = ctrl.studentAnswers.attemptNumber;
                    ctrl.isPerfectScore = ctrl.studentAnswers.isPerfectScore;
                    ctrl.isAttemptTwo = attemptNumber == 2 ? true : false;
                    var correctIds = ctrl.studentAnswers.ids;
                    var isTimeline = true;
                    worksheetUtils.drawStudentAnswersForDragReplaceQuestion(ctrl.studentAnswers, ctrl.events,
                        ctrl.isAttemptTwo, correctIds, isTimeline, null);
                    return ctrl.isPerfectScore;
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
                    return ctrl.drawStudentAnswers();
                }

                ctrl.initGrade = function() {
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
                    });

                    ctrl.studentAnswers['attempt'][ctrl.studentAnswers['attemptNumber']]['dragTarget'] = answersInDragTarget;
                };

                ctrl.gradeWorksheetQuestion = function () {
                    ctrl.initGrade();
                    return worksheetActivityCompletion.evaluateStudentAnswers(ctrl.studentAnswers, ctrl.questionData.index)
                        .then(function (data) {
                            return ctrl.evaluateResults(data);
                        });
                }


            }]);
})();
