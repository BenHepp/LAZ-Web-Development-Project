"use strict";

angular.module('shared')

    .factory('httpRequestInterceptor', ['$q', 'messageHandler', function ($q, messageHandler) {
        var currentMessageTimer = null;
        function debounce(time){
            currentMessageTimer = setTimeout(function(){
                currentMessageTimer = null;
            },time);
        }
        return {
            'responseError': function(rejection) {
                if(currentMessageTimer) return;
                if ((rejection.status === 404 || rejection.status === -1) && /\.html$/.test(rejection.config.url)) {
                    messageHandler.error("There was a problem contacting the server.");
                    debounce(3000);
                }
                return $q.reject(rejection);
            }
        };
    }])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('httpRequestInterceptor');
    }])