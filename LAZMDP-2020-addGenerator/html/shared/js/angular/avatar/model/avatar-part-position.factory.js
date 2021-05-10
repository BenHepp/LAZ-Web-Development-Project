(function() {
    'use strict';

    angular.module('shared.avatar')

    .factory('AvatarPartPosition', ['modelUtils', '_', function(modelUtils, _) {
        function AvatarPartPosition(data) {
            modelUtils.defineReadonly(this, {
                name: data.name,
                width: data.reference_width,
                height: data.reference_height,
                x: data.x_offset,
                y: data.y_offset,
                z: data.z_index
            });
        }

        AvatarPartPosition.createLookup = function(dataContext) {
            return dataContext.extractAndCache('AvatarPartPosition', extractPartPositionLookup);

            function extractPartPositionLookup(ctx, data) {
                var positionsData = data.part_positions || [];

                var positions = _.chain(positionsData)
                    .pluck('z_index')
                    .reverse()
                    .map(function(newZ, index) {
                        var positionData = _.clone(positionsData[index]);
                        positionData.z_index = newZ;

                        return new AvatarPartPosition(positionData)
                    })
                    .indexBy('name')
                    .value();

                return function getPositionByName(name) {
                    return positions[name];
                };
            }
        };

        return AvatarPartPosition;
    }]);
})();
