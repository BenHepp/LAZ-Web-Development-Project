(function () {

    "use strict";

    angular.module('shared')

        .directive('lazCheckbox', ['lazCheckboxDirectiveFactory', function (lazCheckboxDirectiveFactory) {
            return lazCheckboxDirectiveFactory({templateUrl: '/shared/js/angular/ui/laz-checkbox.html'});
        }])
})()
