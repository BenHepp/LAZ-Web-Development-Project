(function () {
    "use strict";

    angular
        .module('shared')
        .component('assignTargetedResourceButton', {
            templateUrl: '/shared/js/angular/targeted-resource-assignments/assign-targeted-resource-button.html',
            controller: 'assignTargetedResourceButton',
            bindings: {
                language: '<'
            }
        })
        .controller('assignTargetedResourceButton', assignTargetedResourceButtonCtrl);

    assignTargetedResourceButtonCtrl.$inject = ['$scope', 'targetedResource', 'assignTargetedResource'];

    function assignTargetedResourceButtonCtrl($scope, targetedResource, assignTargetedResource) {
        var ctrl = this;
        var resources = targetedResource.getResourceInfoByTranslation();
        ctrl.isAssignable = false;
        ctrl.$onChanges = onChanges;
        ctrl.assign = assign;

        function onChanges(changes) {
            if (changes.language) {
                ctrl.isAssignable = resources[ctrl.language] && resources[ctrl.language].is_assignable;
            }
        }

        function assign() {
            if (resources[ctrl.language]) {
                assignTargetedResource.showResourceInfo(resources[ctrl.language]);
            }
        }
    }
})();
