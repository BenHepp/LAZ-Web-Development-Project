(function () {
    'use strict';

    angular.module('shared.worksheet')
        .service('worksheetUtils', ['worksheetService', utils]);

    function utils(worksheetService) {

        var self = this;

        self.isValidDragTarget = function (choice) {
            return (
                choice.drag_target &&
                choice.drag_target !== null &&
                choice.drag_target !== '' &&
                choice.drag_target.length > 0);
        };

        self.getLinkId = function (linkId) {
            if (linkId) {
                return linkId;
            }
            return Date.now();
        };

        // Taken from underscore.js
        self.chunk = function (array, count) {
            if (count == null || count < 1) return [];
            var result = [];
            var i = 0, length = array.length;
            while (i < length) {
                result.push(array.slice(i, i += count));
            }
            return result;
        };

        self.getIsDraggable = function (readOnly, isPerfectScore, isAttemptTwo) {
            return !(readOnly || isPerfectScore || isAttemptTwo);
        };

        self.getIsDropped = function (item) {
            return item && item.answer && !item.prepopulate;
        };

        self.getIsCorrect = function (item, readOnly) {
            return item && item.is_correct && !readOnly && !item.prepopulate;
        };

        self.getIsIncorrect = function (item, readOnly, isAttemptTwo, isDragAndDropAnswer) {
            return item && (isDragAndDropAnswer ? !item.answer : true) && item.is_correct === false
                && !(readOnly || item.prepopulate || isAttemptTwo);
        };

        self.getIsRemovable = function (item, readOnly, isPerfectScore, isAttemptTwo) {
            return item && item.answer && !(readOnly || item.prepopulate || item.is_correct || isPerfectScore || isAttemptTwo);
        };

        self.removeDroppedItem = function (answerBank, droppedItems, choiceToRemove,
                                           indexOfDropped, isContainerMode, hasTargetBorder, attemptNumber,
                                           numAnswersPerDragTarget) {

            // Restore option in answerBank
            _.each(answerBank, function (choice) {
                if (choice.answer_id == choiceToRemove.answer_id) {
                    choice.isHidden = false;
                }
            });

            // Remove from droppedItem list
            _.each(droppedItems, function (choice, idx) {
                if (idx == indexOfDropped) {
                    _.find(droppedItems[idx].answers, function (answer, answerIdx) {
                        if (answer['item'] && answer['item'].answer_id == choiceToRemove.answer_id) {
                            if (answer['item'].is_correct == false) {
                                answer['item'] = {'is_correct': false};
                            } else {
                                answer['item'] = undefined;
                            }

                            //Move undefined element to the end of the array and shift others up - add placeholders if appropriate
                            if (isContainerMode && !hasTargetBorder && attemptNumber === 1) {
                                answer['item'] = undefined;
                                droppedItems[idx].answers.push(droppedItems[idx].answers.splice(answerIdx, 1)[0]);
                                self.establishPlaceholders(droppedItems[idx].answers, numAnswersPerDragTarget);
                            }
                            return true;
                        }
                    });
                }
            });
        };

        self.establishPlaceholders = function (answersArray, numAnswersPerDragTarget) {
            var currentNumAnswers = 0;
            _.each(answersArray, function (answer) {
                if (answer.item !== undefined && !answer.item.placeholder) {
                    ++currentNumAnswers;
                }
            });
            var numPlaceholders = numAnswersPerDragTarget - currentNumAnswers;
            for (var i = 0; i < numPlaceholders; ++i) {
                answersArray[currentNumAnswers + i].item = {'placeholder': true};
            }
        };

        self.establishPrepopulatedItems = function (answerBank, droppedItems, skipAutoGrade) {
            _.each(answerBank, function (item, idx) {
                if (item.prepopulate) {
                    _.each(item.drag_target, function (dragTarget) {
                        _.find(droppedItems[dragTarget - 1]['answers'], function (answer) {
                            if (answer.item === undefined) {
                                answer.item = item;
                                return true;
                            }
                        });
                    });
                    if (!skipAutoGrade) {
                        answerBank[idx].isHidden = true;
                    }
                }
            });
        };

        // Need special logic for templates like main idea detail/cause and effect since there are
        // interchangable options between the same drag target (e.g., all details and all effects have the same drag target)
        self.establishPrepopulatedItemsForCharts = function (answerBank, droppedItems) {
            _.each(answerBank, function (choice) {
                if (choice.prepopulate) {
                    var dragTarget = choice.drag_target[0];
                    var idx = self.findOpenDragTarget(dragTarget, droppedItems);
                    droppedItems[dragTarget - 1]['answers'][idx]['item'] = choice;
                    choice.isHidden = true;
                }
            })
        };

        self.establishSelectHighlightPrepopulatedItems = function (correctAnswers, isPassage, division) {
            _.each(correctAnswers, function (answer) {
                if (answer.prepopulate) {
                    self.showMarkUp(answer, correctAnswers, isPassage, division, answer.prepopulate);
                }
            });
        };

        self.showMarkUp = function(answer, correctAnswers, isPassage, division, isPrepopulated) {
            var elementId = '#highlight-sentence-';
            if (!isPassage) {
                elementId = '#highlight-word-' + (parseInt(answer.display_order)-1) + '-';
            } else if (division == 'word') {
                elementId = '#highlight-word-0-';
            }

            for (var i=answer.start_position; i<=answer.end_position; i++) {
                var answerElementId = elementId + i;
                var thisId = angular.element(answerElementId);
                angular.element(thisId.selector).addClass('display-' + answer.display_type);
                if (isPrepopulated) {
                    angular.element(thisId.selector).addClass('display-' + answer.display_type + '-is-prepopulated');
                }
                if (answer.display_type == 'circle') {
                    if (i == answer.start_position) {
                        angular.element(thisId.selector).addClass('left-circle');
                    }
                    if (i == answer.end_position) {
                        angular.element(thisId.selector).addClass('right-circle');
                    }
                }

                if (answer.display_type == 'superscript') {
                    if (i == answer.start_position) {
                        angular.element(thisId.selector).prepend('<sup>' + answer.display_order + '</sup>');
                    }
                }
            }
        }

        self.getPrepopulatedSuperScriptIndex = function(answer) {
            for (var i=0; i<=answer.length; i++) {
                if (answer[i].prepopulate != undefined) {
                    return i;
                }
            }
        }

        // Need to find first open drag target in case some are prepopulated
        self.findOpenDragTarget = function (dragTarget, droppedItems) {
            var answersInTarget = droppedItems[dragTarget - 1].answers;
            return answersInTarget.findIndex(function (answer) {
                return !answer.item;
            })
        };

        self.populateDroppedItems = function (choices, correctAnswers) {
            _.each(choices, function (choice) {
                if (choice.is_correct) {
                    _.each(choice.drag_target, function () {
                        if (choice.multiple_target_type === 'or') {
                            if (!choice.markedCorrect) {
                                correctAnswers.push({'item': choice});
                                choice.markedCorrect = true;
                            }
                        } else {
                            correctAnswers.push({'item': choice});
                        }
                    });
                }
            });
        };

        self.hideAnswerBankItems = function (answerBank, autoRegenerate) {
            // Hide answers in answerBank if they were correct & autoRegen is off
            if (!autoRegenerate) {
                _.each(answerBank, function (choice) {
                    if (choice.is_correct) {
                        choice.isHidden = true;
                    }
                })
            }
        };

        self.populateCorrectAnswersForDragAndDrop = function (choices, correctAnswers, answerBank, autoRegenerate) {

            self.populateDroppedItems(choices, correctAnswers);
            self.hideAnswerBankItems(answerBank, autoRegenerate);

            var dragTargetToCorrectAnswers = [];
            _.each(correctAnswers, function (answer) {
                if (answer.item.is_correct) {

                    // Construct drag target to correct answers map
                    _.each(answer.item.drag_target, function (dragTarget) {
                        var dragTargetIndexAdjusted = dragTarget - 1;
                        dragTargetToCorrectAnswers[dragTargetIndexAdjusted] = dragTargetToCorrectAnswers[dragTargetIndexAdjusted] || {'answers': []};
                        if (answer.item.drag_target.length == 1) {
                            dragTargetToCorrectAnswers[dragTargetIndexAdjusted]['answers'].push(answer);
                        } else {
                            if (dragTargetToCorrectAnswers[dragTargetIndexAdjusted]['answers'] == false ||
                                (dragTargetToCorrectAnswers[dragTargetIndexAdjusted]['answers'].findIndex(function (answerInMap) {
                                    return answerInMap.item.answer_id == answer.item.answer_id
                                }) == -1)) {

                                if (answer.item.multiple_target_type === 'or') {
                                    if (!answer.placed && dragTargetToCorrectAnswers[dragTargetIndexAdjusted]['answers'].length === 0) {
                                        dragTargetToCorrectAnswers[dragTargetIndexAdjusted]['answers'].push(answer);
                                        answer.placed = true;
                                    }
                                } else {
                                    dragTargetToCorrectAnswers[dragTargetIndexAdjusted]['answers'].push(answer);
                                }
                            }
                        }
                    });
                }
            });

            correctAnswers = dragTargetToCorrectAnswers;

            // Within the answers for a drag target, sort prepopulate first
            _.each(dragTargetToCorrectAnswers, function (answersInDragTarget) {
                answersInDragTarget.answers.sort(function (answer1, answer2) {
                    answer1 = answer1.item;
                    answer2 = answer2.item;

                    if (answer1.prepopulate === false && answer2.prepopulate === true) {
                        return 1;
                    } else if (answer1.prepopulate === true && answer2.prepopulate === false) {
                        return -1;
                    } else {
                        return 0;
                    }
                })
            });
            return correctAnswers;
        };

        self.populateCorrectAnswersForDragAndReplace = function (dragAndReplaceItems) {
            dragAndReplaceItems.sort(function (item1, item2) {
                return item1.drag_target[0] < item2.drag_target[0]
                    ? -1 : item1.drag_target[0] > item2.drag_target[0]
                        ? 1 : 0;
            });
            return dragAndReplaceItems;
        };

        self.populateCorrectAnswersForSelectHighlight = function (correctAnswers, isPassage, division) {
            _.each(correctAnswers, function (answer) {
                if (answer.is_correct) {
                    self.showMarkUp(answer, correctAnswers, isPassage, division, answer.prepopulate);
                }
            });
        };

        /************** Grading Related Functions ***************/

        self.drawStudentAnswersForDragTargetQuestion = function (studentAnswers, answerBank, droppedItems, autoRegenerate,
                                                                 isAttemptTwo, correctIds, keepIncorrectInTarget, skipAutoGrade,
                                                                 multipleTargetTypes, questionFormatNameForCharts) {

            // Clear out droppedItems so we can paint the UI correct/incorrect from scratch
            // Know what the student selected via studentAnswers
            _.each(droppedItems, function (droppedItem) {
                _.each(droppedItem.answers, function (answer) {
                    if ((answer.item || answer.item == '') && !answer.item.prepopulate) {
                        answer.item = undefined;
                    }
                });
            });

            // Reset seen parameters for multipleTargetTypes
            _.each(multipleTargetTypes, function (targetType) {
                targetType.seen = false;
            });

            var dragTargetsToCorrectAnswerIdsMap = {};
            var dragTargetsToCorrectAnswersMap = {};
            var dragTargetsToStudentAnswerIdsMap = {};
            var dragTargetsToStudentAnswersMap = {};
            var attemptNumber = studentAnswers.attemptNumber;
            self.setUpDragTargetToAnswerMaps(studentAnswers, answerBank, correctIds, dragTargetsToCorrectAnswerIdsMap,
                dragTargetsToCorrectAnswersMap, dragTargetsToStudentAnswerIdsMap, dragTargetsToStudentAnswersMap, attemptNumber, questionFormatNameForCharts);

            if (!skipAutoGrade) {
                self.setStudentAnswerIsCorrect(studentAnswers, attemptNumber, dragTargetsToCorrectAnswerIdsMap, multipleTargetTypes);
            }

            // Update droppedItems to reflect is_correct values
            // For each drag target
            _.each(studentAnswers.attempt[attemptNumber].dragTarget, function (studentAnswersForDragTarget) {

                // For each student answer in a drag target (usually just one)
                _.each(studentAnswersForDragTarget, function (studentAnswer) {
                    var droppedItemsIndex = parseInt(studentAnswer.drag_target) - 1;
                    var indexWithinDragTarget = 0;
                    var dragTarget = parseInt(studentAnswer.drag_target);

                    // Determine if space for element in array, if not increment index
                    // This is only a case if we have multiple answers per drag target or it's prepopulated
                    while (self.isOccupiedDragTarget(isAttemptTwo, droppedItems[droppedItemsIndex].answers[indexWithinDragTarget].item, skipAutoGrade)) {
                        ++indexWithinDragTarget;
                    }

                    // Find item in answerBank that matches the correct student answer and copy to droppedItems
                    var foundMatchingAnswerInBank = false;
                    _.find(answerBank, function (answer) {

                        if (answer.answer_id == studentAnswer.answer_id) {
                            foundMatchingAnswerInBank = true;

                            if (studentAnswer.is_correct) {
                                droppedItems[droppedItemsIndex].answers[indexWithinDragTarget]['item'] = angular.copy(answer);
                                droppedItems[droppedItemsIndex].answers[indexWithinDragTarget]['item']['is_correct'] = true;
                                self.setIsHidden(answer, autoRegenerate);
                            }
                            else {
                                self.markIncorrectOrShowAnswer(answer, attemptNumber, droppedItems, autoRegenerate,
                                    droppedItemsIndex, indexWithinDragTarget, dragTarget, keepIncorrectInTarget, skipAutoGrade,
                                    dragTargetsToCorrectAnswersMap, dragTargetsToStudentAnswerIdsMap, multipleTargetTypes);
                            }
                            // Once a matching answer is found, don't need to loop anymore
                            return true;
                        }
                    });
                    // Student did not select an answer for this target
                    if (!foundMatchingAnswerInBank) {
                        self.markIncorrectOrShowAnswer({}, attemptNumber, droppedItems, autoRegenerate,
                            droppedItemsIndex, indexWithinDragTarget, dragTarget, keepIncorrectInTarget, skipAutoGrade,
                            dragTargetsToCorrectAnswersMap, dragTargetsToStudentAnswerIdsMap, multipleTargetTypes);
                    }
                });
            });

            self.addEmptyTargetHints(keepIncorrectInTarget, skipAutoGrade, droppedItems, dragTargetsToCorrectAnswerIdsMap);

            // Set answers in answer bank hidden if they have a drag_target
            if (isAttemptTwo) {
                _.each(answerBank, function (answer) {
                    if (answer.drag_target.length) {
                        self.setIsHidden(answer, autoRegenerate);
                    } else {
                        answer.isHidden = false;
                    }
                })
            }
        };

        self.setUpDragTargetToAnswerMaps = function (studentAnswers, answerBank, correctIds,
                                                     dragTargetsToCorrectAnswerIdsMap, dragTargetsToCorrectAnswersMap,
                                                     dragTargetsToStudentAnswerIdsMap, dragTargetsToStudentAnswersMap,
                                                     attemptNumber, questionFormatNameForCharts) {
            // {drag_target1 => [answer_id1, answer_id2 ...], ... }
            _.each(answerBank, function (answer) {
                if (correctIds.indexOf(answer.answer_id) > -1) {

                    // Usually only one drag target for an answer
                    _.each(answer.drag_target, function (dragTarget) {
                        dragTargetsToCorrectAnswerIdsMap[dragTarget] = dragTargetsToCorrectAnswerIdsMap[dragTarget] || [];
                        dragTargetsToCorrectAnswerIdsMap[dragTarget].push(answer.answer_id);

                        dragTargetsToCorrectAnswersMap[dragTarget] = dragTargetsToCorrectAnswersMap[dragTarget] || [];
                        answer.seen = false;
                        dragTargetsToCorrectAnswersMap[dragTarget].push(answer);
                    });
                }
            });

            // {drag_target1 => [studentAnswer1, studentAnswer2 ...], ... }
            _.each(studentAnswers.attempt[attemptNumber], function (dragTargets) {
                _.each(dragTargets, function (studentAnswersPerDragTarget) {
                    // Usually only one answer per drag target
                    _.each(studentAnswersPerDragTarget, function (studentAnswer) {
                        dragTargetsToStudentAnswerIdsMap[studentAnswer.drag_target] = dragTargetsToStudentAnswerIdsMap[studentAnswer.drag_target] || [];
                        dragTargetsToStudentAnswersMap[studentAnswer.drag_target] = dragTargetsToStudentAnswersMap[studentAnswer.drag_target] || [];

                        dragTargetsToStudentAnswerIdsMap[studentAnswer.drag_target].push(studentAnswer.answer_id);
                        dragTargetsToStudentAnswersMap[studentAnswer.drag_target].push(studentAnswer);
                    });
                });
            });

            // Account for correctness among charts - must get main idea and size of chart correct for chart to be correct
            if (questionFormatNameForCharts == 'mainIdea') {
                var chartDragTargetsWithAnswerIds = angular.copy(dragTargetsToCorrectAnswerIdsMap);
                var chartDragTargetsWithAnswers = angular.copy(dragTargetsToCorrectAnswersMap);

                _.each(studentAnswers.attempt[attemptNumber], function (dragTargets) {
                    _.each(dragTargets, function (studentAnswersPerDragTarget) {
                        _.each(studentAnswersPerDragTarget, function (studentAnswer) {
                            if (studentAnswer.drag_target % 2 == 1) {
                                var startOfChartDragTarget = parseInt(self.findChartDragTargetStartWithThisMainIdea(studentAnswer, dragTargetsToStudentAnswerIdsMap, chartDragTargetsWithAnswerIds));
                                if (startOfChartDragTarget !== 0) {
                                    self.updateDragTargetToCorrectAnswerMapsBasedOnChart(dragTargetsToCorrectAnswerIdsMap, dragTargetsToCorrectAnswersMap,
                                        chartDragTargetsWithAnswerIds, chartDragTargetsWithAnswers, parseInt(studentAnswer.drag_target), startOfChartDragTarget);
                                }
                            }
                        });
                    });
                });
            }
        };

        self.findChartDragTargetStartWithThisMainIdea = function (studentAnswer, dragTargetsToStudentAnswerIdsMap, charts) {
            // Loop through odd drag targets for main ideas
            var dragTarget = 1;
            while (charts[dragTarget] !== undefined) {
                var thisSizeOfChart = charts[dragTarget].length + charts[dragTarget + 1].length;
                // odd drag targets are main ideas, and there's only one answerId in that target
                if (dragTarget % 2 == 1 && charts[dragTarget][0] == studentAnswer.answer_id) {
                    if (self.findSizeOfChartWithThisStudentAnswer(studentAnswer, dragTargetsToStudentAnswerIdsMap) === thisSizeOfChart) {
                        return dragTarget;
                    } else {
                        return 0;
                    }
                }
                dragTarget += 2;
            }
            return 0;
        };

        self.findSizeOfChartWithThisStudentAnswer = function (studentAnswer, dragTargetsToStudentAnswerIdsMap) {
            var numMainIdeasInChart = 1;
            var numDetails = dragTargetsToStudentAnswerIdsMap[parseInt(studentAnswer.drag_target) + 1].length;
            return numDetails + numMainIdeasInChart;
        };

        self.updateDragTargetToCorrectAnswerMapsBasedOnChart = function (dragTargetsToCorrectAnswerIdsMap, dragTargetsToCorrectAnswersMap,
                                                                         chartsWithAnswerIds, chartsWithAnswers, studentDragTarget, startOfChartDragTarget) {
            var mainIdeaDragTarget = studentDragTarget;
            dragTargetsToCorrectAnswerIdsMap[mainIdeaDragTarget] = [];
            dragTargetsToCorrectAnswersMap[mainIdeaDragTarget] = [];
            var detailDragTarget = mainIdeaDragTarget + 1;
            dragTargetsToCorrectAnswerIdsMap[detailDragTarget] = [];
            dragTargetsToCorrectAnswersMap[detailDragTarget] = [];

            // Remap main ideas for correctness
            dragTargetsToCorrectAnswerIdsMap[mainIdeaDragTarget] = chartsWithAnswerIds[startOfChartDragTarget];
            dragTargetsToCorrectAnswerIdsMap[detailDragTarget] = chartsWithAnswerIds[startOfChartDragTarget + 1];

            dragTargetsToCorrectAnswersMap[mainIdeaDragTarget] = chartsWithAnswers[startOfChartDragTarget];
            dragTargetsToCorrectAnswersMap[detailDragTarget] = chartsWithAnswers[startOfChartDragTarget + 1];
        };

        self.addEmptyTargetHints = function (keepIncorrectInTarget, skipAutoGrade, droppedItems, dragTargetsToCorrectAnswerIdsMap) {
            // Add empty boxes to guide student that more answers are needed
            if (keepIncorrectInTarget && !skipAutoGrade) {
                _.each(droppedItems, function (droppedItem, idx) {
                    var dragTarget = idx + 1;
                    var numCorrectAnswers = dragTargetsToCorrectAnswerIdsMap[dragTarget].length;
                    for (var i = 0; i < numCorrectAnswers; ++i) {
                        if (droppedItem.answers[i].item === undefined) {
                            droppedItem.answers[i].item = {'placeholder': true, 'is_correct': false};
                        } else if (droppedItem.answers[i].item.prepopulate) {
                            // Prepopulated answers are not included in the count, so need to increment to ensure
                            // number of placeholders is correct
                            ++numCorrectAnswers;
                        }
                    }
                })
            }
        };

        self.setStudentAnswerIsCorrect = function (studentAnswers, attemptNumber, dragTargetsToCorrectAnswerIdsMap, multipleTargetTypes) {
            // Mark student answers is_correct
            // For each drag target
            _.each(studentAnswers.attempt[attemptNumber].dragTarget, function (studentAnswersForDragTarget) {
                // For each student answer in drag target
                // Usually only one answer per drag target
                _.each(studentAnswersForDragTarget, function (studentAnswer) {
                    if (!studentAnswer.answer_id) {
                        studentAnswer['is_correct'] = false;
                    } else {
                        // If multiple target types are 'or', the answer is interchangable with another target
                        // and need to only mark one correct and the other incorrect
                        if (multipleTargetTypes === null
                            || multipleTargetTypes[studentAnswer.answer_id].type === 'and'
                            || (multipleTargetTypes[studentAnswer.answer_id].type === 'or'
                                && !multipleTargetTypes[studentAnswer.answer_id].seen)) {
                            studentAnswer['is_correct'] = dragTargetsToCorrectAnswerIdsMap[studentAnswer.drag_target].indexOf(studentAnswer.answer_id) > -1;
                            if (studentAnswer['is_correct'] && multipleTargetTypes !== null) {
                                multipleTargetTypes[studentAnswer.answer_id].seen = true;
                            }
                        } else {
                            studentAnswer['is_correct'] = false;
                        }
                    }
                });
            });
        };

        self.markIncorrectOrShowAnswer = function (answer, attemptNumber, droppedItems, autoRegenerate, droppedItemIndex,
                                                   indexWithinDragTarget, dragTarget, keepIncorrectInTarget, skipAutoGrade,
                                                   dragTargetsToCorrectAnswersMap, dragTargetsToStudentAnswerIdsMap, multipleTargetTypes) {
            if (attemptNumber == 1) {
                if (keepIncorrectInTarget || skipAutoGrade) {
                    var answer = angular.copy(answer);
                    if (skipAutoGrade) {
                        // Student answers should not be marked as prepopulated if no grade
                        answer.prepopulate = false;
                    }
                    droppedItems[droppedItemIndex].answers[indexWithinDragTarget]['item'] = answer;
                    if (!skipAutoGrade) {
                        droppedItems[droppedItemIndex].answers[indexWithinDragTarget]['item'].is_correct = false;
                    }
                } else {
                    droppedItems[droppedItemIndex].answers[indexWithinDragTarget]['item'] = {'is_correct': false};
                }
                if (answer) {
                    answer.isHidden = false;
                }
            } else { // Attempt 2
                // Usually only one answer per target, but in the case of multiple answers we need to mark a specific one as correct
                _.find(dragTargetsToCorrectAnswersMap[dragTarget], function (answerInTarget) {

                    // StudentAnswer was incorrect, so select a correct one that the student did *not* answer if not autoregenerate to fill the box
                    if (!answerInTarget.seen && dragTargetsToStudentAnswerIdsMap[dragTarget].indexOf(answerInTarget.answer_id) == -1
                        && !self.studentAlreadyAnsweredThisDragTarget(dragTargetsToStudentAnswerIdsMap, dragTarget, answerInTarget, multipleTargetTypes)) {
                        var answerInTargetCopy = angular.copy(answerInTarget);

                        droppedItems[droppedItemIndex].answers[indexWithinDragTarget]['item'] = answerInTargetCopy;
                        droppedItems[droppedItemIndex].answers[indexWithinDragTarget]['item'].is_correct = null;
                        if (answerInTarget.drag_target.length == 1
                            || (multipleTargetTypes && multipleTargetTypes[parseInt(answerInTarget.answer_id)].type === 'or')) {
                            answerInTarget['seen'] = true;
                        }
                        worksheetService.setBookmarkedQuestionIndex(worksheetService.getQuestionIndex() + 1);
                        return true;
                    }
                    return false;
                });
            }
        };

        // For fill in the blanks with multiple target types possible of 'or', need to determine
        // if student already selected this answer for the other possible blank
        self.studentAlreadyAnsweredThisDragTarget = function (dragTargetsToStudentAnswerIdsMap, dragTarget, answerInTarget, multipleTargetTypes) {
            if (!multipleTargetTypes || answerInTarget.drag_target.length === 1) {
                return false;
            }
            var foundOtherStudentAnswer = _.find(answerInTarget.drag_target, function (target) {
                if (target !== dragTarget) {
                    if (multipleTargetTypes[dragTargetsToStudentAnswerIdsMap[target][0]]
                        && multipleTargetTypes[dragTargetsToStudentAnswerIdsMap[target][0]].type === 'or'
                        && dragTargetsToStudentAnswerIdsMap[target] == answerInTarget.answer_id) {
                        return true;
                    }
                }
            });
            return foundOtherStudentAnswer ? true : false;
        };

        self.isOccupiedDragTarget = function (isAttemptTwo, item, skipAutoGrade) {
            if (skipAutoGrade) {
                return item !== undefined;
            }
            if (isAttemptTwo) {
                return (item !== undefined && item.answer_id !== undefined) ? true : false;
            }
            return item !== undefined && (item.is_correct !== null || item.prepopulate);
        };

        self.setIsHidden = function (answer, autoRegenerate) {
            if (!autoRegenerate) {
                answer.isHidden = true;
            }
        };

        self.drawStudentAnswersForDragReplaceQuestion = function (studentAnswers, dragItems, isAttemptTwo, correctIds, isTimeline, multipleTargetTypes) {
            var dragTargetsToCorrectAnswerIdsMap = {};
            var dragTargetsToCorrectAnswersMap = {};
            var dragTargetsToStudentAnswerIdsMap = {};
            var dragTargetsToStudentAnswersMap = {};
            var answerIdToAnswerMap = {};
            var attemptNumber = studentAnswers.attemptNumber;

            // Reset seen parameters for multipleTargetTypes
            _.each(multipleTargetTypes, function (targetType) {
                targetType.seen = false;
            });

            _.each(dragItems, function (item) {
                _.each(item.drag_target, function (dragTarget) {
                    dragTargetsToCorrectAnswerIdsMap[dragTarget] = dragTargetsToCorrectAnswerIdsMap[dragTarget] || [];
                    dragTargetsToCorrectAnswerIdsMap[dragTarget].push(item.answer_id);
                    dragTargetsToCorrectAnswersMap[dragTarget] = dragTargetsToCorrectAnswersMap[dragTarget] || [];
                    dragTargetsToCorrectAnswersMap[dragTarget].push(item);
                    answerIdToAnswerMap[item.answer_id] = item;
                });
            });
            _.each(studentAnswers.attempt[attemptNumber], function (dragTargets) {
                _.each(dragTargets, function (studentAnswersPerDragTarget) {
                    // Usually only one answer per drag target
                    _.each(studentAnswersPerDragTarget, function (studentAnswer) {
                        dragTargetsToStudentAnswerIdsMap[studentAnswer.drag_target] = studentAnswer.answer_id;
                        dragTargetsToStudentAnswersMap[studentAnswer.drag_target] = answerIdToAnswerMap[studentAnswer.answer_id];
                    });
                });
            });

            self.setStudentAnswerIsCorrect(studentAnswers, attemptNumber, dragTargetsToCorrectAnswerIdsMap, multipleTargetTypes);

            // Update dragItems to reflect is_correct values
            // For each drag target
            _.each(studentAnswers.attempt[attemptNumber].dragTarget, function (studentAnswersForDragTarget) {
                // For each student answer in a drag target (usually just one)
                _.find(studentAnswersForDragTarget, function (studentAnswer) {

                    var dragTargetIndex = isTimeline ? parseInt(studentAnswer.drag_target) / 2 - 1 : parseInt(studentAnswer.drag_target) - 1;

                    if (studentAnswer.prepopulate) {
                        return false;
                    }
                    if (studentAnswer.is_correct) {
                        dragItems[dragTargetIndex] = dragTargetsToStudentAnswersMap[studentAnswer.drag_target];
                        dragItems[dragTargetIndex]['is_correct'] = true;

                        // Mark a specific correct answer in map in the case of multiple target types
                        if (multipleTargetTypes) {
                            _.find(dragTargetsToCorrectAnswersMap[studentAnswer.drag_target], function (correctAnswerInTarget) {
                                if (correctAnswerInTarget.answer_id == studentAnswer.answer_id) {
                                    correctAnswerInTarget.seen = true;
                                    return true;
                                }
                            });
                        }
                    } else {
                        if (attemptNumber == 1) {
                            dragItems[dragTargetIndex] = dragTargetsToStudentAnswersMap[studentAnswer.drag_target];
                            dragItems[dragTargetIndex]['is_correct'] = false;
                        } else { // Showing answer key
                            if (dragTargetsToCorrectAnswersMap[studentAnswer.drag_target].length === 1) {
                                dragItems[dragTargetIndex] = dragTargetsToCorrectAnswersMap[studentAnswer.drag_target][0];
                                dragTargetsToCorrectAnswersMap[studentAnswer.drag_target][0].seen = true;
                            }
                            // In the case of multipleTargetTypes, need to fill incorrect answer with one that hasn't been used yet
                            else {
                                if (multipleTargetTypes) {
                                    _.each(dragTargetsToCorrectAnswersMap[studentAnswer.drag_target], function (correctAnswerInDragTarget) {
                                        if (!correctAnswerInDragTarget.seen) {
                                            dragItems[dragTargetIndex] = correctAnswerInDragTarget;
                                            correctAnswerInDragTarget.seen = true;
                                        }
                                    })
                                }
                                else {
                                    console.error("Multiple target types not found!");
                                }
                            }
                        }
                    }
                })
            })
        };

        self.drawStudentAnswersAndScoreForHighlightQuestion = function (studentAnswers, isAttemptTwo, correctMarkupRanges,
                                                                        displayTypes, elementIdStartName, division, isPassage,
                                                                        sentences, displayTypeIdToDisplayType, sentenceIdToIndex) {
            var attemptNumber = studentAnswers.attemptNumber;
            var incorrectSentences = [];
            self.drawStudentAnswersWithMarkup(displayTypes, displayTypeIdToDisplayType, sentenceIdToIndex, division, elementIdStartName, sentences, studentAnswers, attemptNumber);
            var correctPoints = self.gradeStudentAnswersWithMarkup(correctMarkupRanges, displayTypes, displayTypeIdToDisplayType, sentenceIdToIndex,
                                                                    sentences, division, elementIdStartName, isAttemptTwo, studentAnswers, attemptNumber,
                                                                    incorrectSentences);
            if (correctPoints < 0) {
                correctPoints = 0;
            }

            console.log("SCORE: " + correctPoints);
            return correctPoints;
        };

        self.getElt = function (division, elementIdStartName, sentenceIndex, currentPos) {
            var currentElt = angular.element('#'+ elementIdStartName + currentPos);
            if (division === 'word') {
                currentElt = angular.element('#'+ elementIdStartName + sentenceIndex + '-' + currentPos);
            }
            return currentElt;
        };

        self.drawStudentAnswersWithMarkup = function (displayTypes, displayTypeIdToDisplayType, sentenceIdToIndex,
                                                      division, elementIdStartName, sentences,
                                                      studentAnswers, attemptNumber) {
            _.each(displayTypes, function(displayTypeName) {
                _.each(studentAnswers.attempt[attemptNumber]['displayType'][displayTypeName], function (studentMarkup) {
                    var startPos = parseInt(studentMarkup.start_position);
                    var endPos = parseInt(studentMarkup.end_position);
                    var displayOrder = parseInt(studentMarkup.display_order);
                    var displayType = displayTypeIdToDisplayType[studentMarkup.display_type_id];
                    var sentenceId = parseInt(studentMarkup.sentence_id) || null;
                    var sentenceIndex = sentenceId ? sentenceIdToIndex[sentenceId] : 0;
                    var currentPos = startPos;

                    while (currentPos <= endPos) {
                        var currentElt = self.getElt(division, elementIdStartName, sentenceIndex, currentPos);
                        currentElt.addClass('display-' + displayType);

                        if (displayType === 'superscript' && currentPos === startPos) {
                            currentElt.prepend('<sup>' + displayOrder + '</sup>');
                        }
                        if (displayType === 'circle') {
                            if (currentPos === startPos) {
                                currentElt.addClass('left-circle');
                            }
                            if (currentPos === endPos) {
                                currentElt.addClass('right-circle');
                            }
                        }
                        ++currentPos;
                    }
                })
            });
        };

        self.gradeStudentAnswersWithMarkup = function (correctMarkupRanges, displayTypes, displayTypeIdToDisplayType, sentenceIdToIndex,
                                                       sentences, division, elementIdStartName, isAttemptTwo, studentAnswers, attemptNumber,
                                                       incorrectSentences) {
            var correctPoints = 0;
            var incorrectPoints = 0;

            if (!isAttemptTwo) {
                correctPoints = self.setStudentMarkupCorrect(correctMarkupRanges, division, elementIdStartName, sentenceIdToIndex, isAttemptTwo);
                incorrectPoints = self.setStudentMarkupIncorrect(displayTypes, displayTypeIdToDisplayType, sentenceIdToIndex, elementIdStartName, division,
                                                                    studentAnswers, attemptNumber, incorrectSentences);
            } else {
                correctPoints = self.setStudentMarkupCorrect(correctMarkupRanges, division, elementIdStartName, sentenceIdToIndex, isAttemptTwo);
                incorrectPoints = self.setStudentMarkupIncorrect(displayTypes, displayTypeIdToDisplayType, sentenceIdToIndex, elementIdStartName, division,
                                                                    studentAnswers, attemptNumber, incorrectSentences);
                if (!sentences) {
                    self.showMissedMarkup(correctMarkupRanges, elementIdStartName, displayTypes, sentenceIdToIndex, division);
                }
            }

            if (sentences) {
                // 1 point per sentence, all or nothing
                self.gradeSentencesMissingMarkup(correctMarkupRanges, elementIdStartName, displayTypes, sentenceIdToIndex, division, incorrectSentences);
                if (isAttemptTwo) {
                    self.showMissedMarkup(correctMarkupRanges, elementIdStartName, displayTypes, sentenceIdToIndex, division);
                }
                return sentences.length - incorrectSentences.length;
            }
            // 1 point per markup display range
            return correctPoints - incorrectPoints;
        };

        self.setStudentMarkupCorrect = function (correctMarkupRanges, division, elementIdStartName, sentenceIdToIndex, isAttemptTwo) {
            var correctPoints = 0;

            _.each(correctMarkupRanges, function (correctMarkup) {
                var startPos = parseInt(correctMarkup.start_position);
                var endPos = parseInt(correctMarkup.end_position);
                var displayOrder = parseInt(correctMarkup.display_order);
                var displayType = correctMarkup.display_type;
                var sentenceId = parseInt(correctMarkup.sentence_ids[0]) || null;
                var sentenceIndex = sentenceId ? sentenceIdToIndex[sentenceId] : 0;

                var currentPos = startPos;
                var studentMatchesCorrectMarkupForRange = true;

                while (currentPos <= endPos) {
                    var currentElt = self.getElt(division, elementIdStartName, sentenceIndex, currentPos);
                    if (currentElt.hasClass('display-'+displayType+'-is-prepopulated')) {
                        ++currentPos;
                        continue;
                    }
                    if (!self.isElementToIgnore(currentElt)) {
                        if (currentElt.hasClass('display-' + displayType)) {
                            if (displayType === 'superscript') {
                                if (currentPos === startPos) {
                                    if (currentElt.find('sup').html() == displayOrder) {
                                        currentElt.addClass('display-' + displayType + '-correct');
                                        if (currentPos === endPos && studentMatchesCorrectMarkupForRange) {
                                            currentElt.addClass('display-' + displayType + '-correct-icon');
                                        }
                                    } else {
                                        studentMatchesCorrectMarkupForRange = false;
                                    }
                                    if (isAttemptTwo) {
                                        // Fix superscript
                                        currentElt.prepend('<sup>' + displayOrder + '</sup>');
                                    }
                                }
                            } else if (displayType === 'circle') {
                                // Fix left/right sides of circle
                                if (isAttemptTwo) {
                                    if (currentPos === startPos) {
                                        currentElt.addClass('left-circle');
                                    }
                                    if (currentPos === endPos) {
                                        currentElt.addClass('right-circle');
                                        // Circle is closed, remove possible excess markup surrounding it
                                        var nextElt = self.getElt(division, elementIdStartName, sentenceIndex, currentPos + 1);
                                        if (nextElt.length) {
                                            nextElt.removeClass('display-circle');
                                        }
                                    }
                                }
                            }
                            currentElt.addClass('display-' + displayType + '-correct');
                            if (currentPos === endPos && studentMatchesCorrectMarkupForRange) {
                                currentElt.addClass('display-' + displayType + '-correct-icon');
                            }
                        } else {
                            studentMatchesCorrectMarkupForRange = false;
                        }
                    } else {
                        // Make this ignored element for grading match the surrounding markup
                        if (division === 'word' && currentElt.hasClass('display-' + displayType)) {
                            self.connectSpaceToSurroundingWords(currentElt, division, elementIdStartName, displayType, sentenceIndex, currentPos);
                        }
                    }
                    currentPos++;
                }

                // If got through entire range matching correct markup, add points
                if (studentMatchesCorrectMarkupForRange) {
                    correctPoints++;
                }
            });
            return correctPoints;

        };

        /** Modifies incorrectSentences
         *  if sentence mode and there was incorrect markup within this sentence
         **/
        self.setStudentMarkupIncorrect = function(displayTypes, displayTypeIdToDisplayType, sentenceIdToIndex,
                                                  elementIdStartName, division, studentAnswers, attemptNumber, incorrectSentences) {
            // Anything that was marked up and not correct is incorrect
            var incorrectPoints = 0;

            _.each(displayTypes, function(displayTypeName) {
                _.each(studentAnswers.attempt[attemptNumber]['displayType'][displayTypeName], function (studentMarkup) {
                    var startPos = parseInt(studentMarkup.start_position);
                    var endPos = parseInt(studentMarkup.end_position);
                    var displayOrder = parseInt(studentMarkup.display_order);
                    var displayType = displayTypeIdToDisplayType[studentMarkup.display_type_id];
                    var sentenceId = parseInt(studentMarkup.sentence_id) || null;
                    var sentenceIndex = sentenceId ? sentenceIdToIndex[sentenceId] : 0;
                    var currentPos = startPos;

                    while (currentPos <= endPos) {
                        var currentElt = self.getElt(division, elementIdStartName, sentenceIndex, currentPos);
                        if (currentElt.hasClass('display-'+displayType+'-is-prepopulated')) {
                            ++currentPos;
                            continue;
                        }
                        if (!currentElt.hasClass('display-' + displayType + '-correct')) {
                            if (!self.isElementToIgnore(currentElt)) {
                                currentElt.addClass('display-' + displayType + '-incorrect');
                                if ((displayType === 'superscript' || displayType === 'circle') && currentPos === endPos) {
                                    currentElt.addClass('display-' + displayType + '-incorrect-icon');
                                }
                                if (displayType === 'highlight' || displayType === 'underline') {
                                    currentElt.addClass('display-' + displayType + '-incorrect-icon');
                                }
                                incorrectPoints++;
                                if (sentenceIdToIndex && incorrectSentences.indexOf(sentenceId) === -1) {
                                    incorrectSentences.push(sentenceId);
                                }
                            } else {
                                // Split by sentence for these types so students can remove specific
                                // sentences. For others that are continuous,
                                // they will have to redo the entire area for now
                                if (division === 'sentence' && (displayType === 'highlight' || displayType === 'underline')) {
                                    currentElt.removeClass('display-' + displayType);
                                    currentElt.removeClass('display-' + displayType + '-incorrect');
                                    currentElt.removeClass('display-' + displayType + '-correct');
                                }
                                // Make this match the surrounding markup
                                if (division === 'word' && currentElt.hasClass('display-' + displayType)) {
                                    self.connectSpaceToSurroundingWords(currentElt,  division, elementIdStartName, displayType, sentenceIndex, currentPos);
                                }
                            }
                        }
                        ++currentPos;
                    }
                })
            });
            return incorrectPoints;
        };

        self.showMissedMarkup = function (correctMarkupRanges, elementIdStartName, displayTypes,
                                          sentenceIdToIndex, division) {
            _.each(correctMarkupRanges, function (correctMarkup) {
                var startPos = parseInt(correctMarkup.start_position);
                var endPos = parseInt(correctMarkup.end_position);
                var displayOrder = parseInt(correctMarkup.display_order);
                var displayType = correctMarkup.display_type;
                var sentenceId = parseInt(correctMarkup.sentence_ids[0]) || null;
                var sentenceIndex = sentenceId ? sentenceIdToIndex[sentenceId] : 0;
                var currentPos = startPos;

                while (currentPos <= endPos) {
                    var currentElt = self.getElt(division, elementIdStartName, sentenceIndex, currentPos);
                    if (currentElt.hasClass('display-' + displayType + '-is-prepopulated')) {
                        ++currentPos;
                        continue;
                    }
                    currentElt.addClass('display-' + displayType + '-revealed');
                    if (!self.isElementToIgnore(currentElt)) {
                        if (!currentElt.hasClass('display-' + displayType)) {
                            currentElt.addClass('display-' + displayType);
                            if (displayType === 'superscript') {
                                if (currentPos === startPos) {
                                    currentElt.prepend('<sup>' + displayOrder + '</sup>');
                                }
                            }
                            if (displayType === 'circle') {
                                if (currentPos === startPos) {
                                    currentElt.addClass('left-circle')
                                }
                                if (currentPos === endPos) {
                                    currentElt.addClass('right-circle');
                                }
                            }
                        }
                    } else {
                        // Make this match the surrounding markup
                        if (division === 'word' && self.getElt(division, elementIdStartName, sentenceIndex, currentPos-1).hasClass('display-' + displayType)) {
                            self.connectSpaceToSurroundingWords(currentElt, division, elementIdStartName, displayType, sentenceIndex, currentPos);
                        }
                    }
                    currentPos++;
                }
            });

            // Remove class '-incorrect' since showing correct answers on attempt two
            var numSentences = sentenceIdToIndex.length || 1;
            for (var sentenceIndex = 0; sentenceIndex < numSentences; ++sentenceIndex) {
                var currentPos = 0;
                var currentElt = self.getElt(division, elementIdStartName, sentenceIndex, currentPos);
                while (currentElt.length != 0) {
                    _.each(displayTypes, function(displayType) {
                        if (currentElt.hasClass('display-' + displayType + '-incorrect')) {
                            currentElt.removeClass('display-' + displayType + '-incorrect');
                            currentElt.removeClass('display-' + displayType + '-incorrect-icon');

                            // If 'extra' answer by student that was not in the answer key, remove markup
                            if (!currentElt.hasClass('display-' + displayType + '-revealed')) {
                                currentElt.removeClass('display-' + displayType);
                            }

                            if (displayType === 'superscript') {
                                currentElt.find('sup').remove();
                            }
                            if (displayType === 'circle') {
                                currentElt.removeClass('left-circle');
                                currentElt.removeClass('right-circle');
                            }
                        }

                    });
                    currentPos++;
                    currentElt = self.getElt(division, elementIdStartName, sentenceIndex, currentPos);
                }
            }
        };

        /** Modifies incorrectSentences
         *  with sentences that student has missing markup for
         **/
        self.gradeSentencesMissingMarkup = function (correctMarkupRanges, elementIdStartName, displayTypes, sentenceIdToIndex, division, incorrectSentences) {
            _.each(correctMarkupRanges, function (correctMarkup) {
                var startPos = parseInt(correctMarkup.start_position);
                var endPos = parseInt(correctMarkup.end_position);
                var displayOrder = parseInt(correctMarkup.display_order);
                var displayType = correctMarkup.display_type;
                var sentenceId = parseInt(correctMarkup.sentence_ids[0]) || null;
                var sentenceIndex = sentenceId ? sentenceIdToIndex[sentenceId] : 0;
                var currentPos = startPos;

                while (currentPos <= endPos) {
                    var currentElt = self.getElt(division, elementIdStartName, sentenceIndex, currentPos);
                    if (currentElt.hasClass('display-' + displayType + '-is-prepopulated')) {
                        ++currentPos;
                        continue;
                    }
                    if (!self.isElementToIgnore(currentElt)) {
                        if (!currentElt.hasClass('display-' + displayType)) {
                            if (sentenceIdToIndex && incorrectSentences.indexOf(sentenceId) === -1) {
                                incorrectSentences.push(sentenceId);
                            }
                        }
                    }
                    currentPos++;
                }
            });
        };

        self.isElementToIgnore = function (elt) {
            return elt.html() == ' ' || elt.html() == '' || elt.html() == '.' || elt.html() == '\n' || elt.html() == '\t';
        };

        self.connectSpaceToSurroundingWords = function (elt, division, elementIdStartName, displayType, sentenceIndex, currentPos) {
            var prevElt = self.getElt(division, elementIdStartName, sentenceIndex, currentPos-1);
            var nextElt = self.getElt(division, elementIdStartName, sentenceIndex, currentPos+1);
            if (prevElt.hasClass('display-' + displayType + '-correct')) {
                elt.addClass('display-' + displayType + '-correct');
            } else if (prevElt.hasClass('display-' + displayType + '-incorrect')) {
                elt.addClass('display-' + displayType + '-incorrect');
            } else {
                elt.addClass('display-' + displayType);

                if (nextElt.length) {
                    if (nextElt.hasClass('display-' + displayType + '-correct')) {
                        elt.addClass('display-' + displayType + '-correct');
                    } else if (nextElt.hasClass('display-' + displayType + '-incorrect')) {
                        elt.addClass('display-' + displayType + '-incorrect');
                    }
                }
            }
        };

        self.splitTextByWord = function (str, theSentenceIndex) {
            var lines = str.split(/^\d\.\s/);
            var isSentence = (theSentenceIndex != undefined);

            var index = 0;
            var sentenceIndex = (theSentenceIndex == undefined ? 0 : theSentenceIndex);
            var wordsList = [];
            var space = " ";

            var paragraphs = self.splitIntoParagraphsForWords(lines);

            var wordCount = 0;
            for (var paragraph = 0; paragraph < paragraphs.length; ++paragraph) {
                var paragraphLine = paragraphs[paragraph];
                var hasBreak = self.hasBreakWithinParagraph(paragraph, paragraphLine);
                var StrippedString = self.paragraphLineHTMLCleanUp(paragraphLine);
                var words = StrippedString.split(" ");
                for (var j = 0; j < words.length; j++) {
                    theSentenceIndex = "";
                    var theWord = words[j];
                    if (!hasBreak) {
                        theWord = theWord.replace(/<\/br><\/br>/g, '<\/br>');
                    }
                    wordsList[index] = theSentenceIndex +
                        "<span id='highlight-word-%sentence%-%index%' class='dummy-highlight'>".replace("%sentence%",
                            sentenceIndex)
                            .replace("%index%", wordCount) + theWord + "</span>";
                    index++;
                    wordCount++;

                    if (j == words.length-1 && (paragraph != paragraphs.length-1) && theWord != '</br></br>') {
                        if (!hasBreak && theWord == '</br>') {
                            wordsList[index] = "<span></br></span>";
                        } else {
                            wordsList[index] = "<span></br></br></span>";
                        }
                    } else if (j != words.length-1) {
                        wordsList[index] = theSentenceIndex +
                            "<span id='highlight-word-%sentence%-%index%' class='dummy-highlight'>".replace("%sentence%",
                                sentenceIndex)
                                .replace("%index%", wordCount) + space + "</span>";
                    }

                    index++;
                    wordCount++;
                }
            }

            return wordsList;
        };

        self.splitBySentence = function (str) {
            str = self.sentenceHTMLCleanUp(str);
            var paragraphs = self.splitIntoParagraphsForSentences(str);
            var items = [];
            var arrayOfPunctuations = [];
            var lines = [];
            var count = 0;

            if (paragraphs) {
                for (var p = 0; p < paragraphs.length && paragraphs[p].length > 1; ++p) {
                    var hasBreak = self.hasBreakWithinParagraph(p, paragraphs[p]);

                    arrayOfPunctuations = paragraphs[p].match(/[\\.!\?]/g); //TODO replace with constant
                    if (!hasBreak) {
                        lines = paragraphs[p].split(/[\\.!\?]\s/);
                    } else {
                        lines = paragraphs[p].split(/[\\.!\?]/);
                    }

                    for (var i = 0; i < lines.length; ++i) {
                        lines[i] = lines[i].replace(/^<\/br\s*\/?>\s*/i, '');
                        var breakIndex = lines[i].search("<\/br>");
                        if (breakIndex >= 0) {
                            if (arrayOfPunctuations && arrayOfPunctuations[i]) {
                                if (!hasBreak || lines[i + 1] == '') {
                                    if (!hasBreak) {
                                        lines[i] = self.generateLineMarkUpWithBreak(count, '', lines[i]);
                                    } else {
                                        lines[i] = self.generateLineMarkUpWithOutBreak(count, arrayOfPunctuations[i], lines[i]);
                                    }
                                } else {
                                    lines[i] = self.generateLineMarkUpWithBreak(count, arrayOfPunctuations[i], lines[i]);

                                }
                            } else {
                                lines[i] = self.generateLineMarkUpWithBreak(count, '', lines[i]);
                            }
                        } else {
                            if (arrayOfPunctuations && arrayOfPunctuations[i]) {
                                var lastCharacter = lines[i].substring(lines[i].length-1);
                                if (lastCharacter.match(/[\\.!\?\"]/g) && (i == lines.length-1)) {
                                    lines[i] = self.generateLineMarkUpWithBreak(count, '', lines[i]);
                                } else {
                                    lines[i] = self.generateLineMarkUpWithOutBreak(count, arrayOfPunctuations[i], lines[i]);
                                }
                            } else {
                                lines[i] = self.generateLineMarkUpWithBreak(count, '', lines[i]);
                            }
                        }
                        items.push(lines[i]);
                        count += 2;
                    }
                    if (p != paragraphs.length-1)
                        items.push("</br>");
                }
            } else {
                arrayOfPunctuations = str.match(/[\\.!\?]/g);
                lines = str.split(/[\\.!\?]\s/g);
                for (var i = 0; i < lines.length; ++i) {
                    if (arrayOfPunctuations) {
                        var lastCharacter = lines[i].substring(lines[i].length-1);
                        if (lastCharacter.match(/[\\.!\?]/g) && (i == lines.length-1)) {
                            lines[i] = lines[i].replace(/\.$/, '');
                            lines[i] = lines[i].replace(/\!$/, '');
                            lines[i] = lines[i].replace(/\?$/, '');
                        }
                        lines[i] = self.generateLineMarkUpWithOutBreak(count, arrayOfPunctuations[i], lines[i]);
                        items.push(lines[i]);
                        count += 2;
                    }
                }

                if (items.length <= 0) {
                    str = self.generateLineMarkUpWithOutBreak(count, '', str);
                    items.push(str);
                }
            }

            return items;
        };

        self.paragraphLineHTMLCleanUp = function (lineString) {
            var editedString = lineString.replace(/<div>(&nbsp;)*?<\/div>/g, '</br>');
            editedString = editedString.replace(/<div>/g, '');
            editedString = editedString.replace(/<\/div>/g, ' </br></br>');
            editedString = editedString.replace(/<br>/g, '');
            return editedString;
        };

        self.sentenceHTMLCleanUp = function (sentenceString) {
            var editedString = sentenceString.replace(/\&nbsp;/g, '');
            editedString = editedString.replace(/<br>/g, '');
            editedString = editedString.replace(/<\/div>/g, '</br>');
            editedString = editedString.replace(/\<div>/g, '');
            return editedString;
        };

        self.splitIntoParagraphsForSentences = function (lineString) {
            if (lineString.match(/<\/br><\/br>/)) {
                return lineString.split(/<\/br><\/br>/);
            }

            return lineString.split(/<\/br>/);
        };

        self.splitIntoParagraphsForWords = function (lines) {
            if (lines[0] == "" || lines[0] == "<div>") {
                return lines.concat();
            } else if (lines.length == 1) {
                return lines[0].split(/<div><br><\/div>/);
            }
        };

        self.generateLineMarkUpWithBreak = function (index, punctuation, line) {
            var spaceIndex = index + 1;
            return "<span id='highlight-sentence-%count' class='dummy-highlight'>".replace("%count", index) + line +
                punctuation + "</span>" + "<span id='highlight-sentence-%count' class='dummy-highlight'>".replace("%count", spaceIndex) +
                " " + "</span></br>";
        };

        self.generateLineMarkUpWithOutBreak = function (index, punctuation, line) {
            var spaceIndex = index + 1;
            if (punctuation == undefined) return "";
            return "<span id='highlight-sentence-%count' class='dummy-highlight'>".replace("%count", index) + line +
                punctuation + "</span>" + "<span id='highlight-sentence-%count' class='dummy-highlight'>".replace("%count", spaceIndex) +
                " " + "</span>";
        };

        self.hasBreakWithinParagraph = function (paragraphIndex, paragraph) {
            var paragraphLength = paragraph.length;
            var breakIndex = paragraph.search("<\/br>");
            var hasBreak = false;
            if (breakIndex == 0) {
                var tempParagraph = paragraph.replace(/<\/br>/i, '');
                breakIndex = tempParagraph.search("<\/br>");
                paragraphLength = tempParagraph.length;
                if (paragraphIndex > 0 && breakIndex == (paragraphLength - 5)) {
                    hasBreak = true;
                }
            } else if (breakIndex > 0) {
                hasBreak = true;
            }
            return hasBreak;
        };
    }
})();
