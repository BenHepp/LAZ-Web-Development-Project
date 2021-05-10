(function() {
    'use strict';

    angular.module('shared.avatar')

    .factory('Avatar', ['_', 'modelUtils', 'AvatarImageTemplates', 'AvatarPartGroup', 'AvatarPart',
        function(_, modelUtils, AvatarImageTemplates, AvatarPartGroup, AvatarPart)
    {
        function Avatar(startingParts, props, partImageTemplates) {
            modelUtils.defineReadonly(this, {
                parts: startingParts,
                skinColor: props.skinColor || 'skin_color01',
                eyeColor: props.eyeColor || 'eye_color01',
                width: props.width || 428,
                height: props.height || 564,
                imageTemplates: partImageTemplates
            });
        }

        Avatar.prototype = {
            withItem: function(item) {
                var skinColor = item.applySkinColor || this.skinColor;
                var eyeColor = item.applyEyeColor || this.eyeColor;

                var oldParts = this.parts;
                if(skinColor != this.skinColor || eyeColor != this.eyeColor) {
                    oldParts = createTemplatedParts(oldParts, skinColor, eyeColor, this.imageTemplates);
                }

                var additionalParts = createTemplatedParts(item.parts, skinColor, eyeColor, this.imageTemplates);
                var newParts = _.extend({}, oldParts, additionalParts);
                var newProps = {
                    skinColor: skinColor,
                    eyeColor: eyeColor,
                    width: this.width,
                    height: this.height
                };

                return new Avatar(newParts, newProps, this.imageTemplates);
            },
            withoutItem: function(item) {
                if( !item.removable || !this.contains(item) ) return this;

                var positionsToDelete = _.map(item.parts, function(part) { return part.position.name });
                var newParts = _.omit(this.parts, positionsToDelete);
                var newProps = _.pick(this, 'skinColor', 'eyeColor', 'width', 'height');

                return new Avatar(newParts, newProps, this.imageTemplates);
            },
            contains: function(item) {
                if( this.itemChangesTemplating(item) ) return false;

                var self = this;
                return _.every(item.parts, function(part) {
                    var existingPart = self.parts[part.position.name];
                    return existingPart && existingPart.partName == part.partName
                });
            },
            itemChangesTemplating: function(item) {
                return (item.applySkinColor && item.applySkinColor != this.skinColor) ||
                       (item.applyEyeColor && item.applyEyeColor != this.eyeColor)
            }
        };

        Avatar.fromData = function(dataContext) {
            return dataContext.extract(function(ctx, data) {
                var getPartGroupById = AvatarPartGroup.createLookup(ctx);
                var partGroups = _.map(data.in_use_part_group_ids, getPartGroupById);

                var partImageTemplates = AvatarImageTemplates.fromData(ctx);

                var props = {
                    skinColor: data.in_use_skin_color,
                    eyeColor: data.in_use_eye_color,
                    width: data.overall_reference_width,
                    height: data.overall_reference_height
                };

                var parts = getPartsFromPartGroups(partGroups, props.skinColor, props.eyeColor, partImageTemplates);

                return new Avatar(parts, props, partImageTemplates);
            });
        };

        return Avatar;

        function getPartsFromPartGroups(partGroups, skinColor, eyeColor, imageTemplates) {
            var parts = _.chain(partGroups)
                .pluck('parts')
                .flatten()
                .value();

            return createTemplatedParts(parts, skinColor, eyeColor, imageTemplates);
        }

        function createTemplatedParts(parts, skinColor, eyeColor, imageTemplates) {
            return _.chain(parts)
                .map( function(partData) { return new AvatarPart(partData, getPartImageUrl(partData)) } )
                .indexBy( function(avatarPart) { return avatarPart.position.name } )
                .value();

            function getPartImageUrl(avatarPart) {
                var template;

                if(avatarPart.useSkinColor) {
                    template = avatarPart.useEyeColor ? imageTemplates.withSkinColorAndEyeColor : imageTemplates.withSkinColor
                } else {
                    template = imageTemplates.withoutSkinColor;
                }

                if(avatarPart.partName) {
                    return template({
                        positionName: avatarPart.position.name,
                        partName: avatarPart.partName,
                        currentSkinColor: skinColor,
                        currentEyeColor: eyeColor
                    });
                } else {
                    return null;
                }
            }
        }
    }]);
})();

