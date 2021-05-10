"use strict";

angular.module('shared')

    .filter('uiMessageBoxResponse', ['_', function (_) {
        return function (response) {
            if (_.isString(response)) {
                return response;
            } else if ('label' in response) {
                return response.label;
            }
        }
    }])
