(function () {
    'use strict';

    angular.module('shared.worksheet')

        .component('dragReplace', {
            templateUrl: '/shared/js/angular/worksheet/drag-replace.html',
            controller: 'DragReplaceController',
            bindings: {
                questionData: '<',
                studentAnswers: '<',
                isLastQuestion: '<'
            }
        })
        .controller('DragReplaceController', ['worksheetService', 'worksheetActivityCompletion', 'worksheetUtils',
            function (worksheetService, worksheetActivityCompletion, worksheetUtils) {
                var ctrl = this;
                ctrl.dragAndReplace = {};
                ctrl.correctAnswers = [];
                ctrl.GRID = 'grid';
                ctrl.LIST = 'list';

                ctrl.$onInit = function () {

                    ctrl.dragAndReplace.items = angular.copy(ctrl.questionData.choices);

                    ctrl.cols = ctrl.questionData.charts[0].columns.length;
                    ctrl.rows = ctrl.questionData.charts[0].rows.length;

                    ctrl.mode = ctrl.cols > 1 ? ctrl.GRID : ctrl.LIST;

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
                    return worksheetUtils.populateCorrectAnswersForDragAndReplace(ctrl.dragAndReplace.items);
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

                ctrl.drawStudentAnswers = function () {
                    var attemptNumber = ctrl.studentAnswers.attemptNumber;
                    ctrl.isPerfectScore = ctrl.studentAnswers.isPerfectScore;
                    ctrl.isAttemptTwo = attemptNumber == 2 ? true : false;
                    var correctIds = ctrl.studentAnswers.ids;
                    var isTimeline = false;
                    worksheetUtils.drawStudentAnswersForDragReplaceQuestion(ctrl.studentAnswers, ctrl.dragAndReplace.items,
                        ctrl.isAttemptTwo, correctIds, isTimeline, null);
                    return ctrl.isPerfectScore;
                };

                ctrl.gradeWorksheetQuestion = function () {
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

                    return worksheetActivityCompletion.evaluateStudentAnswers(ctrl.studentAnswers, ctrl.questionData.index)
                        .then(function (data) {
                            ctrl.studentAnswers.ids = data.ids;
                            ctrl.studentAnswers.isPerfectScore = (data.possiblePoints >= 0 && data.correctPoints == data.possiblePoints);
                            ctrl.isPerfectScore = ctrl.studentAnswers.isPerfectScore;
                            if (ctrl.studentAnswers.isPerfectScore) {
                                worksheetService.setBookmarkedQuestionIndex(worksheetService.getQuestionIndex() + 1);
                            }
                            return ctrl.drawStudentAnswers();
                        });
                }

            }]);
})();
