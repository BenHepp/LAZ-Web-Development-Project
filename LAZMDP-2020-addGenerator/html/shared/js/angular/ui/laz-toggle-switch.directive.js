(function () {

    "use strict";

    var checkboxId = 1;

    function getNextCheckboxId() {
        return checkboxId++;
    }

    angular.module('shared')

        .directive('lazToggleSwitch', ['lazCheckboxDirectiveFactory', function (lazCheckboxDirectiveFactory) {
            return lazCheckboxDirectiveFactory({templateUrl: '/shared/js/angular/ui/laz-toggle-switch.html'});
        }])
})()
