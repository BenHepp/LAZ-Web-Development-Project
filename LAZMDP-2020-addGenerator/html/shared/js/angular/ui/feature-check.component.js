(function() {
    'use strict';

    angular.module('shared')

        .component('featureCheck', {
            templateUrl: '/shared/js/angular/ui/feature-check.html',
            transclude: {
                enabled: '?enabled',
                disabled: '?disabled'
            },
            controller: 'FeatureCheckController',
            bindings: { code: '@' }
        })

        .controller('FeatureCheckController', ['FeatureCheck', function(FeatureCheck) {
            var ctrl = this;

            ctrl.$onInit = function() {
                ctrl.enabled = FeatureCheck.isFeatureEnabled(ctrl.code);
            }
        }])
})();