(function() {
    'use strict';

    angular.module('shared.avatar')

    .factory('AvatarPartCategory', ['modelUtils', '_', function(modelUtils, _) {
        function AvatarPartCategory(data) {
            modelUtils.defineReadonly(this, data);
        }

        AvatarPartCategory.createLookup = function(dataContext) {
            return dataContext.extractAndCache('AvatarPartCategory', extractCategoriesLookup);

            function extractCategoriesLookup(ctx, data) {
                var categories = _.chain(data.part_categories)
                    .map(function(data) { return new AvatarPartCategory(data) })
                    .indexBy('name')
                    .value();

                return function getCategoryByName(name) {
                    return categories[name];
                }
            }
        };

        return AvatarPartCategory;
    }]);
})();
