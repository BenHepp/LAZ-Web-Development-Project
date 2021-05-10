"use strict";

angular.module('shared')

    .component('navTabs', {
        controller: 'NavTabs',
        templateUrl: "/shared/js/angular/ui/nav-tabs.html",
        transclude: true,
        bindings: {
            modifier: '@'
        }
    })
    .controller('NavTabs', ['_', function NavTabsController(_) {
        var ctrl = this;

        ctrl.panes = [];
        ctrl.select = select;
        ctrl.addPane = addPane;
        ctrl.deselectAll = deselectAll;

        function deselectAll() {
            _.each(ctrl.panes, function (pane) {
                pane.selected = false;
            });
        }

        function select(pane) {
            deselectAll();
            pane.selected = true;
        }

        function addPane(pane) {
            ctrl.panes.push(pane);
            if (ctrl.panes.length === 1 || pane.initSelected == "true") {
                select(pane);
            }
        }
    }])
