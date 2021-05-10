(function() {
    'use strict';

    angular.module('shared')

        .factory('createApi', ['$http', function($http) {
            return function createApi(rootApiPath) {

                function api(config) {
                    return $http(config)
                        .then(function(result) {
                            return result.data;
                        })
                }

                ['get', 'delete', 'head'].forEach(function(method) {
                    api[method] = function(url, config) {
                        config = angular.extend({
                            method: method.toUpperCase(),
                            url: rootApiPath + url,
                            paramSerializer: 'apiParamSerializer'
                        }, config || {});

                        addNoCacheParams(config);

                        return api(config);
                    }
                });

                ['post', 'put', 'patch'].forEach(function(method) {
                    api[method] = function(url, data, config) {
                        config = angular.extend({
                            method: method.toUpperCase(),
                            url: rootApiPath + url,
                            paramSerializer: 'apiParamSerializer',
                            data: data
                        }, config || {});

                        return api(config);
                    }
                });

                return api;

                function addNoCacheParams(config) {
                    var token = new Date().getTime();

                    if( !angular.isObject(config.params) ) {
                        config.params = { noCache: token };
                    } else if( !config.params.noCache ) {
                        config.params.noCache = token;
                    }

                    return config;
                }
            }
        }])
})();