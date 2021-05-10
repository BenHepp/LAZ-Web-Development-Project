"use strict";

angular.module('shared')

    .factory('apiStudentsList', ['$http', function apiStudentsListFactory($http) {
        var factory = {
            get: get,
        };
        return factory;

        function get(includes) {
            var config = { };
            if (includes) {
                config.params = {
                    include: includes
                }
            }
            return $http.get('/api/students/list', config);
        }
    }])
