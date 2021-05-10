"use strict";

angular.module('shared')

    .component('helpPopover', {
            bindings: { label: '@', linkClassName: '@' },
            templateUrl: '/shared/js/angular/ui/help-popover.html',
            transclude: true,
            controller: "HelpPopover"
        })
    .controller('HelpPopover', ["$attrs","$timeout", function($attrs,$timeout){
        var ctrl = this;
        ctrl.openOnHover = function () {
            return $attrs.openOnHover;
        };

        ctrl.keydown = function(event) {
            if (typeof modalKeyDown == 'function') {
                modalKeyDown(event,ctrl.closePopover,ctrl.mainLinkClassName());
            }
        };

        ctrl.mainLinkClassName = function() {
            return ctrl.linkClassName == null ? 'js-help-popover-link' : ctrl.linkClassName;
        };

        ctrl.setPopover = function (popoverCtrl) {
            ctrl.popoverCtrl = popoverCtrl;
        };


        ctrl.closePopover = function () {
            if (ctrl.popoverCtrl) {
                ctrl.popoverCtrl.close();
            }
            var element = $j('.' + ctrl.mainLinkClassName());
            if (element.length > 0) {
                element.focus();
            }
        };

        ctrl.onOpenChanged = function (open) {
            if (open) {
                $timeout(function () {
                    var element = $j('.js-first-item');
                    if (element.length > 0) {
                        element.focus();
                    }
                }, 0);
            }
        };

    }]);
