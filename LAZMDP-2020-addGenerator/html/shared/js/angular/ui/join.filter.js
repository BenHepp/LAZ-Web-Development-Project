"use strict";

angular.module('shared')

    .filter('join', [function() {
        return function (array, delimiter) {
            var finalDelimiter = delimiter ? delimiter : ', '
            return angular.isArray(array) ? array.join(finalDelimiter) : '';
        }
    }])
