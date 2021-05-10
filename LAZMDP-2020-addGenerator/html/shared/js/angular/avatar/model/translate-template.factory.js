(function() {
    'use strict';

    angular.module('shared.avatar')

    .factory('translateTemplate', ['$interpolate', '$filter', function($interpolate, $filter) {
        var PHP_TEMPLATE_REGEX = /\$([a-z0-9_]+)/gi;
        var camelize = $filter('camelcase');

        function phpToAngularReplacer(match, varName) {
            return '{{' + camelize(varName) + '}}'
        }

        return function translateTemplate(template) {
            if(!angular.isString(template || '')) throw new Error('template must be a string!');

            return $interpolate( (template || '').replace(PHP_TEMPLATE_REGEX, phpToAngularReplacer) );
        }
    }])
})();

