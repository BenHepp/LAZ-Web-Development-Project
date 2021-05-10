(function() {
    'use strict';

    angular.module('shared.avatar')

        .component('avatarViewer', {
            templateUrl: '/shared/js/angular/avatar/avatar-viewer.html',
            controller: 'AvatarViewerController',
            bindings: {
                avatar: '<',
                maxWidth: '<',
                maxHeight: '<'
            }
        })

        .controller('AvatarViewerController', ['_', function(_) {
            var ctrl = this;

            ctrl.$onChanges = function(changes) {
                var avatar = getChange(changes, 'avatar');
                var width = getChange(changes, 'maxWidth');
                var height = getChange(changes, 'maxHeight');

                updateAvatarDisplay(avatar, width, height);
            };

            function updateAvatarDisplay(avatar, width, height) {
                ctrl.parts = [];

                if(!avatar) return;

                var scale = getScale(avatar, width, height);

                _.forEach(avatar.parts, function(part) {
                    if(!part.position || !part.imageUrl) return;

                    ctrl.parts.push({
                        category: part.position.name,
                        imageUrl: part.imageUrl,
                        style: {
                            left: scale(part.position.x) + 'px',
                            top: scale(part.position.y) + 'px',
                            'z-index': part.position.z, //TODO add a base z index?
                            width: scale(part.position.width),
                            height: scale(part.position.height)
                        }
                    });
                });
            }

            function getChange(changes, field) {
                return changes[field] ? changes[field].currentValue : ctrl[field];
            }

            function getScale(avatar, maxWidth, maxHeight) {
                var scaleX = angular.isNumber(maxWidth) && maxWidth < avatar.width ? maxWidth / avatar.width : 1;
                var scaleY = angular.isNumber(maxHeight) && maxHeight < avatar.height ? maxHeight / avatar.height : 1;

                var scale = Math.min(scaleX, scaleY);

                return function(value) { return Math.floor(scale * value) }
            }
        }])
})();