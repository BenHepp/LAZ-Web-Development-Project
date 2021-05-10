"use strict";

angular.module('shared')

    .component('moreLessText', {
        templateUrl: '/shared/js/angular/ui/more-less-text.html',
        controller: 'MoreLessText',
        bindings: {
            text: "<",
            maxLess: "<",
            text2: "@",
            max2: "@"
        }
    })
    .controller('MoreLessText', [function moreLessTextController() {
        var ctrl = this;
        ctrl.$onInit = function () {
            ctrl.showMore = false;
            if (ctrl.text2 != undefined) {
                ctrl.text = ctrl.text2;
            }
            if (ctrl.max2 != undefined) {
                ctrl.maxLess = parseInt(ctrl.max2);
            }
        };
        ctrl.toggleShow = function () {
            ctrl.showMore = !ctrl.showMore;
        };
        ctrl.getDisplayText = function () {
            return ctrl.showMore ? ctrl.text : ctrl.text.substring(0, ctrl.maxLess);
        };
        ctrl.showMoreLessToggle = function () {
            return ctrl.text.length >= ctrl.maxLess;
        }
    }]);
