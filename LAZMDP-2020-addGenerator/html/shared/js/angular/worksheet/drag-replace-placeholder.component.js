(function () {
    "use strict";

    angular.module('shared.worksheet')

        .component('dragReplacePlaceholder', {
            templateUrl: '/shared/js/angular/worksheet/drag-replace-placeholder.html',
            controller: 'DragReplacePlaceholderController',
            transclude: true,
            require: {
                dragSortableListCtrl: '^dragSortableList'
            },
            bindings: {
                mode: '<',
                template: '@'
            }
        })

        .controller('DragReplacePlaceholderController', [
            function DragReplacePlaceholderController() {
                var ctrl = this;

                ctrl.$onInit = function () {
                    ctrl.dragSortableListCtrl.setPlaceholderCtrl(ctrl);
                    // TODO : what happens if there's more than one placeholder coming in
                };

                ctrl.setDragTarget = function(dragTarget) {
                    ctrl.dragTarget = dragTarget;
                };
            }
        ]);
})();

