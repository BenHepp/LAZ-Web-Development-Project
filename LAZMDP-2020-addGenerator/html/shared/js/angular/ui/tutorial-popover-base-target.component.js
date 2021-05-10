"use strict";

angular.module('shared')

    .component('tutorialPopoverBaseTarget', {
        controller: 'TutorialPopoverBaseTarget',
        require: {
            popoverCtrl: '^tutorialPopoverBase'
        },
        bindings: {
            targetElement  : '<',
            isActive: '<'
        },
        template: '<div class="tutorial_target" ng-if="$ctrl.isActive"></div>'
    })
    .controller('TutorialPopoverBaseTarget', ['$interval', function TutorialPopupBaseTargetCtrl($interval) {
        var ctrl = this;
        var repositionIntervalInstance;
        var repositionIntervalInMilliseconds = 200;

        ctrl.$onInit = function() {
        };

        ctrl.$onChanges = function() {
            if(ctrl.isActive && ctrl.targetElement){
                ctrl.startRepositionInterval();
            }
            else {
                ctrl.stopRepositionInterval();
            }
        }

        ctrl.startRepositionInterval = function() {
            repositionIntervalInstance = $interval(function() {
                var currentPosition = createPositionObject();
                if(hasTargetMoved(currentPosition)) {
                    ctrl.popoverCtrl.autopositionContent();
                    ctrl.previousPosition = currentPosition;
                }
            }, repositionIntervalInMilliseconds);
        };

        ctrl.stopRepositionInterval = function() {
            if(repositionIntervalInstance) {
                $interval.cancel(repositionIntervalInstance);
            }
        }

        function hasTargetMoved(currentBoundingClientRect) {
            var isPositionChanged;
            if(ctrl.previousPosition) {
                isPositionChanged = isPositionObjectDifferent(ctrl.previousPosition, currentBoundingClientRect);
            }
            else{
                isPositionChanged = true;
            }

            return isPositionChanged;
        }

        function createPositionObject() {
            return {
                boundingClientRect: ctrl.targetElement[0].getBoundingClientRect(),
                outerWidth: jQuery(ctrl.targetElement[0]).outerWidth(),
                outerHeight: jQuery(ctrl.targetElement[0]).outerHeight(),
                scrollTop: jQuery(ctrl.targetElement[0]).scrollTop(),
                position: jQuery(ctrl.targetElement[0]).position()
            }
        }

        function isPositionObjectDifferent(previous, current) {
            var isBottomDifferent = current.boundingClientRect.bottom != previous.boundingClientRect.bottom;
            var isHeightDifferent = current.boundingClientRect.height != previous.boundingClientRect.height;
            var isLeftDifferent = current.boundingClientRect.left != previous.boundingClientRect.left;
            var isRightDifferent = current.boundingClientRect.right != previous.boundingClientRect.right;
            var isTopDifferent = current.boundingClientRect.top != previous.boundingClientRect.top;
            var isWidthDifferent = current.boundingClientRect.width != previous.boundingClientRect.width;

            var isPositionLeftDifferent = current.position.left != previous.position.left;
            var isPositionTopDifferent = current.position.top != previous.position.top;

            var isOuterWidthDifferent = current.outerWidth != previous.outerWidth;
            var isOuterHeightDifferent = current.outerHeight != previous.outerHeight;
            var isScrollTopDifferent = current.scrollTop != previous.scrollTop;

            if(isBottomDifferent || isHeightDifferent ||
                isLeftDifferent || isRightDifferent ||
                isTopDifferent || isWidthDifferent ||
                isOuterHeightDifferent || isOuterWidthDifferent || isScrollTopDifferent ||
                isPositionLeftDifferent || isPositionTopDifferent) {
                return true;
            }
            else {
                return false;
            }
        }

        function getTargetPopupName() {
            return angular.element(ctrl.targetElement[0]).attr("tutorial-popup-name");
        }

        ctrl.$onDestroy = function() {
            $interval.cancel(repositionIntervalInstance);
        }
    }])
