(function () {
    'use strict';

    angular
        .module('shared.worksheet')
        .component('worksheet', {
            templateUrl: '/shared/js/angular/worksheet/worksheet.html',
            controller: 'WorksheetController',
            bindings: {
                resourceDeploymentId: '<',
                worksheetIndex: '<',
                isMobile: '<',
                isPreview: '<',
                isReadOnly: '<',
                isPackResult: '<',
                showAnswerToggle: '<?',
                backLink: '@'
            }
        })
        .controller('WorksheetController', WorksheetController);

    WorksheetController.$inject = ['$scope','worksheetService', 'worksheetActivityCompletion', 'onBeforeUnload', '_'];

    function WorksheetController($scope, worksheetService, worksheetActivityCompletion, onBeforeUnload, _) {
        var ctrl = this;

        ctrl.studentAnswers = {};
        ctrl.showWorksheet = true;

        ctrl.$onInit = function() {
            ctrl.multipleLayoutBackButtonWording = ctrl.isPackResult ? 'Back' : 'Back';
            ctrl.worksheetDataStatus = "pending";
            ctrl.showAnswerToggle = ctrl.showAnswerToggle == undefined ? false : ctrl.showAnswerToggle;

            worksheetService.getWorksheetData().then(function () {
                ctrl.initWorksheet();
            }, ctrl.checkForbidden);

            $scope.$on('worksheet:data', function (event, data) {
                data = JSON.parse(data);
                worksheetService.setWorksheetData(data);
                ctrl.initWorksheet();
                $scope.$apply();
            });
        };

        ctrl.toggleReadOnly = function (enabledReadOnly) {
            if (angular.isDefined(enabledReadOnly)) {
                ctrl.isReadOnly = enabledReadOnly;
                ctrl.goToWorksheet(worksheetService.getWorksheetIndex(),worksheetService.getQuestionIndex());
            }
            return ctrl.isReadOnly;
        };

        ctrl.initWorksheet = function() {
            ctrl.worksheetDataStatus = "completed";
            ctrl.permitMultipleWorksheetLayout = worksheetService.getPermitMultipleWorksheetLayout();
            if (ctrl.worksheetIndex >= 0) {
                ctrl.goToWorksheet(ctrl.worksheetIndex,null);
            } else {
                ctrl.goToWorksheet(worksheetService.getStartingWorksheetIndex(),null);
            }

            if (ctrl.permitMultipleWorksheetLayout && worksheetService.getStartAtMenu()) {
                ctrl.goToMultipleWorksheetLayout();
            }
        };

        ctrl.goToWorksheet = function(index,questionIndex) {
            worksheetService.setWorksheetIndex(index);
            ctrl.showWorksheet = true;
            ctrl.allWorksheetInfo = worksheetService.getIndexedWorksheetDataTrustAsHtml(index);
            ctrl.worksheet = ctrl.allWorksheetInfo.quiz_info;
            ctrl.worksheet.numQuestionsRange = _.range(1, ctrl.worksheet.questions.length+1);
            ctrl.sortChoicesDisplay();
            ctrl.studentAnswers = ctrl.allWorksheetInfo.student_answers;

            worksheetService.setIsMobile(ctrl.isMobile);
            worksheetService.setIsPreview(ctrl.isPreview);
            worksheetService.setReadOnly(ctrl.isReadOnly);
            worksheetService.setIsPackResult(ctrl.isPackResult);
            worksheetService.setBackLink(ctrl.backLink);
            worksheetService.setResourceDeploymentId(ctrl.resourceDeploymentId);
            worksheetService.setBookmarkedQuestionIndex(ctrl.allWorksheetInfo.bookmarkedIndex);
            if (questionIndex == undefined || questionIndex == null) {
                if (worksheetService.getQuestionIndex() == undefined || worksheetService.getQuestionIndex() == null) {
                    worksheetService.setQuestionIndex(worksheetService.getBookmarkedQuestionIndex());
                }
            } else {
                worksheetService.setQuestionIndex(questionIndex);
            }

            ctrl.questionIndex = worksheetService.getQuestionIndex();
        };

        ctrl.goToMultipleWorksheetLayout = function() {
            ctrl.showWorksheet = false;
        };

        ctrl.currentQuestionIndex = function() {
            return worksheetService.getQuestionIndex(ctrl.currentQuestionIndex);
        };

        ctrl.backgroundClass = function() {
            return worksheetService.getBackgroundClass();
        };

        ctrl.backgroundImage = function() {
            return worksheetService.getBackgroundImage();
        };

        ctrl.getStudentAnswersForQuestion = function(questionIndex) {
            ctrl.studentAnswers = worksheetService.getStudentAnswersByIndex(worksheetService.getWorksheetIndex());

            if (ctrl.studentAnswers['question']) {
                return ctrl.studentAnswers['question'][questionIndex];
            }
        };

        ctrl.getIsLastQuestion = function(questionIndex) {
            return parseInt(questionIndex) === ctrl.worksheet.questions.length;
        };

        // Sort based on display_order then fall back on answer_id
        ctrl.sortChoicesDisplay = function() {
            _.each(ctrl.worksheet.questions, function (question) {
                if (question.choices) {
                    question.choices.sort(function (a, b) {
                        return (a.display_order < b.display_order)
                            ? -1
                            : (a.display_order > b.display_order)
                                ? 1
                                : (a.answer_id < b.answer_id)
                                    ? -1
                                    : (a.answer_id > b.answer_id)
                                        ? 1
                                        : 0;
                    })
                }
            });
        };

        ctrl.checkForbidden = function() {
            ctrl.requestStatus = reason.status = HttpStatus.FORBIDDEN
                ? "forbidden"
                : "failed";
        }
    }
})();
