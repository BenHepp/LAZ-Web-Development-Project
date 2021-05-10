(function () {
    'use strict';

    angular.module('shared.worksheet')

        .component('imageLabeling', {
            templateUrl: '/shared/js/angular/worksheet/image-labeling.html',
            controller: 'ImageLabelingController',
            bindings: {
                questionData: '<',
                studentAnswers: '<',
                isLastQuestion: '<'
            }
        })

        .controller('ImageLabelingController', ['worksheetService', 'worksheetActivityCompletion', 'worksheetUtils', '$element', '$scope',
            function (worksheetService, worksheetActivityCompletion, worksheetUtils, $element, $scope) {
                var ctrl = this;
                ctrl.maxAllowableWidth = 975;
                ctrl.defaultDragTargetHeight = 51;
                ctrl.naturalImageHeight = null;
                ctrl.naturalImageWidth = null;
                ctrl.ratioHeight = 1.0;
                ctrl.ratioWidth = 1.0;
                ctrl.dimensionsInited = false;
                ctrl.dragAndDrop = {};
                ctrl.dragAndDrop.droppedItems = [];
                ctrl.correctAnswers = [];
                ctrl.dragTargetOriginalPositionMap = {};
                ctrl.isPerfectScore = false;
                ctrl.isAttemptTwo = false;

                ctrl.$onInit = function () {

                    var choices = angular.copy(ctrl.questionData.choices);

                    // Filter choices that have drag targets.
                    // Sort based on drag target since questionData.choices reflects the answerBank
                    // order but not necessarily the drag_target order. Accomplished with angular deep copy above
                    // so we can modify the order of choicesWithDragTargets without updating ctrl.questionData.choices
                    // aka the answerBank order
                    ctrl.choicesWithDragTargets = _.filter(choices, function (choice) {
                        return worksheetUtils.isValidDragTarget(choice);
                    }).sort(function(a, b) {
                        return (a.drag_target[0] < b.drag_target[0]) ? -1 : (a.drag_target[0] > b.drag_target[0]) ? 1 : 0;
                    });

                    ctrl.hasTargetBorder = ctrl.questionData.hasTargetBorder;
                    ctrl.skipAutoGrade = ctrl.questionData.skipAutoGrade;
                    ctrl.dragAndDrop.answerBank = angular.copy(ctrl.questionData.choices);
                    ctrl.dragAndDrop.droppedItems = ctrl.choicesWithDragTargets.map(function(c) {
                        return {};
                    });

                    ctrl.dragAndDrop.autoRegenerate = ctrl.questionData.autoRegenerate;
                    ctrl.establishDragTargetDimensions();
                    ctrl.establishPrepopulatedItems();

                    //ctrl.readOnly = worksheetService.getReadOnly();
                    ctrl.isPreview = worksheetService.getIsPreview();


                    if (worksheetService.getReadOnly()) {
                        ctrl.correctAnswers = ctrl.populateCorrectAnswers();
                        _.each(ctrl.dragAndDrop.droppedItems, function(droppedItem, idx) {
                            droppedItem.answers = ctrl.correctAnswers[idx]['answers'];
                        });
                    }

                    if (ctrl.studentAnswers) {
                        ctrl.drawStudentAnswers();
                    }
                };

                ctrl.establishPrepopulatedItems = function() {
                    worksheetUtils.establishPrepopulatedItems(ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.droppedItems, ctrl.skipAutoGrade);
                };

                ctrl.populateCorrectAnswers = function() {
                    return worksheetUtils.populateCorrectAnswersForDragAndDrop(ctrl.questionData.choices, ctrl.correctAnswers, ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.autoRegenerate);
                };

                ctrl.removeDroppedItem = function(choiceToRemove, indexOfDropped) {
                    worksheetUtils.removeDroppedItem(ctrl.dragAndDrop.answerBank, ctrl.dragAndDrop.droppedItems, choiceToRemove, indexOfDropped);
                };

                ctrl.getIsDraggable = function () {
                    return worksheetUtils.getIsDraggable(worksheetService.getReadOnly(), ctrl.isPerfectScore, ctrl.isAttemptTwo);
                };

                ctrl.getIsDropped = function (item) {
                    return worksheetUtils.getIsDropped(item);
                };

                ctrl.getIsCorrect = function (item) {
                    return worksheetUtils.getIsCorrect(item, worksheetService.getReadOnly());
                };

                ctrl.getIsIncorrect = function (item) {
                    return worksheetUtils.getIsIncorrect(item, worksheetService.getReadOnly(), ctrl.isAttemptTwo, true);
                };

                ctrl.getIsRemovable = function (item) {
                    return worksheetUtils.getIsRemovable(item, worksheetService.getReadOnly(), ctrl.isPerfectScore, ctrl.isAttemptTwo);
                };

                ctrl.establishDragTargetDimensions = function() {
                    _.each(ctrl.choicesWithDragTargets, function(choice, idx) {
                        ctrl.dragAndDrop.droppedItems[idx] = {
                            "index": idx,
                            "dragTarget": parseInt(choice.drag_target[0]),
                            "width": parseInt(choice.drag_target_width[0]),
                            "height": parseInt(choice.drag_target_height[0]),
                            "left": parseInt(choice.start_position),
                            "top": parseInt(choice.end_position),
                            "answers": [{'item' : undefined}]
                        };
                        ctrl.dragTargetOriginalPositionMap[choice.drag_target[0]] = [];
                        ctrl.dragTargetOriginalPositionMap[choice.drag_target[0]].push({
                            "width": parseInt(choice.drag_target_width[0]),
                            "height": parseInt(choice.drag_target_height[0]),
                            "left": parseInt(choice.start_position),
                            "top": parseInt(choice.end_position)
                        });
                    });
                };

                ctrl.getDragTargetDimension = function(choice, index, property) {
                    if (!ctrl.dimensionsInited || !choice) {
                        return "0px";
                    }
                    var dragTargetOriginalPosition = ctrl.dragTargetOriginalPositionMap[index+1][0];
                    var dimension = parseInt(choice[property]);
                    var dragTargetTop = parseInt(choice['top']);
                    var yReposition = ctrl.defaultDragTargetHeight / 2;

                    if (property == 'left') {
                        if (dragTargetOriginalPosition.left + dragTargetOriginalPosition.width >= ctrl.naturalImageWidth) {
                            dimension = ctrl.naturalImageWidth - dragTargetOriginalPosition.width;
                        }
                        dimension *= ctrl.ratioWidth;
                    } else if (property == 'top') {
                        dimension = dragTargetTop - yReposition;
                        if (dragTargetOriginalPosition.top + ctrl.defaultDragTargetHeight >= ctrl.naturalImageHeight) {
                            dimension = ctrl.naturalImageHeight - ctrl.defaultDragTargetHeight;
                        }
                        dimension *= ctrl.ratioHeight;
                    } else if (property == 'width') {
                        dimension *= ctrl.ratioWidth;
                    } else if (property == 'height') {
                        dimension *= ctrl.ratioHeight;
                    }
                    return (dimension > 0 ? Math.floor(dimension) : 0) + "px";
                };


                ctrl.setRatioAdjustments = function() {
                    var image = angular.element('img[src="'+ ctrl.questionData.question_media.imagePath +'"]');
                    if (!image[0]) {
                        return;
                    }
                    ctrl.ratioWidth = image[0].width / ctrl.naturalImageWidth;
                    ctrl.ratioHeight = image[0].height / ctrl.naturalImageHeight;
                    $scope.$digest();
                };

                angular.element(window).on('resize', function() {
                    ctrl.setRatioAdjustments();
                });

                ctrl.$postLink = function () {
                    var image = $element.find('.js-question-text-image');
                    image.on('load', function() {
                        ctrl.dimensionsInited = true;
                        ctrl.naturalImageWidth = ctrl.questionData.question_text_image_width;
                        ctrl.naturalImageHeight = ctrl.questionData.question_text_image_height;

                        ctrl.maxWidth = ctrl.naturalImageWidth;
                        ctrl.maxHeight = ctrl.naturalImageHeight;

                        if (ctrl.naturalImageWidth >= ctrl.maxAllowableWidth) {
                            ctrl.maxWidth = ctrl.maxAllowableWidth;
                            ctrl.maxHeight = (ctrl.maxAllowableWidth / ctrl.naturalImageWidth) * ctrl.naturalImageHeight;
                        }

                        ctrl.naturalImageWidth = ctrl.maxWidth;
                        ctrl.naturalImageHeight = ctrl.maxHeight;
                        ctrl.setRatioAdjustments();
                    });
                };

                // TODO: same implementations as event sequencing?
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

                ctrl.gradeWorksheetQuestion = function () {
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

                    return worksheetActivityCompletion.evaluateStudentAnswers(ctrl.studentAnswers, ctrl.questionData.index)
                        .then(function (data) {
                            ctrl.studentAnswers.ids = data.ids;
                            ctrl.studentAnswers.isPerfectScore = (data.possiblePoints >= 0 && data.correctPoints == data.possiblePoints);
                            if (ctrl.studentAnswers.isPerfectScore) {
                                worksheetService.setBookmarkedQuestionIndex(worksheetService.getQuestionIndex() + 1);
                            }
                            return ctrl.drawStudentAnswers();
                        });
                };
            }]);
})();
