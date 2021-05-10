(function() {
    'use strict';

    angular.module('shared.avatar')

    .filter('camelcase', [function() {
        var CAMEL_CASE_REGEX = /(?:[^a-z0-9]+|^)([a-z])([a-z0-9]*)/gi;

        function camelcaseReplacer(match, first, rest, offset) {
            return (offset > 0 ? first.toUpperCase() : first.toLowerCase()) + rest.toLowerCase()
        }

        return function camelcaseFilter(string) {
            if(!angular.isString(string)) return string;

            return string.trim().replace(CAMEL_CASE_REGEX, camelcaseReplacer)
        }
    }]);
})();

