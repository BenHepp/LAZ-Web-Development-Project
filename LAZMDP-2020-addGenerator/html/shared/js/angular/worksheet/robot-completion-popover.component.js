(function () {
    "use strict";

    angular
        .module('shared.worksheet')
        .component('robotCompletionPopover', {
            templateUrl: '/shared/js/angular/worksheet/robot-completion-popover.html',
            controller: 'RobotCompletionPopoverController',
            bindings: {
                // Worksheet questions's template controller so we can call the correct gradeWorksheetQuestion function
                templateCtrl: '<',
                requiresAtLeastOneStudentAnswer: '<'
            }
        })
        .controller('RobotCompletionPopoverController', ['worksheetService', 'worksheetActivityCompletion', '_', '$timeout','$scope',
            function RobotCompletionPopoverController(worksheetService, worksheetActivityCompletion, _, $timeout, $scope) {
                var ctrl = this;
                ctrl.clickedCheckAnswers = false;
                ctrl.scoreIsEvaluated = false;

                ctrl.$onInit = function () {
                    $scope.$on('worksheet:evaluate-student-answers', function (event, response) {
                        response = JSON.parse(response);
                        ctrl.templateCtrl.initGrade();
                        worksheetActivityCompletion.updateWorksheetDataOnEvaluation(response);
                        ctrl.templateCtrl.evaluateResults(response.data);
                        ctrl.clickedCheckAnswers = true;
                        ctrl.scoreIsEvaluated = true;
                        $scope.$apply();
                    });
                };

                ctrl.nextQuestion = function() {
                    var currentQuestionIndex = worksheetService.getQuestionIndex();
                    worksheetService.setQuestionIndex(++currentQuestionIndex);
                    ctrl.clickedCheckAnswers = false;
                    angular.element('body').css({'overflow': 'auto'});
                };

                ctrl.closePopover = function () {
                    ctrl.clickedCheckAnswers = false;
                    angular.element('body').css({'overflow': 'auto'});
                };

                ctrl.clickCheckAnswers = function () {
                    ctrl.clickedCheckAnswers = true;
                    ctrl.scoreIsEvaluated = false;
                    angular.element('body').css({'overflow': 'hidden'});
                    ctrl.templateCtrl.gradeWorksheetQuestion()
                        .then(function () {
                            ctrl.scoreIsEvaluated = true;
                        });
                };

                ctrl.studentHasAtLeastOneAnswer = function () {
                    if (angular.element('.js-multipleChoice_choice').length !== 0) {
                        return ctrl.templateCtrl.anAnswerIsSelected;
                    }
                    if (angular.element('.js-constructedResponseTextarea').length !== 0) {
                        return !ctrl.templateCtrl.textAreaIsEmpty();
                    }
                    if (angular.element('.highlightCategory_answerBank').length !== 0) {
                        // return ctrl.templateCtrl.hasStudentMarkedUpElt;
                        return true; // TODO: Determine if student has anything marked up
                    }
                    var foundAnswer = _.find(ctrl.templateCtrl.dragAndDrop.droppedItems, function(dragTargetAnswers) {
                        return dragTargetAnswers.answers.some(function(answer) {
                            return answer.item && answer.item.answer && !answer.item.prepopulate;
                        })
                    });
                    return foundAnswer ? true : false;
                };

                // SkipAutoGrade mode requires student to answer all targets
                ctrl.shouldDisableForSkipAutoGrade = function (skipAutoGrade) {
                    if (!skipAutoGrade) {
                        return false;
                    } else {
                        var foundEmptyAnswer = _.find(ctrl.templateCtrl.dragAndDrop.droppedItems, function(dragTargetAnswers) {
                            return dragTargetAnswers.answers.some(function(answer) {
                                return !answer.item;
                            })
                        });
                        return foundEmptyAnswer ? true : false;
                    }
                };

                ctrl.worksheetAlreadyCompleted = function() {
                    return worksheetService.getIsWorksheetAlreadyCompleted();
                };

                ctrl.clickDone = function() {
                    worksheetActivityCompletion.recordWorksheetComplete().then(function() {
                        if (worksheetService.getIsLastWorksheet()) {
                            worksheetActivityCompletion.recordActivityComplete()
                        } else {
                            ctrl.openWorksheetMenu();
                            ctrl.closePopover();
                        }
                    });
                };

                ctrl.openWorksheetMenu = function() {
                    $timeout(function() { angular.element('#worksheet-menu-button').triggerHandler('click'); }, 0);
                }
            }
        ]);
})();
