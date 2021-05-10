(function () {
    "use strict";

    angular.module('kids')

        .directive('maxNumber', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, elm, attr, ctrl) {
                    if (!ctrl) return;

                    var max = 0;
                    attr.$observe('maxNumber', function(value) {
                        max = Math.floor(Number(value));
                        ctrl.$validate();
                    });
                    ctrl.$validators.max_number = function(modelValue, viewValue) {
                        return ctrl.$isEmpty(viewValue) || Math.floor(Number(viewValue)) <= max;
                    };
                }
            };
        });
})();
