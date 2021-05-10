(function() {
    'use strict';

    angular.module('shared')

        .factory('uploadFile', ['$document', '$q', '$timeout', '_', function($document, $q, $timeout, _) {
            return function uploadFile(config) {
                if( !angular.isFunction($document.fileupload) ) {
                    return $q.reject(new Error('"uploadFile" service requires jQuery fileupload plugin'));
                }

                if(!config.url) {
                    return $q.reject(new Error('"url" required for file upload'));
                }

                //TODO make the default settings updatable from a provider
                config = _.defaults(config, {
                    name: 'file',
                    options: {}
                });

                var input = angular.element('<input type="file">');
                input.css({ display: 'none' });
                input.attr('name', config.name);
                input.data('url', config.url);

                $document.find('body').append(input);

                var startDeferred = $q.defer();
                var completeDeferred = $q.defer();

                //TODO coalesce with the callbacks from the config?
                input.fileupload(_.extend({}, config.options, {
                    url: config.url,
                    start: function() {
                        startDeferred.resolve();
                    },
                    done: function(e, data) {
                        completeDeferred.resolve(data);
                    },
                    fail: function(e, data) {
                        completeDeferred.reject(data);
                    },
                    always: function() {
                        $timeout(function() { input.remove() }, 0);
                    }
                })).trigger('click');

                return {
                    started: startDeferred.promise,
                    completed: completeDeferred.promise
                }
            }
        }])
})();