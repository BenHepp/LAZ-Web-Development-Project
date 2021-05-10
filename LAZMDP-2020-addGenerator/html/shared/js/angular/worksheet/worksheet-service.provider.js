(function () {
    'use strict';

    angular
        .module('shared.worksheet')
        .provider('worksheetService', worksheetService);

    function worksheetService () {
        var worksheetData;
        var currentWorksheetIndex;
        var permitMultipleWorksheetLayout;
        var startAtMenu;
        var startingWorksheetIndex;
        var isLastWorksheet;
        var readOnly;
        var isPreview;
        var isPackResult;
        var backLink;
        var isMobile;
        var resourceDeploymentId;
        var worksheetQuestionIndexParam;
        var questionIndexObj;
        var bookmarkedQuestionIndexObj;

        return {
            setWorksheetData: setWorksheetData,
            setParamResourceDeploymentId: setParamResourceDeploymentId,
            setParamQuestionIndex: setParamQuestionIndex,
            $get: ['_', '$sce', '$http', '$q', worksheetFactory]
        };

        function setParamResourceDeploymentId(paramResourceDeploymentId) {
            if (paramResourceDeploymentId)
                resourceDeploymentId = paramResourceDeploymentId;
        }

        function setParamQuestionIndex(paramQuestionIndex) {
            if (paramQuestionIndex) {
                currentWorksheetIndex = 0;
                worksheetQuestionIndexParam = paramQuestionIndex;
                questionIndexObj = {'questionIndex': worksheetQuestionIndexParam};
            }
        }

        function setWorksheetData(data) {
            worksheetData = data;
            if (data != 'none') {
                setPermitMultipleWorksheetLayout();
                setStartPosition();
            }
        }

        function setPermitMultipleWorksheetLayout() {
            permitMultipleWorksheetLayout = worksheetData.length > 1;
        }

        function setStartPosition() {
            var index = 0;

            while (
                worksheetData[index] &&
                worksheetData[index]['student_answers'] &&
                typeof worksheetData[index]['student_answers']['worksheet_completed_at'] === 'string'
                ) {
                ++index;
            }

            startAtMenu = index > 0 && worksheetData.length > 1;

            if (index === worksheetData.length) {
                startingWorksheetIndex = 0;
                isLastWorksheet = false;
            } else {
                startingWorksheetIndex = index;
                isLastWorksheet = worksheetData.length === index + 1;
            }
        }

        function worksheetFactory(_, $sce, $http, $q) {

            return {
                setWorksheetData: setWorksheetData,
                getIndexedWorksheetDataTrustAsHtml: getIndexedWorksheetDataTrustAsHtml,
                getWorksheetDataTrustAsHtml: getWorksheetDataTrustAsHtml,
                getPermitMultipleWorksheetLayout: getPermitMultipleWorksheetLayout,
                getStartAtMenu: getStartAtMenu,
                getStartingWorksheetIndex: getStartingWorksheetIndex,
                getIsWorksheetAlreadyCompleted: getIsWorksheetAlreadyCompleted,
                getIsLastWorksheet: getIsLastWorksheet,
                setIsLastWorksheet: setIsLastWorksheet,
                setReadOnly: setReadOnly,
                getReadOnly: getReadOnly,
                setIsPreview: setIsPreview,
                getIsPreview: getIsPreview,
                setIsPackResult: setIsPackResult,
                getIsPackResult: getIsPackResult,
                setBackLink: setBackLink,
                getBackLink: getBackLink,
                setIsMobile: setIsMobile,
                getIsMobile: getIsMobile,
                setResourceDeploymentId: setResourceDeploymentId,
                getResourceDeploymentId: getResourceDeploymentId,
                setWorksheetIndex: setWorksheetIndex,
                getWorksheetIndex: getWorksheetIndex,
                getWorksheetId: getWorksheetId,
                setQuestionIndex: setQuestionIndex,
                getQuestionIndex: getQuestionIndex,
                setBookmarkedIndexByIndex: setBookmarkedIndexByIndex,
                getBookmarkedIndexByIndex: getBookmarkedIndexByIndex,
                setBookmarkedQuestionIndex: setBookmarkedQuestionIndex,
                getBookmarkedQuestionIndex: getBookmarkedQuestionIndex,
                setStudentAnswersByIndex: setStudentAnswersByIndex,
                getStudentAnswersByIndex: getStudentAnswersByIndex,
                setCompletedAtByIndex: setCompletedAtByIndex,
                getCompletedAtByIndex: getCompletedAtByIndex,
                getBackgroundClass: getBackgroundClass,
                getBackgroundImage: getBackgroundImage,
                getWorksheetData: getWorksheetData
            };

            function getWorksheetData() {
                var deferred = $q.defer();

                if (worksheetData == "none") {
                    return updateWorksheetData().then(function(data) {
                        if (data != undefined && data != null) {
                            worksheetData = data;
                            setPermitMultipleWorksheetLayout();
                            setStartPosition();
                            setQuestionIndex(worksheetQuestionIndexParam);
                        } else {
                            setPermitMultipleWorksheetLayout();
                            setStartPosition();
                        }
                    });
                }
                deferred.resolve(worksheetData);
                return deferred.promise;
            }

            function updateWorksheetData() {
                if(navigator.userAgent.match(/Android/i) != null) {
                    //android
                    LazAndroidConnector.mobileWorksheet(resourceDeploymentId, worksheetQuestionIndexParam);
                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                }else if((navigator.userAgent.match(/iPhone|iPod|iPad/i) != null) && navigator.userAgent.match(/Safari/i) == null) {
                    //iosNonSafari
                    window.location = 'ios://mobileWorksheet#resourceDeploymentId=' + resourceDeploymentId + '&worksheetQuestionIndex=' + worksheetQuestionIndexParam;
                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                }

                //want to use the api, until then access the json from file system
                var worksheetDataQueryUrl = "/api/mobile/worksheet/"+resourceDeploymentId+"/n/"+worksheetQuestionIndexParam;
                return $http.get(worksheetDataQueryUrl)
                    .then(function(response) {
                        setPermitMultipleWorksheetLayout();
                        setStartPosition();
                        return response.data;
                    });
            }

            function setWorksheetData(data) {
                worksheetData = data;
                return worksheetData;
            }

            function getWorksheetDataTrustAsHtml() {
                var allWorksheetInfo = [];

                _.each(worksheetData, function (data, index) {
                    allWorksheetInfo.push(getIndexedWorksheetDataTrustAsHtml(index));
                });

                return allWorksheetInfo;
            }

            function getIndexedWorksheetDataTrustAsHtml(index) {
                var worksheet = angular.copy(worksheetData[index]);

                worksheet.quiz_info.title = $sce.trustAsHtml(worksheet.quiz_info.title);
                worksheet.quiz_info.displayTitle = $sce.trustAsHtml(worksheet.quiz_info.displayTitle);
                worksheet.quiz_info.razBookTitle = $sce.trustAsHtml(worksheet.quiz_info.razBookTitle);
                worksheet.quiz_info.copyright = $sce.trustAsHtml(worksheet.quiz_info.copyright);

                return getQuestionsTrustAsHtml(worksheet);
            }

            function getQuestionsTrustAsHtml(worksheet) {
                _.each(worksheet.quiz_info.questions, function (question) {
                    question.prompt = $sce.trustAsHtml(question.prompt);
                    question.instructions = $sce.trustAsHtml(question.instructions);
                    question.passage.title = $sce.trustAsHtml(question.passage.title);
                    question.passage.text = $sce.trustAsHtml(question.passage.text);
                    question.background_image = $sce.trustAsHtml(question.background_image);
                    _.each(question.charts, function(chart) {
                        _.each(chart.columns, function (col) {
                            if (col.label !== '') {
                                col.label = $sce.trustAsHtml(col.label);
                            }
                        });
                        _.each(chart.rows, function (row) {
                            if (row.label !== '') {
                                row.label = $sce.trustAsHtml(row);
                            }
                        })
                    });
                    _.each(question.choices, function (choice) {
                        choice.answer = $sce.trustAsHtml(choice.answer);
                    })
                });

                return worksheet;
            }

            function getPermitMultipleWorksheetLayout() {
                return permitMultipleWorksheetLayout;
            }

            function getStartAtMenu() {
                return startAtMenu;
            }

            function getStartingWorksheetIndex() {
                return startingWorksheetIndex;
            }

            function getIsWorksheetAlreadyCompleted() {
                return typeof worksheetData[currentWorksheetIndex]['student_answers']['worksheet_completed_at'] === 'string';
            }

            function setIsLastWorksheet(count) {
                isLastWorksheet = worksheetData.length === count;
            }

            function getIsLastWorksheet() {
                return isLastWorksheet;
            }

            function setReadOnly(isReadOnly) {
                readOnly = isReadOnly;
            }

            function getReadOnly() {
                return readOnly;
            }

            function setIsPreview(preview) {
                isPreview = preview;
            }

            function getIsPreview() {
                return isPreview;
            }

            function setIsPackResult(packResult) {
                isPackResult = packResult;
            }

            function getIsPackResult() {
                return isPackResult;
            }

            function setBackLink(link) {
                backLink = link;
            }

            function getBackLink() {
                return backLink;
            }

            function setIsMobile(mobile) {
                isMobile = mobile;
            }

            function getIsMobile() {
                return isMobile;
            }

            function setResourceDeploymentId(resDeploymentId) {
                resourceDeploymentId = resDeploymentId;
            }

            function getResourceDeploymentId() {
                return resourceDeploymentId;
            }

            function setWorksheetIndex(index) {
                currentWorksheetIndex = index;
            }

            function getWorksheetIndex() {
                return currentWorksheetIndex;
            }

            function getWorksheetId() {
                return worksheetData[currentWorksheetIndex].quiz_info.test_id;
            }

            function setQuestionIndex(questionIdx) {
                questionIdx = parseInt(questionIdx);
                if (questionIdx > worksheetData[currentWorksheetIndex].quiz_info.questions.length) {
                    questionIdx = worksheetData[currentWorksheetIndex].quiz_info.questions.length;
                }
                questionIndexObj = {'questionIndex': questionIdx};
            }

            function getQuestionIndex() {
                if (questionIndexObj == undefined || questionIndexObj == null) {
                    return null;
                }
                return questionIndexObj.questionIndex;
            }

            function setBookmarkedIndexByIndex(nextQuestionIndex, index) {
                if (nextQuestionIndex > worksheetData[currentWorksheetIndex].quiz_info.questions.length) {
                    nextQuestionIndex = worksheetData[currentWorksheetIndex].quiz_info.questions.length;
                }

                worksheetData[index].bookmarkedIndex = nextQuestionIndex;
            }

            function getBookmarkedIndexByIndex(index) {
                return worksheetData[index].bookmarkedIndex;
            }

            function setBookmarkedQuestionIndex(bookmarkedIdx) {
                bookmarkedIdx = parseInt(bookmarkedIdx);

                if (bookmarkedIdx > worksheetData[currentWorksheetIndex].quiz_info.questions.length) {
                    bookmarkedIdx = worksheetData[currentWorksheetIndex].quiz_info.questions.length;
                }

                if (isPreview && getIsWorksheetAlreadyCompleted()) {
                    bookmarkedIdx = 1;
                }

                bookmarkedQuestionIndexObj = {'questionIndex': bookmarkedIdx};
            }

            function getBookmarkedQuestionIndex() {
                return bookmarkedQuestionIndexObj.questionIndex;
            }

            function setStudentAnswersByIndex(answers, index, questionIndex) {
                if (_.isEmpty(worksheetData[index].student_answers)) {
                    worksheetData[index].student_answers = answers;
                } else {
                    worksheetData[index].student_answers.question[questionIndex] = answers.question[questionIndex];
                }

                worksheetData[index].student_answers.worksheet_completed_at = answers.worksheet_completed_at;
            }

            function getStudentAnswersByIndex(index) {
                return worksheetData[index].student_answers;
            }

            function setCompletedAtByIndex(stringValue, index) {
                worksheetData[index].student_answers.worksheet_completed_at = stringValue;
            }

            function getCompletedAtByIndex(index) {
                return worksheetData[index].student_answers.worksheet_completed_at;
            }

            function getBackgroundClass() {
                if (worksheetData[currentWorksheetIndex]['quiz_info']['questions'][getQuestionIndex()-1]['question_format_name'] == 'read-only') {
                    return "worksheet-readOnly";
                }
                return null;
            }

            function getBackgroundImage() {
                return worksheetData[currentWorksheetIndex]['quiz_info']['questions'][getQuestionIndex()-1]['background_image'];
            }
        }
    }
})();
