(function () {
    "use strict";

    angular.module('shared.worksheet')

        .component('dragSortableList', {
            templateUrl: '/shared/js/angular/worksheet/drag-sortable-list.html',
            controller: 'DragSortableListController',
            transclude: true,
            bindings: {
                dragItems: '<',
                template: '@',
                sentences: '<'
            }
        })
        .controller('DragSortableListController', [ '$scope',
            function DragSortableListController($scope) {
                var ctrl = this;
                ctrl.placeholderCtrl = null;

                ctrl.setPlaceholderCtrl = function (placeholderCtrl) {
                    ctrl.placeholderCtrl = placeholderCtrl;
                };

                ctrl.insertPlaceholder = function (draggableElement) {
                    var placeholder = angular.element(angular.element('drag-replace-placeholder')[0]);
                    ctrl.template === 'fillInTheBlank'
                        ? placeholder.css({
                            'display': 'inline-block',
                            'width': draggableElement.outerWidth() + 'px',
                            'height': draggableElement.outerHeight() + 'px'
                        })
                        : placeholder.css({'display': 'block'});
                    placeholder.addClass('js-placeholder');
                    ctrl.placeholderCtrl.setDragTarget(draggableElement.attr('data-dragtarget'));
                    var elementEndNgRepeatComment = angular.element(draggableElement.context.nextSibling);
                    placeholder.insertAfter(draggableElement);
                    elementEndNgRepeatComment.insertAfter(draggableElement);
                };

                ctrl.positionPlaceholder = function (draggableElement, eltToShift) {
                    var draggableElementDragTarget = parseInt(draggableElement.attr('data-dragtarget'));
                    var eltToShiftDragTarget = parseInt(eltToShift.attr('data-dragtarget'));

                    draggableElement.attr('data-dragtarget', eltToShiftDragTarget);
                    eltToShift.attr('data-dragtarget', draggableElementDragTarget);

                    ctrl.placeholderCtrl.setDragTarget(eltToShiftDragTarget);

                    // Timeline is offset by a multiple of 2 for the draggable items since the dates are odd numbered and items are even numbered
                    // Fill in the blanks are offset to account for the text in between drag items
                    var draggableElementIndex = ctrl.template === 'timeline'
                        ? draggableElementDragTarget / 2 - 1
                        : ctrl.template === 'fillInTheBlank'
                            ? (draggableElementDragTarget * 2 - 1) + (parseInt(draggableElement.attr('sentence_index')))
                            : draggableElementDragTarget - 1;

                    var draggableElementEndNgRepeatComment = angular.element(draggableElement[0].nextSibling);
                    var eltToShiftEndNgRepeatComment = angular.element(eltToShift[0].nextSibling);

                    // Moving downwards
                    if (draggableElementDragTarget < eltToShiftDragTarget) {
                        draggableElement.insertBefore(eltToShift);
                        angular.element('.js-placeholder:visible').insertBefore(eltToShift);
                        eltToShift.insertBefore(angular.element(angular.element('.js-draggable')[draggableElementIndex]));
                    }
                    // Moving upwards
                    else {
                        draggableElement.insertAfter(eltToShift);
                        angular.element('.js-placeholder:visible').insertAfter(eltToShift);
                        eltToShift.insertAfter(angular.element(angular.element('.js-draggable')[draggableElementIndex].nextSibling));

                    }
                    draggableElementEndNgRepeatComment.insertAfter(draggableElement);
                    eltToShiftEndNgRepeatComment.insertAfter(eltToShift);
                };

                ctrl.handleReplace = function () {
                    ctrl.ensurePlaceholdersHidden();

                    //Update dragItems to match UI
                    var answerIdsInOrder = [];
                    _.each(angular.element('.js-draggable'), function (item) {
                        if (item.getAttribute('data-answerid') !== "") {
                            answerIdsInOrder.push(item.getAttribute('data-answerid'));
                        }
                    });

                    // Update dragItems order to reflect DOM
                    ctrl.dragItems = ctrl.dragItems.sort(function (item1, item2) {
                        return answerIdsInOrder.indexOf(item1.answer_id) - answerIdsInOrder.indexOf(item2.answer_id);
                    });

                    // Update fragment list of blanks to reflect new order in DOM
                    if (ctrl.sentences && ctrl.template === 'fillInTheBlank') {
                        var dragTarget = 1;
                        _.each(ctrl.sentences, function(sentence) {

                            // Sort based on answerIdsInOrder - will place text (null answer ids) before blanks
                            var fragmentsSorted = angular.copy(sentence.fragments).sort(function(fragmentObj1, fragmentObj2) {
                                return answerIdsInOrder.indexOf(fragmentObj1.answerId) - answerIdsInOrder.indexOf(fragmentObj2.answerId);
                            });

                            var sortedFragmentsTokenIndex = parseInt(fragmentsSorted.length / 2) + 1;

                            // Reflect sorted fragments order in sentence.fragments
                            // E.g.: sentence.fragments = [null, 456, null, 123, null] and fragmentsSorted = [null, null, null, 123, 456]
                            // Will result in sentence.fragments = [null, 123, null, 456, null]
                            // Reassign dragTargets for the blanks (every other fragment is a drag target)
                            _.each(sentence.fragments, function(fragmentObj, index) {
                                if (fragmentObj.answerId) {
                                    sentence.fragments[index] = fragmentsSorted[sortedFragmentsTokenIndex];
                                    sentence.fragments[index].dragTarget = dragTarget;
                                    ++dragTarget;
                                    ++sortedFragmentsTokenIndex;
                                }
                            });
                        });
                    }
                };

                ctrl.ensurePlaceholdersHidden = function () {
                    // TODO: Move logic into placeholder component
                    var placeholder = angular.element('drag-replace-placeholder.js-placeholder');
                    placeholder.css({'display': 'none'});
                };
            }
        ]);
})();
