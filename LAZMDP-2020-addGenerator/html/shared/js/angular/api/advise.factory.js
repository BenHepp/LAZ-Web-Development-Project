(function() {
    'use strict';

    angular.module('shared')

        .provider('$advice', [function() {
            var middlewares = {};
            var provider = {
                register: registerMiddleware,
                $get: ['$injector', factoryFn]
            };

            return provider;

            function registerMiddleware(name, factoryFn) {
                middlewares[name] = factoryFn;
                return provider;
            }

            function factoryFn($injector) {
                return function(name, locals) {
                    var middlewareFactory = angular.isString(name) ? middlewares[name] : name;
                    return $injector.invoke(middlewareFactory, null, locals);
                }
            }
        }])

        .factory('advise', ['$injector', '_', '$advice', function($injector, _, $advice) {

            return function applyAdvice(originalFn, middlewares, locals) {
                if( !_.isFunction(originalFn) ) {
                    throw new Error('Can only apply advice to a function')
                }

                locals = locals || {};

                middlewares = _.isArray(middlewares) ? middlewares : [middlewares];
                middlewares = _.map(middlewares, function(middleware) {
                    return $advice(middleware, locals);
                });

                return function advisedFn() {
                    var initialArgs = Array.prototype.slice.call(arguments);
                    var self = this;

                    var initialContext = {
                        invocationTarget: self,
                        invokedFunction: originalFn,
                        arguments: initialArgs
                    };

                    var index = 0;
                    function next(context) {
                        if(index >= middlewares.length) {
                            var finalArgs = context.arguments || initialArgs;
                            return originalFn.apply(self, finalArgs);
                        } else {
                            return middlewares[index++].call(self, context, next);
                        }
                    }

                    return next(initialContext);
                }
            };
        }])
})();