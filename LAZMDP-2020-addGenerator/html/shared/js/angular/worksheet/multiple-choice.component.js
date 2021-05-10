(function () {
    'use strict';

    angular.module('shared.worksheet')

        .component('multipleChoice', {
            templateUrl: '/shared/js/angular/worksheet/multiple-choice.html',
            controller: 'MultipleChoiceController',
            bindings: {
                questionData: '<',
                studentAnswers: '<',
                isLastQuestion: '<'
            }
        })

        .controller('MultipleChoiceController', ['worksheetService', 'worksheetActivityCompletion',
            function (worksheetService, worksheetActivityCompletion) {
                var ctrl = this;
                //ctrl.readOnly = false;
                ctrl.anAnswerIsSelected = false;
                var prevSelectedChoice = null;
                var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

                ctrl.$onInit = function () {

                    ctrl.multipleChoices = ctrl.questionData.choices.map(function (choice, idx) {
                        return {'data': choice, 'letter': alphabet[idx]};
                    });

                    //ctrl.readOnly = worksheetService.getReadOnly();
                    ctrl.isPreview = worksheetService.getIsPreview();

                    if (worksheetService.getReadOnly()) {
                        _.find(ctrl.multipleChoices, function(choice) {
                            if (choice.data.is_correct) {
                                choice.isActive = true;
                                return true;
                            }
                        })
                    }

                    if (ctrl.studentAnswers) {
                        ctrl.drawStudentAnswers();
                    }
                };

                ctrl.selectAnswer = function (choice) {
                    if (worksheetService.getReadOnly() || ctrl.isPerfectScore || ctrl.isAttemptTwo) {
                        return;
                    }
                    if (prevSelectedChoice !== null) {
                        prevSelectedChoice.isActive = false;
                    }
                    prevSelectedChoice = choice;
                    choice.isActive = true;
                    ctrl.anAnswerIsSelected = true;
                };

                ctrl.getIsCorrect = function (choice) {
                    return choice.data.is_correct && !worksheetService.getReadOnly();
                };

                ctrl.getIsIncorrect = function (choice) {
                    return choice.isActive && choice.data.is_correct === false && !worksheetService.getReadOnly() && !ctrl.isAttemptTwo;
                };

                ctrl.getIsDisabled = function (choice) {
                    return worksheetService.getReadOnly() || ctrl.isPerfectScore || ctrl.isAttemptTwo || choice.is_correct;
                };

                ctrl.drawStudentAnswers = function () {
                    var attemptNumber = ctrl.studentAnswers.attemptNumber;
                    ctrl.isPerfectScore = ctrl.studentAnswers.isPerfectScore;
                    ctrl.isAttemptTwo = attemptNumber == 2 ? true : false;
                    var correctAnswerId = ctrl.studentAnswers.ids[0];
                    var studentAnswerId = ctrl.studentAnswers.attempt[attemptNumber].answer_id;
                    ctrl.anAnswerIsSelected = true;

                    var correctChoice = null;
                    _.find(ctrl.multipleChoices, function(choice) {
                        if (choice.data.answer_id === correctAnswerId) {
                            correctChoice = choice;
                            return true;
                        }
                    });

                    _.each(ctrl.multipleChoices, function(choice) {
                        if (choice.data.answer_id === studentAnswerId) {
                            choice.isActive = true;
                            prevSelectedChoice = choice;
                            if (studentAnswerId === correctAnswerId) {
                                choice.data.is_correct = true;
                            } else {
                                if (attemptNumber === 1) {
                                    choice.data.is_correct = false;
                                } else { // Show correct answer
                                    choice.isActive = false;
                                    correctChoice.isActive = true;
                                }
                            }
                        }
                    });
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
                    var multipleChoiceSelected = angular.element('.js-multipleChoice_choice.active:visible');

                    if (!ctrl.studentAnswers) {
                        ctrl.studentAnswers = {};
                        ctrl.studentAnswers['attemptNumber'] = 1;
                    } else {
                        ctrl.studentAnswers['attemptNumber'] = 2;
                    }

                    ctrl.studentAnswers['attempt'] = {};
                    ctrl.studentAnswers['attempt'][ctrl.studentAnswers['attemptNumber']] = {};
                    ctrl.studentAnswers['attempt'][ctrl.studentAnswers['attemptNumber']] = {'answer_id': multipleChoiceSelected.attr('data-answerid')};
                };

                ctrl.gradeWorksheetQuestion = function () {
                    ctrl.initGrade();
                    return worksheetActivityCompletion.evaluateStudentAnswers(ctrl.studentAnswers, ctrl.questionData.index)
                        .then(function (data) {
                            ctrl.evaluateResults(data);
                        });
                };
            }]);
})();
