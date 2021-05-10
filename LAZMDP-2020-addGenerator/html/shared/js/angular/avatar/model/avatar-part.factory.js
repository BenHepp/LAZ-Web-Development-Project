(function() {
    'use strict';

    angular.module('shared.avatar')

    .factory('AvatarPart', ['modelUtils', function(modelUtils) {
        function AvatarPart(partData, imageUrl) {
            modelUtils.definePassthrough(this, partData, ['partName', 'position', 'useEyeColor', 'useSkinColor']);
            modelUtils.defineReadonly(this, { imageUrl: imageUrl });
        }

        return AvatarPart;
    }]);
})();
