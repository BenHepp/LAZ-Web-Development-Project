(function() {
    'use strict';

    angular.module('shared')

        .factory('RequestQueue', ['$q', '_', function($q, _) {

            function RequestQueue(config) {
                config = _.defaults(config || {}, { trace: false });

                this._pending = $q.resolve();
                this._count = 0;
                this._log = config.trace ? function(msg) { console.log(msg) } : angular.noop;

                Object.defineProperties(this, {
                    length: {
                        get: function() {
                            return this._count;
                        }
                    }
                })
            }

            RequestQueue.prototype = {
                //TODO implement "key" exclusion, so some requests block everything and others just one key
                enqueue: function(callback) {
                    this._count++;

                    var id = _.uniqueId('request_');

                    var self = this;
                    return $q(function(resolve, reject) {
                        self._log('starting ' + id);
                        self._pending = self._pending.then(function() {
                            try {
                                self._log('running ' + id);
                                var promise = $q.when( callback() );
                                resolve(promise);
                            } catch(err) {
                                reject(err);
                            }

                            return promise.then(onComplete, onComplete);
                        })
                    });

                    function onComplete() {
                        self._log('completed ' + id);
                        self._count--;
                    }
                }
            };

            return RequestQueue;
        }])
})();