(function() {
    'use strict';

    angular.module('shared')

        .factory('addCaching', [
                    '$q', '_', 'ExpiringCache', 'RequestQueue', 'advise',
            function($q, _, ExpiringCache, RequestQueue, advise)
        {
            return function addCaching(api, config) {
                config = _.defaults(config, {
                    indexer: function(item) { return item ? item.id : null },
                    serializeRequest: function(item) {
                        var id = _.isObject(item) ? item.id : item;
                        return { id: id }
                    },
                    isRequestSatisfied: function(cachedItem, request) { return !cachedItem || cachedItem.id == request.id },
                    getRequestKey: function(request) { return !!request ? request.id : null; },
                    annotations: {},
                    locals: {}
                });

                var noCache = {};
                var cache = new ExpiringCache(config);
                var apiQueue = new RequestQueue({ trace: config.trace });

                _.forEach(api, function(method, name) {
                    if(!_.isFunction(method)) return method;

                    noCache[name] = function() {
                        return method.apply(api, arguments);
                    };

                    var middlewares = getMiddlewareForMethod(name);
                    if(middlewares) {
                        var adviceLocals = getLocalsForMethod(name);
                        api[name] = advise(method, middlewares, adviceLocals);
                    }
                });

                return _.extend(api, { noCache: noCache });

                function getLocalsForMethod(method) {
                    var annotations = config.annotations[method] || {};

                    return angular.extend(config.locals, {
                        $cache$: cache,
                        $apiQueue$:apiQueue,
                        $cacheRequest$: {
                            getKey: annotations.getRequestKey || config.getRequestKey,
                            isSatisfied: annotations.isRequestSatisfied || config.isRequestSatisfied
                        },
                        $cacheResponse$: {
                            index: annotations.indexer || config.indexer
                        }
                    });
                }

                function getMiddlewareForMethod(method) {
                    var annotations = config.annotations[method] || {};

                    if(!annotations.strategy) return null;

                    var middlewares = annotations.strategy;
                    if( !angular.isArray(middlewares) ) middlewares = [ middlewares ];

                    var serializeRequest = annotations.serializeRequest || config.serializeRequest;
                    if( !angular.isFunction(serializeRequest) )
                        throw new Error('serializeRequest must be a function!');

                    function requestSerializerProvider() {
                        return function(context, next) {
                            var requestSettings = serializeRequest.apply(null, context.arguments) || {};
                            context.request = angular.extend(context.request || {}, requestSettings);
                            return next(context);
                        }
                    }

                    //TODO should we sequence all requests?
                    middlewares.unshift('apiSequenceRequests', requestSerializerProvider);

                    return middlewares;
                }
            }


        }])

        .config(['$adviceProvider', function($adviceProvider) {
            $adviceProvider
                .register('apiSequenceRequests', ['$q', '$apiQueue$', function($q, $apiQueue$) {
                    return function(context, next) {
                        return $apiQueue$.enqueue(function() {
                            return next(context);
                        });
                    }
                }])
                .register('apiCacheOne', ['$q', '$cacheResponse$', '$cache$', function($q, $cacheResponse$, $cache$) {
                    return function(context, next) {
                        var retVal = next(context);

                        $q.when(retVal)
                            .then(function(results) {
                                var key = $cacheResponse$.index(results);
                                if(key) {
                                    $cache$.put(key, results);
                                }

                                return results;
                            });

                        return retVal;
                    }
                }])
                .register('apiCacheMany', ['$q', '_', '$cacheResponse$', '$cache$', function($q, _, $cacheResponse$, $cache$) {
                    return function(context, next) {
                        var retVal = next(context);

                        $q.when(retVal)
                            .then(function(results) {
                                _.forEach(results, function(item) {
                                    var key = $cacheResponse$.index(item);
                                    if(key) {
                                        $cache$.put(key, item);
                                    }
                                });

                                return results;
                            });

                        return retVal;
                    }
                }])
                .register('apiCacheLookup', ['$q', '$cacheRequest$', '$cache$', function($q, $cacheRequest$, $cache$) {
                    return function(context, next) {
                        var key = $cacheRequest$.getKey(context.request);
                        if( $cache$.has(key) ) {
                            var item = $cache$.get(key);
                            if( $cacheRequest$.isSatisfied(item, context.request) ) {
                                return $q.resolve(item)
                            }
                        }

                        return $q.when( next(context) );
                    }
                }])
                .register('apiCachePurge', ['$q', '$cacheRequest$', '$cache$', function($q, $cacheRequest$, $cache$) {
                    return function(context, next) {
                        var retVal = next(context);

                        $q.when(retVal)
                            .then(function() {
                                var key = $cacheRequest$.getKey(context.request);
                                $cache$.remove(key);
                            });

                        return retVal;
                    }
                }])
        }])

        /*
        .run(['RequestQueue', '$timeout', function(RequestQueue, $timeout) {
            function makeFn(time, phrase) {
                return function() {
                    return $timeout(function() { console.log(phrase + ' -- ' + new Date()) }, time);
                }
            }

            console.log('zero -- ' + new Date());
            var queue = new RequestQueue({ trace: true });
            queue.enqueue( makeFn(3000, 'one (3s)') );
            queue.enqueue( makeFn(2000, 'two (2s)') );
            queue.enqueue( makeFn(1000, 'three (1s)') );
        }])
         */
})();