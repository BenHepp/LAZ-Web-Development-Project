(function () {
    'use strict';

    angular
        .module('shared.worksheet')
        .service('worksheetActivityCompletion', ['worksheetService', '_', '$http', '$window', '$q', worksheetActivityCompletionService]);

    function worksheetActivityCompletionService(worksheetService, _, $http, $window, $q) {
        var service = this;

        service.activeWorksheetController = null;
        service.isActivityCompletion = false;
        service.studentLoginLink = '/main/Login/reset/student';

        service.setActiveWorksheetController = function(worksheetController) {
            service.activeWorksheetController = worksheetController;
        };

        service.evaluateStudentAnswers = function(studentAnswers, questionIndex) {
            var url = '/api/resource/worksheet/student_answers';
            var data = {
                'student_answers' : studentAnswers,
                'worksheet_id'    : worksheetService.getWorksheetId(),
                'resource_deployment_id' : worksheetService.getResourceDeploymentId(),
                'question_index'  : questionIndex
            };

            if(navigator.userAgent.match(/Android/i) != null) {
                //android
                LazAndroidConnector.evaluateStudentAnswers(worksheetService.getResourceDeploymentId(), questionIndex,worksheetService.getWorksheetId(),studentAnswers);
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }else if((navigator.userAgent.match(/iPhone|iPod|iPad/i) != null) && navigator.userAgent.match(/Safari/i) == null) {
                //iosNonSafari
                window.location = 'ios://evaluateStudentAnswers#resourceDeploymentId=' + worksheetService.getResourceDeploymentId() +
                                  '&worksheetQuestionIndex=' + questionIndex +
                                  '&worksheetId=' + worksheetService.getWorksheetId() +
                                  '&studentAnswers=' + JSON.stringify(studentAnswers);
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }
            return $http
                .post(url, data)
                .then(function (response) {
                    service.updateWorksheetDataOnEvaluation(response);
                    return response.data;
                })
                .catch(function (error) {
                    var errorMessage = "The function 'evaluateStudentAnswers' has failed. Redirecting now.";
                    service.redirectElsewhere(errorMessage, service.studentLoginLink);
                });
        };

        service.recordActivityBookmark = function() {
            if (! service.isActivityCompletion) {
                // TODO (aselleke, 10/15/2018): Release the commented-out function once it has been properly written and vetted
                //service.saveNonScoredStudentAnswers();
                service.savePosition();
            }
        };

        service.saveNonScoredStudentAnswers = function() {
            var type = 'POST';
            var url = '/api/activity/worksheet-non-scored-student-answers';
            var data = {
                'non_scored_student_answers' : service.activeWorksheetController.getStudentAnswers(),
                'worksheet_id'    : worksheetService.getWorksheetId(),
                'question_index'  : worksheetService.getQuestionIndex()
            };

            service.synchronousAjaxRequest(type, url, data);
        };

        service.savePosition = function() {
            var type = 'POST';
            var url = '/api/activity/bookmark';
            var data = {
                'activity_bookmark' : worksheetService.getBookmarkedQuestionIndex()
            };

            service.synchronousAjaxRequest(type, url, data);
        };

        service.recordWorksheetComplete = function() {
            var deferred = $q.defer();
            var url = "/api/resource/worksheet/completion";
            var data = {
                'worksheet_id': worksheetService.getWorksheetId()
            };

            $http
                .post(url, data)
                .then(function(response) {
                    deferred.resolve(response);
                    service.updateWorksheetDataOnCompletion();
                })
                .catch(function(error) {
                    var errorMessage = "The function 'recordWorksheetComplete' has failed. Redirecting now.";
                    service.redirectElsewhere(errorMessage, service.studentLoginLink);
                });

            return deferred.promise;
        };

        service.recordActivityComplete = function() {
            var url = "/api/activity/completion";
            var data = {};

            $http
                .post(url, data)
                .then(function() {
                    service.isActivityCompletion = true;
                    $window.location.href = '/main/ActivityReward/id/' + worksheetService.getResourceDeploymentId();
                })
                .catch(function(error) {
                    var errorMessage = "The function 'recordActivityComplete' has failed. Redirecting now.";
                    service.redirectElsewhere(errorMessage, service.studentLoginLink);
                });
        };

        service.updateWorksheetDataOnEvaluation = function(response) {
            var nextQuestionIndex = Object.keys(response.data.currentResults.question).length + 1;
            var currentWorksheetIndex = worksheetService.getWorksheetIndex();

            worksheetService.setBookmarkedIndexByIndex(nextQuestionIndex, currentWorksheetIndex);
            worksheetService.setBookmarkedQuestionIndex(nextQuestionIndex);
            worksheetService.setStudentAnswersByIndex(response.data.currentResults, currentWorksheetIndex, nextQuestionIndex-1);

            var worksheetData = worksheetService.getWorksheetDataTrustAsHtml();

            _.each(worksheetData, function (data, index) {
                if (worksheetService.getWorksheetId() === data.quiz_info.test_id) {
                    worksheetService.setStudentAnswersByIndex(worksheetService.getStudentAnswersByIndex(currentWorksheetIndex), index, nextQuestionIndex-1);
                    worksheetService.setBookmarkedIndexByIndex(nextQuestionIndex, index);
                }
            });
        };

        service.updateWorksheetDataOnCompletion = function() {
            var currentWorksheetIndex = worksheetService.getWorksheetIndex();
            var worksheetData = worksheetService.getWorksheetDataTrustAsHtml();
            var count = 0;

            worksheetService.setCompletedAtByIndex('true', currentWorksheetIndex);

            _.each(worksheetData, function (data, index) {
                if (worksheetService.getWorksheetId() === data.quiz_info.test_id) {
                    worksheetService.setCompletedAtByIndex('true', index);
                }

                if (typeof worksheetService.getCompletedAtByIndex(index) === 'string') {
                    ++count;
                }
            });

            worksheetService.setIsLastWorksheet(count);
        };

        service.redirectElsewhere = function (errorMessage, redirectLink) {
            console.log(errorMessage);
            $window.location = redirectLink;
        };

        service.synchronousAjaxRequest = function(type, url, data) {
            angular.element.ajax({
                async : false,
                type  : type,
                url   : url,
                data  : data
            });
        }
    }
})();
