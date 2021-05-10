(function () {
    "use strict";

    var ENTER_EVENTS = 'mouseenter';
    var LEAVE_EVENTS = 'mouseleave';
    var DEFAULT_DELAY = 250;

    angular.module('shared')
        .directive('tooltip', ['$animate', '$timeout', function tooltipDirective($animate, $timeout) {
            return {
                restrict: 'E',
                transclude: 'element',
                scope: {
                    position: '@?'
                },
                require: {
                    tooltipTarget: "?^^"
                },
                link: link
            }

            function link($scope, $element, $attr, require, $transclude) {
                var target = getTarget(require.tooltipTarget);
                var position = getPosition();
                angular.extend(position, {of: target});
                var tooltipScope, tooltipElement;
                target.on(ENTER_EVENTS, enterEventHandler);

                function getTarget(tooltipTarget) {
                    return tooltipTarget ? tooltipTarget.element : $element.parent();
                }

                function setVisible(visible) {
                    if (visible === !!tooltipElement) {
                        return;
                    }
                    if (visible) {
                        $transclude(function (clone, newScope) {
                            tooltipScope = newScope;
                            tooltipElement = clone;
                            addTooltipToDOM(clone);
                        });
                    } else {
                        if (tooltipElement) {
                            tooltipElement.remove();
                            tooltipElement = null;
                        }
                        if (tooltipScope) {
                            tooltipScope.$destroy();
                            tooltipScope = null;
                        }
                    }
                }

                function addTooltipToDOM(element) {
                    angular.element('body').append(element);
                    element.position(position);
                    element.addClass('is-active')
                }

                function getPosition() {
                    var sides = {
                        top: {
                            my: 'left bottom',
                            at: 'left top-12'
                        },
                        bottom: {
                            my: 'center top',
                            at: 'center bottom'
                        },
                        left: {
                            my: 'right center',
                            at: 'left center'
                        },
                        right: {
                            my: 'left center',
                            at: 'right center'
                        }
                    };
                    if ($scope.position) {
                        return $scope.$eval(ctrl.position);
                    }
                    var sidePosition = _.find(sides, function (position, side) {
                        return side in $attr;
                    });
                    if (sidePosition) {
                        return sidePosition;
                    }
                    return sides.top;
                }

                var startupPromise;

                function enterEventHandler(e) {
                    if (!tooltipElement) {
                        target.on(LEAVE_EVENTS, leaveEventHandler);
                        startupPromise = $timeout(DEFAULT_DELAY);
                        startupPromise.then(function () {
                            startupPromise = undefined;
                            setVisible(true);
                        }).catch(angular.noop)
                    }
                }

                function leaveEventHandler(e) {
                    target.off(LEAVE_EVENTS, leaveEventHandler);
                    if (startupPromise) {
                        $timeout.cancel(startupPromise);
                        startupPromise = undefined;
                    } else {
                        setVisible(false);
                    }
                }

            }
        }])
        //Directive to mark parent element which is to be used for triggering the tooltip
        .directive('tooltipTarget', [function () {
            return {
                restrict: 'A',
                controller: ['$element', function ($element) {
                    var ctrl = this;
                    ctrl.element = $element;
                }]
            }
        }])
})();
