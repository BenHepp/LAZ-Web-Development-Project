"use strict";

angular.module('shared')

    .component('popoverContent', {
        bindings: {
            position: '@?'
        },
        require: {
            popoverCtrl: '^popover'
        },
        controller: 'PopoverContent',
        templateUrl: '/shared/js/angular/ui/popover-content.html',
        transclude: true
    })
    .controller('PopoverContent', ['$scope', '$element', '$attrs', function PopoverContentCtrl($scope, $element, $attrs) {
        var ctrl = this;
        ctrl.$onInit = function () {
            ctrl.popoverCtrl.addContent(this);
            if (ctrl.position) {
                ctrl.popoverCtrl.setPosition($scope.$eval(ctrl.position))
            }
            if ('lightwindow' in $attrs) {
                ctrl.lightwindow = true;
                ctrl.popoverCtrl.lightwindow = true;
            }
        };
        ctrl.isOpen = function () {
            return ctrl.popoverCtrl.isOpen();
        }
        ctrl.$postLink = function () {
            if (ctrl.popoverCtrl.openOnHover()) {
                $element.on('mouseenter', ctrl.popoverCtrl.onEnter)
                    .on('mouseleave', ctrl.popoverCtrl.onLeave)
            }
            $element.addClass('is-linked');
        }
        ctrl.$onDestroy = function () {
            ctrl.popoverCtrl.removeContent(this);
            $element.off('mouseenter', ctrl.popoverCtrl.onEnter)
                .off('mouseenter', ctrl.popoverCtrl.onEnter)
        }
        ctrl.close = function () {
            ctrl.popoverCtrl.close();
        }
    }])
