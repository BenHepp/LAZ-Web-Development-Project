(function () {
    "use strict";

    angular
        .module('shared')
        .factory('ajaxMain', ajaxMainFactory);

    ajaxMainFactory.$inject = ['$http', '$q'];

    function ajaxMainFactory($http, $q) {
        return {
            serverRequest: serverRequest
        };

        function serverRequest(config) {
            return $http(config)
                .then(function(response){
                    var badResponseText = "<html";
                    if (typeof(response.data) === 'string' && response.data.indexOf(badResponseText) > 0) {
                        return $q.reject('Unknown server error.');
                    }
                    return response;
                });
        }
    }
})();
