(function() {
    'use strict';

    angular.module('shared')

        .factory('EventEmitter', ['_', function(_) {
            function EventEmitter() {
                this._listeners = {};
            }

            angular.extend(EventEmitter.prototype, {
                on: addEventListener,
                addListener: addEventListener,
                off: removeEventListener,
                removeListener: removeEventListener,
                removeAllListeners: function(event) {
                    if(event === undefined) {
                        this._listeners = { };
                    } else {
                        delete this._listeners[event];
                    }
                },
                emit: function(event, value) {
                    var listeners = this._listeners[event];
                    if(listeners) {
                        listeners.forEach( function(listener) {
                            listener.call(null, value);
                        });
                    }
                },
                eventNames: function() {
                    return _.keys(this._listeners);
                },
                listenerCount: function (eventName) {
                    var total = 0;

                    if( _.isUndefined(eventName) ) {
                        for(var event in this._listeners) {
                            if( this._listeners.hasOwnProperty(event) ) {
                                var listeners = this._listeners[event];
                                total += listeners.length;
                            }
                        }
                    } else if( this._listeners.hasOwnProperty(eventName) ) {
                        total = this._listeners[eventName].length;
                    }

                    return total;
                }
            });

            function addEventListener(event, callback) {
                if(!_.isFunction(callback)) throw new Error('callbacks must be a function!');

                var listeners = this._listeners[event];
                if(!listeners) {
                    listeners = this._listeners[event] = [];
                } else if( listeners.indexOf(callback) >= 0 ) {
                    return;
                }

                listeners.push(callback);
            }

            function removeEventListener(event, callback) {
                var removed = false;

                var listeners = this._listeners[event];
                if(listeners) {
                    var idx = _.indexOf(listeners, callback);
                    if(idx >= 0) {
                        listeners.splice(idx, 1);
                        removed = true;
                    }
                }

                return removed;
            }

            return EventEmitter;
        }]);
})();