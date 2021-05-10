(function() {
    'use strict';

    angular.module('shared')

        .factory('LiveUpdate', [
            '$interval', '$q', '_', 'EventEmitter',
            function($interval, $q, _, EventEmitter)
            {
                //TODO? convert to using prototype
                function LiveUpdate(config) {
                    if( _.isFunction(config) ) {
                        config = { update: config };
                    } else if( !_.isFunction(config.update) ) {
                        throw new Error('Must provide an "update(EventEmitter)" function to request data and notify');
                    }

                    _.defaults(config, {
                        subscribe: function(emitter, event, callback) {
                            if(arguments.length < 3) {
                                callback = event;
                                event = LiveUpdate.DEFAULT_EVENT;
                            }

                            if( !angular.isFunction(callback) ) {
                                throw new Error('callback is not a function!');
                            }

                            emitter.on(event, callback);
                        },
                        unsubscribe: function(emitter, event, callback) {
                            if(arguments.length < 3) {
                                callback = event;
                                event = LiveUpdate.DEFAULT_EVENT;
                            }

                            emitter.off(event, callback);
                        },
                        hasSubscribers: function(emitter) {
                            return emitter.listenerCount() > 0;
                        }
                    });


                    var pollingInterval = 1000;
                    var pollTimeout;
                    var emitter = new EventEmitter();
                    var requestActive = false;

                    return {
                        subscribe: subscribe,
                        setInterval: function(interval) { pollingInterval = Math.max(500, interval); }
                    };

                    function subscribe() {
                        var args = [emitter].concat(Array.prototype.slice.call(arguments));

                        config.subscribe.apply(null, args);
                        if( config.hasSubscribers(emitter) > 0 ) {
                            startPolling();
                        }

                        return function unsubscribe() {
                            config.unsubscribe.apply(null, args);
                            if( !config.hasSubscribers(emitter) ) {
                                stopPolling();
                            }
                        };
                    }

                    function poll() {
                        if(requestActive) return;

                        requestActive = true;
                        $q.when( config.update(emitter) )
                            .finally(function() {
                                requestActive = false;
                                if(!config.hasSubscribers(emitter)) {
                                    stopPolling();
                                }
                            })
                    }

                    function startPolling() {
                        if(pollTimeout) return;

                        pollTimeout = $interval(poll, pollingInterval);
                        poll();
                    }

                    function stopPolling() {
                        if(pollTimeout) {
                            $interval.cancel(pollTimeout);
                            pollTimeout = null;
                        }
                    }
                }

                LiveUpdate.DEFAULT_EVENT = '__update__';

                return LiveUpdate;
            }])
})();