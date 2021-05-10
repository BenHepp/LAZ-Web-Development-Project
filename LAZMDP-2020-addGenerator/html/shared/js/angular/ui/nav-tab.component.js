"use strict";

angular.module('shared')

    .component('navTab', {
        controller: 'NavTab',
        transclude: true,
        require: {
            navTabs: '^navTabs'
        },
        bindings: {
            label: '@',
            name: '@',
            initSelected: '@?'
        },
        templateUrl: "/shared/js/angular/ui/nav-tab.html"
    })
    .controller('NavTab', [function NavTabCtrl() {
        var ctrl = this;

        ctrl.$onInit = function () {
            ctrl.navTabs.addPane(this);
        };
    }])