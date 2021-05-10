(function () {
    'use strict';

    angular
        .module('shared.worksheet')
        .component('constructedResponse', {
            templateUrl: '/shared/js/angular/worksheet/constructed-response.html',
            controller: 'ConstructedResponseController',
            bindings: {
                questionData: '<',
                studentAnswers: '<',
                isLastQuestion: '<'
            }
        })
        .controller('ConstructedResponseController', ['worksheetService', 'worksheetActivityCompletion',
            function (worksheetService, worksheetActivityCompletion) {
                var ctrl = this;
                ctrl.MAX_LENGTH = 21800;
                ctrl.isTemplateWithNoAnswersToGrade = true;
                ctrl.studentConstructedResponse = "";
                ctrl.readOnly = worksheetService.getReadOnly();
                ctrl.isPreview = worksheetService.getIsPreview();

                ctrl.$onInit = function () {
                    if (ctrl.studentAnswers) {
                        ctrl.drawStudentAnswers();
                    }
                };

                ctrl.textAreaIsEmpty = function () {
                    return angular.element('textarea').val() === "";
                };

                ctrl.getIsDisabled = function () {
                    return worksheetService.getReadOnly() || ctrl.isPerfectScore;
                };

                ctrl.drawStudentAnswers = function () {
                    var attemptNumber = ctrl.studentAnswers.attemptNumber;
                    ctrl.isPerfectScore = ctrl.studentAnswers.isPerfectScore;
                    ctrl.isAttemptTwo = attemptNumber == 2 ? true : false;
                    ctrl.studentConstructedResponse = ctrl.studentAnswers.attempt[attemptNumber].constructed_prose_response;
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
                };

                ctrl.initGrade = function() {
                    if (!ctrl.studentAnswers) {
                        ctrl.studentAnswers = {};
                        ctrl.studentAnswers['attemptNumber'] = 1;
                    } else {
                        ctrl.studentAnswers['attemptNumber'] = 2;
                    }

                    ctrl.studentAnswers['attempt'] = {};
                    ctrl.studentAnswers['attempt'][ctrl.studentAnswers['attemptNumber']] = {};
                    ctrl.studentAnswers['attempt'][ctrl.studentAnswers['attemptNumber']] = {'constructed_prose_response': angular.element('textarea').val()};
                };

                ctrl.gradeWorksheetQuestion = function () {
                    ctrl.initGrade();
                    return worksheetActivityCompletion.evaluateStudentAnswers(ctrl.studentAnswers, ctrl.questionData.index)
                        .then(function (data) {
                            return ctrl.evaluateResults(data);
                        });
                };
            }])
})();
