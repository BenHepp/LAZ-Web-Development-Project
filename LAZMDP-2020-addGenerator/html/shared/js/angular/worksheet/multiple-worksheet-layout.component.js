(function () {
    "use strict";

    angular
        .module('shared.worksheet')
        .component('multipleWorksheetLayout', {
            templateUrl: '/shared/js/angular/worksheet/multiple-worksheet-layout.html',
            controller: 'MultipleWorksheetLayoutController',
            bindings: {
                goToWorksheet: '&'
            }
        })
        .controller('MultipleWorksheetLayoutController', MultipleWorksheetLayoutController);

    MultipleWorksheetLayoutController.$inject = ['worksheetService', '_'];

    function MultipleWorksheetLayoutController(worksheetService, _) {
        var ctrl = this;

        ctrl.$onInit = function() {
            ctrl.worksheetData = worksheetService.getWorksheetDataTrustAsHtml();
            ctrl.isPackResult = worksheetService.getIsPackResult();
            ctrl.passThreshold = 0.80;

            var activityId = ctrl.worksheetData[0]['student_answers']['activity_id'];
            var studentId = ctrl.worksheetData[0]['student_answers']['student_id'];

            ctrl.displayTitle = ctrl.worksheetData[0].quiz_info.displayTitle;
            ctrl.categoryName = ctrl.worksheetData[0].quiz_info.category;

            ctrl.linkToStudentArea = worksheetService.getBackLink();

            ctrl.linkToPackDetails =
                "/main/ActivityPreview/id/" + worksheetService.getResourceDeploymentId() +
                "/activity_id/" + activityId +
                "/return/true";

            ctrl.linkToPackResult =
                "/main/WorksheetReport/activity-id/" + activityId +
                "/resource-deployment-id/" + worksheetService.getResourceDeploymentId() +
                "/student-id/" + studentId +
                "/get-pack-result/true";

            if (ctrl.worksheetData && ctrl.isPackResult) {
                ctrl.setPackResultData();
            }
        };

        ctrl.goToSelectedWorksheet = function(index) {
            ctrl.goToWorksheet(index);
        };

        ctrl.isWorksheetComplete = function(worksheet) {
            return (worksheet['student_answers']['worksheet_completed_at'] && !worksheetService.getIsPreview());
        };

        ctrl.activateSpecificWorksheet = function(index, worksheet) {
            var indexedWorksheet = ctrl.worksheetData[index-1];
            var currentWorksheetCompleted = ctrl.isWorksheetComplete(worksheet);
            var previousWorksheetCompleted = indexedWorksheet && indexedWorksheet['student_answers'] && indexedWorksheet['student_answers']['worksheet_completed_at'];
            var nextWorksheetReady = !currentWorksheetCompleted && previousWorksheetCompleted;

            ctrl.activated = worksheetService.getIsPreview() || index === 0 || currentWorksheetCompleted || nextWorksheetReady;

            return ctrl.activated;
        };

        ctrl.deactivateSpecificWorksheet = function(index, worksheet) {
            return !ctrl.activated && index !== 0 && ! worksheet['student_answers']['worksheet_completed_at']
        };

        ctrl.getTitleImagePath = function(worksheet) {
            return worksheet.quiz_info.title_media.imagePath;
        };

        ctrl.setPackResultData = function() {
            ctrl.scoreResultsPerWorksheet = [];
            ctrl.percentageResultsPerWorksheet = [];

            _.each(ctrl.worksheetData, function (result) {
                var totalCorrectPoints = 0;
                var totalPossiblePoints = 0;
                _.each(result.points, function (pointSet) {
                    totalCorrectPoints += pointSet.correctPoints;
                    totalPossiblePoints += pointSet.possiblePoints;
                });
                var scoreOverall = totalCorrectPoints / totalPossiblePoints;
                var percentageOverall = Math.floor(100 * scoreOverall);
                ctrl.scoreResultsPerWorksheet.push(scoreOverall);
                ctrl.percentageResultsPerWorksheet.push("" + percentageOverall + "%");
            });
        };

        ctrl.doReturnToReadingBookRoom = function() {
            return (
                worksheetService.getBackLink().indexOf('/main/ReadingBookRoom') !== -1 ||
                worksheetService.getBackLink().indexOf('/main/MyAssignment') !== -1
            )
        };

        ctrl.doReturnToPackResult = function() {
            return worksheetService.getBackLink().indexOf('/main/WorksheetReport') !== -1;
        }
    }
})();
