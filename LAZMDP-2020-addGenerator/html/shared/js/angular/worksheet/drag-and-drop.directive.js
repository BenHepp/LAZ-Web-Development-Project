(function () {
    'use strict';

    angular.module('shared.worksheet')
    // TODO rename to wsDragAndDrop     // TODO refactor common elements between both directives into service
        .directive('dragAndDrop', ['$sce', '$document', '$window', '$timeout',
            function ($sce, $document, $window, $timeout) {
                var originalPosition = null;
                var dimensions = null;
                var isDragging = false;
                var elementBeingDragged = null;
                var draggableElement = null;
                var isAutoregenerate = false;
                var elementClone = null;
                var dropZoneHovered = null;
                var prevDropZone = null;
                var dropZoneIncorrectClass = false;
                var topStyle = 0;
                var prevScrollY = 0;
                var originalSticky = false;
                var elementOffset = {};

                // Allow drag on tablets to progress through instead of scrolling
                $window.blockMenuHeaderScroll = false;

                function controller($scope, $element) {
                    var ctrl = this;

                    function onMousedown(event) {
                        originalSticky = angular.element('.js-answerBank').hasClass('is-sticky');
                    }

                    function onTouchstart(event) {
                        originalSticky = angular.element('.js-answerBank').hasClass('is-sticky');
                    }

                    function onMousemove(event) {
                        var thisDraggableElt = null;
                        if (isDragging) {
                            thisDraggableElt = angular.element(event.target.parentElement);
                        }
                        if (originalPosition && isDragging) {
                            if (isLeftMouseButtonDown(event) && thisDraggableElt.attr('data-answerid') != elementBeingDragged.attr('data-answerid')) {
                                event.target = elementBeingDragged;
                                positionDraggableElement(event, 'mouse');
                            }
                        }
                    }

                    function onTouchmove(event) {
                        if (isMultiFingerTouch(event)) {
                            return false;
                        }
                        if (originalPosition && isDragging) {
                            if (!event.target.parentElement.hasAttribute('isDraggable')
                                || !event.target.parentElement.getAttribute('isDraggable')) {
                                return false;
                            }
                            positionDraggableElement(event, 'touch');
                        }
                    }

                    function onDrop(event) {
                        if ((angular.element(event.target).hasClass('media') ||
                            angular.element(event.target).hasClass('js-clickable')) && !isDragging) {
                            return true;
                        }
                        isDragging = false;

                        if (angular.isUndefined(event.clientX) || angular.isUndefined(event.clientY)) {
                            event.clientX = event.originalEvent.pageX;
                            event.clientY = event.originalEvent.pageY;
                            if (angular.isUndefined(event.clientX) || angular.isUndefined(event.clientY)) {
                                return false;
                            }
                        }

                        // Determine if valid drop
                        var dropZone = document.elementFromPoint(event.clientX, event.clientY);
                        dropZone = angular.element(dropZone).closest('.drop-target');
                        angular.element(elementBeingDragged).removeAttr('style');
                        angular.element(elementBeingDragged).removeClass('ui-draggable-dragging-touch ui-draggable-dragging');

                        // Not a valid dropzone
                        if (!dropZone.hasClass('drop-target') || dropZone.hasClass('correct') || dropZone.hasClass('dropped')
                            || dropZone.hasClass('is-prepopulated') || !elementBeingDragged
                            || answerAlreadyExistsInContainer(dropZone, elementBeingDragged.attr('data-answerid'))) {
                            if (angular.element(elementBeingDragged).hasClass('ui-draggable-dragging-touch ui-draggable-dragging')) {
                                var i = event.currentTarget.getAttribute('index');
                                $scope.answerbank[i].isHidden = false;
                            }
                            if (isAutoregenerate) {
                                var clone = angular.element('.js-clone');
                                angular.element(clone).remove();
                                elementClone = null;
                            }
                            angular.element(dropZoneHovered).removeClass('is-selected');
                            elementBeingDragged = null;
                            return false;
                        }

                        dropZone.removeClass('is-selected');
                        var droppedIdx = parseInt(dropZone.attr('data-dragtarget') - 1);
                        var indexInTarget = parseInt(dropZone.attr('data-index_in_target')) || 0;

                        if (containerAtCapacity($scope.dropped, droppedIdx, indexInTarget)) {
                            return false;
                        }

                        // Determine which answerBank item to move below
                        // Need to use deep copy in the case of autoregenerate so we can change a specific item only
                        // IndexInTarget applies to templates with multiple answers in a drag target
                        _.find($scope.answerbank, function (item) {
                            if (item.answer_id == elementBeingDragged.attr('data-answerid')) {

                                $scope.dropped[droppedIdx].answers[indexInTarget]['item'] = angular.copy(item);
                                $scope.dropped[droppedIdx].answers[indexInTarget]['item'].is_correct = null;
                                $scope.dropped[droppedIdx].answers[indexInTarget]['item'].prepopulate = false;

                                if (dropZoneIncorrectClass) {
                                    $scope.dropped[droppedIdx].answers[indexInTarget]['item'].is_correct = false;
                                }
                                if (!isAutoregenerate) {
                                    item.isHidden = true;
                                }
                                elementBeingDragged = null;
                                return true;
                            }
                        });
                        $window.blockMenuHeaderScroll = false;
                        $scope.$apply();
                    }

                    function isMultiFingerTouch(event) {
                        if (event.originalEvent.touches) {
                            return event.originalEvent.touches.length > 1;
                        }
                    }

                    function isLeftMouseButtonDown(event) {
                        // event.buttons or event.which depending on browser
                        // 1 represents left mouse down
                        return event.buttons ? event.buttons === 1 : event.which === 1;
                    }

                    function answerAlreadyExistsInContainer(dropZone, answerId) {
                        var matchedAnswers = angular.element(dropZone).find('span').filter(function () {
                            return angular.element(this).attr('data-answerid') === answerId
                        });
                        return matchedAnswers.length > 0;
                    }

                    function containerAtCapacity(droppedItems, droppedIdx, indexInTarget) {
                        return droppedItems[droppedIdx].answers[indexInTarget] === undefined;
                    }

                    function positionDraggableElement(event, type) {
                        if ($window.blockMenuHeaderScroll) {
                            event.preventDefault();
                        }

                        draggableElement = null;
                        var clientX = event.originalEvent.clientX;
                        var clientY = event.originalEvent.clientY;
                        var pageY = event.originalEvent.pageY;

                        // Finicky variable access depending on mouse vs touch device
                        if (type == 'mouse') {
                            draggableElement = event.target;
                        } else {
                            draggableElement = event.target.hasAttribute('data-answerid') ? event.target : event.target.parentElement;
                            draggableElement = draggableElement.hasAttribute('data-answerid') ? draggableElement : event.target.parentElement.parentElement;
                            if (event.originalEvent.touches) {
                                clientX = event.originalEvent.touches[0].clientX;
                                clientY = event.originalEvent.touches[0].clientY;
                                pageY = event.originalEvent.touches[0].pageY;
                            }
                        }
                        draggableElement = angular.element(draggableElement);

                        var leftStyle = clientX - elementOffset.left - originalPosition.left + $document.scrollLeft();
                        topStyle = clientY - elementOffset.top - originalPosition.top + $document.scrollTop();

                        if (!elementClone && isAutoregenerate) {
                            elementClone = angular.copy(draggableElement);
                            angular.element(elementClone).addClass('js-clone');
                            angular.element(elementClone).removeClass('ui-draggable-dragging-touch ui-draggable-dragging');
                            angular.element(elementClone).css({
                                'position': 'absolute',
                                'left': originalPosition.left + 'px',
                                'top': originalPosition.top + 'px'
                            });
                            angular.element('.js-bank-container').append(elementClone);
                        }

                        // Make element follow cursor/finger in the center; follow when scrolling window
                        angular.element(draggableElement).css({'position': 'relative', 'zIndex': '9999'});

                        // Add hover style if over valid dropzone, temporarily set pointer events to none
                        // so elementFromPoint can grab element below draggableElement
                        angular.element(draggableElement).css({'pointer-events': 'none'});

                        var dropZone = document.elementFromPoint(clientX, clientY);
                        dropZone = angular.element(dropZone).closest('.drop-target');

                        if (dropZone.hasClass('drop-target')) {
                            if (angular.element(dropZone).hasClass('incorrect')) {
                                dropZoneIncorrectClass = true;
                            }
                            var droppedIdx = parseInt(dropZone.attr('data-dragtarget') - 1);
                            var indexInTarget = parseInt(dropZone.attr('data-index_in_target')) || 0;
                            if (!answerAlreadyExistsInContainer(dropZone, draggableElement.attr('data-answerid'))
                                && !containerAtCapacity($scope.dropped, droppedIdx, indexInTarget)
                                && !dropZone.hasClass('is-prepopulated')) {
                                    dropZone.removeClass('incorrect');
                                    angular.element('.drop-target').removeClass('is-selected');
                                    dropZone.addClass('is-selected');

                                    // If moving too quickly, need to catch up prevDropZone with incorrect class if appro
                                    if (prevDropZone
                                        && !prevDropZone.hasClass('is-selected') && !hasClassCorrectOrDroppedOrPrepopulated(prevDropZone)
                                        && dropZoneIncorrectClass) {
                                        prevDropZone.addClass('incorrect');
                                    }
                                    prevDropZone = dropZone;
                                    dropZoneHovered = dropZone;
                            }
                        } else {
                            if (dropZoneIncorrectClass && dropZone
                                && !(hasClassCorrectOrDroppedOrPrepopulated(dropZoneHovered))) {
                                angular.element(dropZoneHovered).addClass('incorrect');
                            }
                            angular.element(dropZoneHovered).removeClass('is-selected');
                            dropZoneHovered = null;
                        }
                        angular.element(draggableElement).css({'pointer-events': 'default'});

                        // Auto scroll if outside of window
                        var threshold = 1;

                        // Scroll up
                        if (canScrollUp() && clientY - dimensions.height < threshold) {
                            $window.scrollBy(0, -1, 'smooth');
                        }
                        // Scroll down
                        else if (canScrollDown() && $window.innerHeight - (clientY + dimensions.height) < threshold) {
                            $window.scrollBy(0, 1, 'smooth');
                        }

                        checkStickyAnswerBank(false, null);
                        angular.element(draggableElement).css({'left': leftStyle + 'px'});
                    }

                    function hasClassCorrectOrDroppedOrPrepopulated(elt) {
                        return angular.element(elt).hasClass('correct')
                            || angular.element(elt).hasClass('dropped')
                            || angular.element(elt).hasClass('is-prepopulated');
                    }

                    function onScroll() {
                        //checkStickyAnswerBank(true, prevScrollY < $window.scrollY);
                        $timeout(onScrollStop, 500);

                        if (prevScrollY !== $window.scrollY) {
                            prevScrollY = $window.scrollY;
                        }
                    }

                    function onScrollStop() {
                        //checkStickyAnswerBank(false, null);
                    }

                    function canScrollUp () {
                        return $document.scrollTop() !== 0;
                    }

                    function canScrollDown () {
                        return $window.innerHeight + $window.scrollY !== document.body.offsetHeight;
                    }

                    function calculateOffset(clientX, clientY, element) {
                        // Ensure where cursor was on element
                        elementOffset.left = clientX - element.offset().left + $document.scrollLeft();
                        elementOffset.top = clientY - element.offset().top + $document.scrollTop();
                    }

                    function checkStickyAnswerBank(isScrolling, isScrollingDown) {
                        if (!isDragging) {
                            return;
                        }

                        var scrollTop = $document.scrollTop();
                        var paddingTop = parseInt(angular.element('.js-chart').css('padding-top'));

                        if (angular.element('.js-answerBank').hasClass('is-sticky')) {
                            if (!isScrolling) {
                                if (!originalSticky) {
                                    var headerHeight = angular.element('.js-worksheetHeader').outerHeight();
                                    headerHeight += angular.element('.header_container').height();
                                    topStyle += headerHeight;
                                }
                                topStyle -= parseInt(angular.element('.js-answerBank').outerHeight() + (scrollTop - paddingTop));
                            }
                        } else {
                            if (!isScrolling) {
                                if (originalSticky) {
                                    var headerHeight = angular.element('.js-worksheetHeader').outerHeight();
                                    headerHeight += angular.element('.header_container').height();
                                    topStyle -= headerHeight;
                                }
                            }
                        }
                        angular.element(draggableElement).css({'top': topStyle + 'px'});
                    }

                    ctrl.$postLink = function () {
                        angular.element(window).on('pointerup MSPointerUp mouseup touchend', onDrop);
                        $document.on('mousemove pointermove MSPointerMove', onMousemove);
                        $document.on('mousedown', onMousedown);
                        $document.on('touchstart', onTouchstart);
                        $document.on('touchmove', onTouchmove);
                        $document.on('scroll', onScroll);

                        $element.on('mousedown touchstart', function (event) {
                            if ($scope.autoregenerate) {
                                isAutoregenerate = true;
                            }
                            if (isMultiFingerTouch(event)) {
                                return false;
                            }
                            if (angular.element(event.target).hasClass('media') ||
                                angular.element(event.target).hasClass('js-clickable')) {
                                return true;
                            }
                            if (!isDragging && !$element.attr('isDraggable') || $element.attr('isDraggable') == 'false') {
                                elementBeingDragged = null;
                                return false;
                            } else {
                                elementBeingDragged = $element;
                                $window.blockMenuHeaderScroll = true;
                            }

                            if (event.originalEvent.pointerType === 'touch') {
                                $element.addClass('ui-draggable-dragging-touch');
                            } else {
                                $element.addClass('ui-draggable-dragging');
                            }

                            originalPosition = $element.position();
                            dimensions = {height: $element.height(), width: $element.width()};
                            isDragging = true;
                            dropZoneIncorrectClass = false;

                            var clientX = event.originalEvent.clientX;
                            var clientY = event.originalEvent.clientY;

                            if (event.originalEvent.touches) {
                                clientX = event.originalEvent.touches[0].clientX;
                                clientY = event.originalEvent.touches[0].clientY;
                            }
                            calculateOffset(clientX, clientY, $element);
                        });
                    };

                    ctrl.$onDestroy = function () {
                        angular.element(window).off('pointerup MSPointerUp mouseup touchend', onDrop);
                        $document.off('mousemove pointermove MSPointerMove', onMousemove);
                        $document.off('touchmove', onTouchmove);
                        $document.off('scroll', onScroll);
                    };
                }

                return {
                    restrict: 'A',
                    controller: ['$scope', '$element', controller],
                    scope: {
                        answerbank: '=',
                        dropped: '=',
                        item: '=',
                        autoregenerate: '='
                    }
                };
            }]);
})();
