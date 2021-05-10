(function() {
   'use strict';

    angular.module('shared.avatar')

        .factory('AvatarImageTemplates', ['modelUtils', '$filter', 'translateTemplate', function(modelUtils, $filter, translateTemplate) {
            function AvatarImageTemplates(templates) {
                modelUtils.defineReadonly(this, templates)
            }

            AvatarImageTemplates.fromData = function(ctx) {
                return ctx.extractAndCache('AvatarImageTemplates', function(ctx, data) {
                    var camelize = $filter('camelcase');

                    var partImageTemplates = _.reduce(data.part_image_templates, function(carry, template, key) {
                        carry[ camelize(key) ] = translateTemplate(template);
                        return carry
                    }, {});

                    return new AvatarImageTemplates(partImageTemplates);
                });
            };

            return AvatarImageTemplates;
        }])
})();