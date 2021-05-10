"use strict";

angular.module('shared')

    .component('tutorialPopoverBase', {
        bindings: {
            initOpen: '<?',
            onOpenChanged: '&',
            onInited: '&'
        },
        controller: 'TutorialPopoverBase',
        template: ''
        +'  <div class="tutorial">'
        +'      <ng-transclude></ng-transclude>'
        +'  </div>',
        transclude: true
    })
    .controller('TutorialPopoverBase',
        ['$document', '$scope', '$element', '$timeout', '$window', '$attrs', '$interval', function TutorialPopoverBaseCtrl($document, $scope, $element, $timeout, $window, $attrs, $interval) {
            var ctrl = this;

            ctrl.is_open = false;
            ctrl.position = {
                my: 'center top+10',
                at: 'center bottom',
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
                        $timeout(ctrl.autopositionContent)
                    } else {
                        $element.find('.tutorial').removeClass('active');
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

            ctrl.getTargetCtrl = function () {
                return ctrl.targetCtrl;
            }
            ctrl.addContent = function (contentCtrl) {
                if ('contentCtrl' in ctrl) {
                    throw new Error('Popovers can only have one popover-content child element');
                }
                ctrl.contentCtrl = contentCtrl;
            };
            ctrl.removeContent = function (contentCtrl) {
                if ('contentCtrl' in ctrl && contentCtrl == ctrl.contentCtrl) {
                    delete ctrl.contentCtrl;
                }
            };
            ctrl.$onInit = function () {
                ctrl.onInited({ctrl: ctrl});
            };
            ctrl.$postLink = function () {
                ctrl.onDocumentMouseDown = function (event) {
                    var isChild = $element.find(event.target).length > 0;

                    if (!isChild) {
                        ctrl.close();
                        $scope.$digest();
                    }
                }
                if ('initOpen' in ctrl) {
                    ctrl.open(!!ctrl.initOpen);
                }
            }

            ctrl.autopositionContent = function () {
                positionPopover();
                positionArrow();
            }

            function positionPopover() {
                ctrl.position.of = ctrl.targetElement;
                $element.find('.tutorial_content').position(ctrl.position);
                ctrl.setDirectionClass();
                $element.find('.tutorial').addClass('active');
            }

            function positionArrow() {
                var targetPosition = angular.extend({}, ctrl.position);
                targetPosition.my = "center-3 top";
                $element.find('.tutorial_target').position(targetPosition);
            }

            ctrl.setDirectionClass = function () {
                var content = $element.find('.tutorial_content');
                var target = ctrl.targetElement;
                if (!content.size() || !target.size()) {
                    return;
                }
            }

            ctrl.setPosition = function (position) {
                angular.extend(ctrl.position, position)
            }
        }])
