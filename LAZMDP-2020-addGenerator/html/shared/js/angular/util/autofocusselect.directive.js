"use strict";

angular.module('shared')

    .directive('autofocusselect', ['$timeout', function ($timeout) {
            return {
                restrict: 'A',
                link: function ($scope, $element) {
                    $timeout(function () {
                        $element[0].focus();
                        $element[0].select();
                    });
                }
            }
        }])
