(function() {
    'use strict';

    angular.module('shared.avatar')

    .factory('ModelDataContext', ['_', function(_) {
        function ModelDataContext(jsonData) {
            this._rawData = jsonData|| '';
            this._resultsCache = {};
        }

        ModelDataContext.prototype = {
            extract: function(extractorFn) {
                return extractorFn(this, this._rawData);
            },

            extractAndCache: function(key, extractorFn) {
                var result = this._resultsCache[key];
                if(!result) {
                    result = this.extract(extractorFn);
                    this._resultsCache[key] = result;
                }

                return result;
            },

            createSubContextForUpdate: function(updateJsonData) {
                var subContext = new ModelDataContext(updateJsonData);
                subContext._resultsCache = _.clone(this._resultsCache);

                return subContext;
            }
        };

        return ModelDataContext;
    }])
})();
