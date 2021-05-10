"use strict";

angular.module('shared')

    .component('lazFieldErrorBubble', {
        transclude: true,
        bindings: {
            field: "<",
            when: "<?",
        },
        templateUrl: '/shared/js/angular/ui/laz-field-error-bubble.html',
        controller: 'LazFieldErrorBubble'
    })
    .controller('LazFieldErrorBubble', [function LazFieldErrorBubbleCtrl() {
        var ctrl = this;
        ctrl.When = function () {
            return !('when' in ctrl) || !!ctrl.when;
        };
        ctrl.show = function () {
            return ctrl.When() && ctrl.field && ctrl.field.$dirty && ctrl.field.$invalid;
        }
    }])