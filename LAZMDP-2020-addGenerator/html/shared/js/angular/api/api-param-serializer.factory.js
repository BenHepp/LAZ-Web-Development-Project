(function() {
    'use strict';

    angular.module('shared')

        .factory('apiParamSerializer', ['$window', '$httpParamSerializer', '_', function($window, $httpParamSerializer, _) {
            return function apiParamSerializer(params) {
                var newParams = {};
                _.each(params, function(value, key) {
                    newParams[key] = _.isArray(value) ? _.map(value, serializeScalar).join(',') : value;
                });

                return $httpParamSerializer(newParams);
            };

            function serializeScalar(value) {
                if($window.moment) {
                    if( (value instanceof Date) || moment.isMoment(value) ) {
                        return moment(value).format('YYYY-MM-DD[T]H:mm:ss');
                    }
                }

                return value;
            }
        }])
})();

