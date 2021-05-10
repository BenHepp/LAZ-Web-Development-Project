"use strict";

/**
 * Central service for error handling.  Responsible for publishing error messages to subscribers for reporting.
 */
angular.module('shared')

    .factory('messageHandler', ['_', '$rootScope', 'safeApply', function (_, $rootScope, safeApply) {
            var subscribers = [];
            var messages = [];
            var service = {
                publishError: publishError,
                publishSuccess: publishSuccess,
                error: publishError,
                publish: publishError,
                subscribe: subscribe,
                unsubscribe: unsubscribe
            };
            return service;

            function publishError(message, linkText, callback, onRemove) {
                if(!message){
                    message = 'There was a problem with your request. Please refresh and try again.';
                }
                _.each(subscribers, function notifyListener(listener) {
                    listener(message,'error', linkText, callback, onRemove);
                });
                messages.push({message: message, type: "error"});
                safeApply($rootScope);
            }

            function publishSuccess(message, linkText, callback, onRemove) {
                _.each(subscribers, function notifyListener(listener) {
                    listener(message,'success', linkText, callback, onRemove);
                });
                messages.push({message: message, type: "error"});
                safeApply($rootScope);
            }

            function subscribe(listener) {
                subscribers.push(listener);
                _.each(messages, function notify(message) {
                    listener(message.message, message.type);
                });
            }
            function unsubscribe(listener) {
                subscribers = _.filter(subscribers, function (subscriber) {
                    return subscriber !== listener;
                })
            }
        }])
    .factory('safeApply', [function() {
        return function($scope, fn) {
            var phase = $scope.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if (fn) {
                    $scope.$eval(fn);
                }
            } else {
                if (fn) {
                    $scope.$apply(fn);
                } else {
                    $scope.$apply();
                }
            }
        }
    }])
    .run(['messageHandler', function(messageHandler){
        window.clg = window.clg || {};
        window.clg.commonUtils = window.clg.commonUtils || {};
        window.clg.commonUtils.messageHandler = messageHandler;
    }]);
