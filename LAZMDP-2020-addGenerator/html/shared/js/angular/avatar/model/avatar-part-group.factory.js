(function() {
    'use strict';

    angular.module('shared.avatar')

    .factory('AvatarPartGroup', ['modelUtils', '_', 'AvatarPartPosition', 'AvatarPartCategory',
        function(modelUtils, _, AvatarPartPosition, AvatarPartCategory)
    {
        function AvatarPartGroup(data, getCategoryByName, getPositionByName) {
            var self = this;

            modelUtils.defineReadonly(this, {
                id: data.id,
                category: getCategoryByName(data.category),
                useSkinColor: data.skin_color_applicable,
                useEyeColor: data.eye_color_applicable,
                parts: _.map(data.parts, createPartData)
            });

            function createPartData(data) {
                var partData = {};

                modelUtils.definePassthrough(partData, self, ['useSkinColor', 'useEyeColor']);
                modelUtils.defineReadonly(partData, {
                    position: getPositionByName(data.position),
                    partName: data.image_name
                });

                return partData;
            }
        }

        AvatarPartGroup.createLookup = function(dataContext) {
            return dataContext.extractAndCache('AvatarPartGroup', extractAvatarPartGroupLookup);

            function extractAvatarPartGroupLookup(ctx, data) {
                var getCategoryByName = AvatarPartCategory.createLookup(ctx);
                var getPositionByName = AvatarPartPosition.createLookup(ctx);

                var items = _.chain(data.part_groups)
                    .map(function(data) { return new AvatarPartGroup(data, getCategoryByName, getPositionByName) })
                    .indexBy('id')
                    .value();

                return function getPartGroupById(id) {
                    return items[id];
                }
            }
        };

        return AvatarPartGroup;
    }]);
})();

