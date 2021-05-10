(function() {
    'use strict';

    angular.module('shared.avatar')

        .component('avatarPortrait', {
            templateUrl: '/shared/js/angular/avatar/avatar-portrait.html',
            controller: 'AvatarPortraitController',
            bindings: {
                maxWidth: '<',
                maxHeight: '<'
            }
        })

        .controller('AvatarPortraitController', ['$injector', 'avatarPortraitService', function($injector, avatarPortraitService) {
            var ctrl = this;
            var removeListener;

            avatarPortraitService.getAvatarForPortrait()
                .then(function(avatar) {
                    onPortraitUpdate(avatar);
                    removeListener = avatarPortraitService.onPortraitUpdate(onPortraitUpdate);
                });

            ctrl.$onDestroy = function() {
                if(removeListener) removeListener();
            };

            ctrl.isAvatarIncentiveEnabled = function () {
                if ($injector.has('intermediateData')) {
                    var intermediateData = $injector.get('intermediateData');
                    return intermediateData.incentives.avatar;
                }
                return true;
            };

            ctrl.defaultAvatarImg = function () {
                if ($injector.has('cdnDomain')) {
                    var cdnDomain = $injector.get('cdnDomain');
                    return cdnDomain + '/avatar/default-avatar-version-2.png';
                }
            };

            function onPortraitUpdate(avatar) {
                ctrl.avatar = avatar;
            }
        }]);
})();