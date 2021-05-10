"use strict";

angular.module('shared')

    .component('popoverTarget', {
            require: {
                popoverCtrl: '^popover'
            },
            controller: 'PopoverTarget',
            templateUrl: '/shared/js/angular/ui/popover-target.html',
            transclude: true
        })
        .controller('PopoverTarget', ['$element', function PopoverTargetCtrl($element) {
            var ctrl = this;
            ctrl.$onInit = function () {
                ctrl.popoverCtrl.addTarget(this);
            };
            ctrl.toggleOpen = function (event) {
                if(!$element.attr("disabled"))
                    ctrl.popoverCtrl.toggleOpen();
                event.stopPropagation();
            };
            ctrl.$postLink = function () {
                if (ctrl.popoverCtrl.openOnHover()) {
                    $element.on('mouseenter', ctrl.popoverCtrl.onEnter)
                        .on('mouseleave', ctrl.popoverCtrl.onLeave)
                }
            }
            ctrl.$onDestroy = function () {
                $element.off('mouseenter', ctrl.popoverCtrl.onEnter)
                    .off('mouseenter', ctrl.popoverCtrl.onEnter)
            }
            function open() {
                ctrl.popoverCtrl.open()
            }
        }])
