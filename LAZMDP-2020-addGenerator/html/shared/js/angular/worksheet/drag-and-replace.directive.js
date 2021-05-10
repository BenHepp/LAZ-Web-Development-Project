(function () {
    'use strict';

    angular.module('shared.worksheet')
        .directive('dragAndReplace', ['$sce', '$document', '$window',
            function ($sce, $document, $window) {
                var originalPosition = null;
                var dimensions = null;
                var isDragging = false;
                var elementBeingDragged = null;
                var topPadding = null;
                var hasPlaceholder = false;
                var isMovingDownwards = null;
                var elementOffset = {};
                $window.blockMenuHeaderScroll = false;

                function controller($scope, $element) {
                    var ctrl = this;

                    ctrl.$onInit = function () {
                        ctrl.dragSortableListCtrl = $element.controller('dragSortableList');
                    };

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
                            if (!event.target.parentElement.hasAttribute('isDraggable') || !event.target.parentElement.getAttribute('isDraggable')) {
                                return false;
                            }
                            positionDraggableElement(event, 'touch');
                        }
                    }

                    function onDrop(event) {
                        isDragging = false;

                        if (angular.element(event.target).hasClass('media') ||
                            angular.element(event.target).hasClass('js-clickable')) {
                            return true;
                        }
                        if (angular.isUndefined(event.clientX) || angular.isUndefined(event.clientY)) {
                            event.clientX = event.originalEvent.pageX;
                            event.clientY = event.originalEvent.pageY;
                            if (angular.isUndefined(event.clientX) || angular.isUndefined(event.clientY)) {
                                return false;
                            }
                        }

                        if (elementBeingDragged) {
                            elementBeingDragged.removeAttr('style');
                        } else {
                            return false;
                        }

                        hasPlaceholder = false;
                        angular.element('.js-draggable').removeClass('is-static');
                        elementBeingDragged.removeClass('is-dragging');
                        $scope.$apply(function () {
                            ctrl.dragSortableListCtrl.handleReplace();
                        });

                        elementBeingDragged = null;
                        $window.blockMenuHeaderScroll = false;
                        return false;
                    }

                    function positionDraggableElement(event, type) {
                        if ($window.blockMenuHeaderScroll) {
                            event.preventDefault();
                        }

                        var draggableElement = null;
                        var clientX = event.originalEvent.clientX;
                        var clientY = event.originalEvent.clientY;
                        var pageY = event.originalEvent.pageY;

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

                        var adjustForChartLeft = 0;
                        var adjustForChartTop = 0;
                        if (angular.element('.js-timeline').length !== 0) {
                            adjustForChartLeft = angular.element('.js-timeline').position().left;
                            adjustForChartTop = angular.element('.js-timeline').position().top;
                        }
                        if (angular.element('.js-answers-container-grid').length !== 0) {
                            adjustForChartLeft = angular.element('.js-answers-container-grid').position().left;
                            adjustForChartTop = angular.element('.js-answers-container-grid').position().top;
                        }

                        draggableElement = angular.element(draggableElement);

                        var leftStyle = clientX - elementOffset.left - adjustForChartLeft + $document.scrollLeft();
                        var topStyle = clientY - elementOffset.top - adjustForChartTop + $document.scrollTop();

                        // Make element follow cursor/finger in the center; follow when scrolling window
                        angular.element(draggableElement).css({
                            'position': 'absolute', 'zIndex': '9999',
                            'width': dimensions.width + 1, 'height': dimensions.height //+1 added because .width rounds down
                        });

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

                        angular.element(draggableElement).css({'left': leftStyle + 'px', 'top': topStyle + 'px'});

                        if (!hasPlaceholder) {
                            insertPlaceholder(draggableElement);
                            hasPlaceholder = true;
                        }
                        angular.element('.js-draggable').not(draggableElement).addClass('is-static');
                        positionPlaceholder(draggableElement, clientX, clientY);
                    }

                    function canScrollUp() {
                        return $document.scrollTop() !== 0;
                    }

                    function canScrollDown() {
                        return $window.innerHeight + $window.scrollY !== document.body.offsetHeight;
                    }

                    function calculateOffset(clientX, clientY, element) {
                        // Ensure where cursor was on element
                        elementOffset.left = clientX - element.offset().left + $document.scrollLeft();
                        elementOffset.top = clientY - element.offset().top + $document.scrollTop();
                    }

                    function positionPlaceholder(draggableElement, clientX, clientY) {
                        var draggableEltDisplay = draggableElement.css('display');
                        draggableElement.css({'display': 'none'});
                        var eltToShift = angular.element(document.elementFromPoint(clientX, clientY)).closest('.js-draggable');
                        draggableElement.css({'display': draggableEltDisplay});

                        if (!eltToShift.hasClass('js-draggable') || eltToShift.hasClass('js-non-draggable')) {
                            return;
                        }

                        if (draggableElement.attr('sentence_index') && eltToShift.attr('sentence_index')) {
                            if (draggableElement.attr('sentence_index') !== eltToShift.attr('sentence_index')) {
                                return;
                            }
                        }

                        $scope.$apply(function () {
                            ctrl.dragSortableListCtrl.positionPlaceholder(draggableElement, eltToShift)
                        });
                    }

                    function insertPlaceholder(draggableElement) {
                        if (!angular.element(draggableElement).hasClass('draggable')) {
                            return;
                        }
                        $scope.$apply(function () {
                            ctrl.dragSortableListCtrl.insertPlaceholder(draggableElement);
                        });
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

                    ctrl.$postLink = function () {
                        angular.element(window).on('pointerup MSPointerUp mouseup touchend', onDrop);
                        $document.on('mousemove pointermove MSPointerMove', onMousemove);
                        $document.on('touchmove', onTouchmove);

                        $element.on('mousedown touchstart', function (event) {
                            if (isMultiFingerTouch(event)) {
                                return false;
                            }
                            if (angular.element(event.target).hasClass('media') ||
                                angular.element(event.target).hasClass('js-clickable')) {
                                return true;
                            }
                            var enabled = $scope.enabled !== undefined ? $scope.enabled : true;
                            if (!isDragging && !$element.attr('isDraggable') || $element.attr('isDraggable') == 'false' || !enabled) {
                                elementBeingDragged = null;
                                return false;
                            } else {
                                elementBeingDragged = $element;
                                $window.blockMenuHeaderScroll = true;
                            }

                            if (event.originalEvent.type === 'touchstart') {
                                $element.addClass('ui-draggable-dragging-touch');
                            } else {
                                $element.addClass('ui-draggable-dragging');
                            }

                            $element.addClass('is-dragging');

                            originalPosition = $element.position();
                            dimensions = {height: $element.outerHeight(), width: $element.outerWidth()};
                            isDragging = true;
                            isMovingDownwards = null;
                            topPadding = angular.element('.js-worksheetHeader').position().top;

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
                    };
                }

                return {
                    restrict: 'A',
                    require: ['^dragSortableList'],
                    controller: ['$scope', '$element', '$document', controller],
                    scope: {
                        enabled: '<'
                    }
                };
            }]);
})();
