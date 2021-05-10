"use strict";

angular.module('shared')

    .component('sortHeader', {
        bindings: {
            field: '@',
            orderManager: '<',
            sortFunction: '&'
        },
        controller: 'SortHeader',
        templateUrl: '/shared/js/angular/ui/sort-header.html',
        transclude: true
    })
    .controller('SortHeader', [function SortHeaderController() {
        var ctrl = this;
        ctrl.isOrderBy = function () {
            return ctrl.orderManager.isOrderBy(ctrl.field);
        };
        ctrl.orderBy = function () {
            var x = ctrl.orderManager.orderBy(ctrl.field);
            ctrl.sortFunction({orderedBy: ctrl.field, sortDirection: ctrl.orderManager.getReverse()});
            return x;
        };
        ctrl.getReverse = function () {
            return ctrl.orderManager.getReverse();
        }
    }])