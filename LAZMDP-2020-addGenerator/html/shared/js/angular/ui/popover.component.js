"use strict";

angular.module('shared')

    .component('popover', {
        bindings: {
            initOpen: '<?',
            onOpenChanged: '&',
            onInited: '&'
        },
        controller: 'Popover',
        templateUrl: '/shared/js/angular/ui/popover.html',
        transclude: true
    })
        .controller('Popover',
            ['$document', '$scope', '$element', '$timeout', '$window', '$attrs', function PopoverCtrl($document, $scope, $element, $timeout, $window, $attrs) {
                var ctrl = this;
                ctrl.is_open = false;
                ctrl.addClickOffHandlers = true;
                ctrl.position = {
                    my: 'left top',
                    at: 'left bottom',
                    collision: "fit none",
                    within: $window
                };
                ctrl.isOpen = function () {
                    return ctrl.is_open;
                };
                ctrl.open = function (open) {
                    var was_open = ctrl.is_open;
                    ctrl.is_open = open === undefined
                        ? true
                        : !!open;
                    if (ctrl.is_open !== was_open) {
                        if (ctrl.is_open) {
                            if (ctrl.lightwindow) {
                                var body = angular.element("body");
                                ctrl.originalBodyOverflow = body.css("overflow");
                                body.css("overflow", "hidden");
                            }
                            if(ctrl.addClickOffHandlers){
                                ctrl.addClickOffHandler();
                            }
                            $timeout(ctrl.autopositionContent, 25);
                        } else {
                            if (ctrl.lightwindow) {
                                angular.element("body").css("overflow", ctrl.originalBodyOverflow || 'visible');
                            }
                            ctrl.removeClickOffHandler();
                            $element.find('.popover').removeClass('active');
                            cancelHoverTimer();
                        }
                        ctrl.onOpenChanged({open: ctrl.is_open});
                    }
                };
                ctrl.close = function () {
                    ctrl.open(false);
                };
                ctrl.toggleOpen = function () {
                    ctrl.open(!ctrl.is_open);
                };
                ctrl.addTarget = function (targetCtrl) {
                    if ('targetCtrl' in ctrl) {
                        throw new Error('Popovers can only have one popover-target child element');
                    }
                    ctrl.targetCtrl = targetCtrl;
                };

                ctrl.addTargetElement = function(targetElement) {
                    ctrl.targetElement = targetElement;
                };

                ctrl.setAddClickOffHandlers = function(value) {
                    ctrl.addClickOffHandlers = value;
                };

                ctrl.getTargetCtrl = function () {
                    return ctrl.targetCtrl;
                };
                ctrl.addContent = function (contentCtrl) {
                    if ('contentCtrl' in ctrl) {
                        throw new Error('Popovers can only have one popover-content child element');
                    }
                    ctrl.contentCtrl = contentCtrl;
                };
                ctrl.removeContent = function (contentCtrl) {
                    if ('contentCtrl' in ctrl && contentCtrl === ctrl.contentCtrl) {
                        delete ctrl.contentCtrl;
                    }
                };
                ctrl.$onInit = function () {
                    if ('initOpen' in ctrl) {
                        ctrl.open(!!ctrl.initOpen);
                    }
                    ctrl.onInited({ctrl: ctrl});
                };
                ctrl.$postLink = function () {
                    ctrl.onDocumentMouseDown = function (event) {
                        var isChild = $element.find(event.target).length > 0;

                        if (!isChild) {
                            ctrl.close();
                            $scope.$digest();
                        }
                    };
                    if (ctrl.is_open && ctrl.addClickOffHandlers) {
                        ctrl.addClickOffHandler();
                    }
                };
                ctrl.openOnHover = function () {
                    return $attrs.openOnHover !== undefined;
                };
                ctrl.$onDestroy = function () {
                    if (ctrl.is_open) {
                        ctrl.removeClickOffHandler();
                    }
                };
                ctrl.addClickOffHandler = function () {
                    $document.on("mousedown", ctrl.onDocumentMouseDown);
                };
                ctrl.removeClickOffHandler = function () {
                    $document.off("mousedown", ctrl.onDocumentMouseDown);
                };
                ctrl.autopositionContent = function () {
                    $element.find('.popover').addClass('active');
                    if (ctrl.lightwindow) {
                        return;
                    }
                    var positionTarget = ctrl.getPositionTarget();
                    ctrl.position.of = positionTarget || ctrl.getTargetElement();
                    $timeout(ctrl.setDirectionClass);
                };

                ctrl.getTargetElement = function() {
                    var targetElement = $element.find('.popover-target');
                    if(targetElement.length === 0) {
                        targetElement = ctrl.targetElement;
                    }
                    return targetElement;
                };

                ctrl.getPositionTarget = function () {
                    var positionTarget = $element.find('.popover-position-target');
                    if(positionTarget.length !== 0) {
                        return positionTarget;
                    }
                };

                ctrl.setDirectionClass = function () {
                    var content = $element.find('.popover-content');
                    content.position(ctrl.position);
                    var target = ctrl.getTargetElement();
                    if (!content.size() || !target.size()) {
                        return;
                    }
                    var contentRect = content[0].getBoundingClientRect();
                    var targetRect = target[0].getBoundingClientRect();
                    target.removeClass('popover-content-above popover-content-below popover-content-left popover-content-right');
                    content.removeClass('popover-target-above popover-target-below popover-target-left popover-target-right');
                    if (contentRect.right <= targetRect.left) {
                        target.addClass('popover-content-left');
                        content.addClass('popover-target-right')
                    } else if (contentRect.left >= targetRect.right) {
                        target.addClass('popover-content-right');
                        content.addClass('popover-target-left')
                    } else if (contentRect.top >= targetRect.bottom) {
                        target.addClass('popover-content-below');
                        content.addClass('popover-target-above')
                    } else if (contentRect.bottom >= targetRect.top) {
                        target.addClass('popover-content-above');
                        content.addClass('popover-target-below')
                    }
                };

                ctrl.setPosition = function (position) {
                    angular.extend(ctrl.position, position)
                };

                var hoverTimerPromise;
                ctrl.onEnter = function() {
                    cancelHoverTimer();
                    $scope.$apply(ctrl.open)
                };
                ctrl.onLeave = function() {
                    hoverTimerPromise = $timeout(ctrl.close, 25);
                };
                function cancelHoverTimer() {
                    if (hoverTimerPromise) {
                        $timeout.cancel(hoverTimerPromise);
                    }
                    hoverTimerPromise = undefined;
                }
            }]);
