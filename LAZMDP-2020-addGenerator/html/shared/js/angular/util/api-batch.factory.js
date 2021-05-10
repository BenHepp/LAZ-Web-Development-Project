(function () {
    "use strict";

    angular.module('shared')

    /**
     * Batch request multiplexor. Manage a collection of api requests to be executed in a batch.  Individual requestors
     * interact via returned promises.  The exposed interface is intended to be $http-like.
     */
        .factory('ApiBatch', ['_', '$http', '$q', function ApiBatchFactory(_, $http, $q) {
            return ApiBatch;

            /**
             * Batch request request manager.
             *
             * Create an instance of the class to manage a batch of api requests.  Call http(config) to add requests
             * to the batch.  Call submit() to start batch processing.  Both these methods return promises that resolve
             * when the batch or items in the batch are resolved.
             *
             * Once submitted, instances may be reused for additional batches.
             *
             * @constructor
             */
            function ApiBatch() {
                var batch = [];
                var submitting = false;
                var service = {
                    http: http,
                    submit: submit,
                    canSubmit: canSubmit,
                };
                return service;

                /**
                 * Add an http request to the batch, emulating $http interface - provide a config object with url,
                 * method and optional data.  A promise is returned that resolves with $http-like responses.
                 *
                 * Only /api urls are supported. Sub-batches are not supported.
                 *
                 * @param config - See $http
                 */
                function http(config) {
                    if (!config.url.startsWith('/api/')) {
                        return $q.reject("Only /api calls can be batched");
                    }
                    if (config.url == '/api/batch') {
                        return $q.reject("Subbatches are not allowed");
                    }
                    var item = new BatchItem(config);
                    batch.push(item);
                    return item.promise;
                }

                /**
                 * Return whether the batch is submittable (the batch is non-empty and does not have a pending submit)
                 *
                 * @returns {boolean}
                 */
                function canSubmit() {
                    return !submitting;
                }

                /**
                 * Submit the batch and return a promise for the batch
                 *
                 * @returns a promise
                 */
                function submit() {
                    if (!batch.length) {
                        throw new BatchException('The batch is empty');
                    }
                    if (!canSubmit()) {
                        throw new BatchException('The batch is not submittable')
                    }
                    submitting = true;
                    return $http.post('/api/batch', batchRequestData())
                        .then(function (result) {
                            handleResults(result.data);
                        }, function (reason) {
                            rejectBatchItems(reason);
                            return $q.reject(reason);
                        });
                }

                /**
                 * Initialize the batch so it may be reused for another batch
                 */
                function init() {
                    batch = [];
                    submitting = false;
                }

                function BatchException(message) {
                    this.message = message;
                }

                /**
                 * Cosntruct the array of subrequest data expected by /api/batch from the batch array
                 * @returns {Array}
                 */
                function batchRequestData() {
                    return _.pluck(batch, 'request');
                }

                /**
                 * demultiplex results for the submitted batch and resolve/reject items in the batch
                 * @param results
                 */
                function handleResults(results) {
                    resolveResults(results);
                    init();
                }

                /**
                 * Merge result objects into the batch items
                 * @param results
                 */
                function resolveResults(results) {
                    _.each(_.zip(batch, results), function (itemResultPair) {
                        var item = itemResultPair[0];
                        var result = itemResultPair[1];
                        item.resolve(result);
                    });
                }

                /**
                 * Reject all items in the batch
                 * @param reason
                 */
                function rejectBatchItems(reason) {
                    _.each(batch, function (item) {
                        item.reject(reason);
                    });
                }
            }

            /**]
             * A batch item, the request, the subresult on batch success and the deferred object managing the promise
             * returned to the http caller
             * @param request
             * @constructor
             */
            function BatchItem(config) {
                var config = config;
                var deferred = $q.defer();
                var item = {
                    promise: deferred.promise,
                    request: {
                        url: config.url,
                        method: config.method,
                        data: config.data,
                    },
                    resolve: resolve,
                    reject: reject,
                };
                return item;

                /**
                 * Resolve this item, given its result instance in the batch result
                 *
                 * @param result
                 */
                function resolve(result) {
                    if (!angular.isDefined(result)) {
                        reject("Missing result");
                        return;
                    }
                    if (!('status' in result)) {
                        reject("Missing result status");
                        return;
                    }
                    if (!isSuccess(result.status)) {
                        reject(response(result));
                        return;
                    }
                    deferred.resolve(response(result));
                }

                /**
                 * Reject this item
                 *
                 * @param reason
                 */
                function reject(reason) {
                    deferred.reject(reason);
                }

                /**
                 * Construct a response-like object from the data returned by the batch response sub-item
                 */
                function response(result) {
                    return {
                        config: config,
                        status: result.status,
                        data: result.result,
                        headers: angular.noop,
                        statusText: 'unimplemented',
                    }
                }
            }

            /**
             * Determine if http status represents a successful request
             * @param status
             * @returns {boolean}
             */
            function isSuccess(status) {
                return 200 <= status && status < 300;
            }
        }])
})();