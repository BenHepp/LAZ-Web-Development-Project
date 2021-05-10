(function() {
    'use strict';

    angular.module('shared.avatar')

        .provider('avatarPortraitService', function() {
            var avatarInfo, avatarQueryUrl;

            return {
                setAvatarInfo: function(data) { avatarInfo = data; },
                setAvatarQueryUrl: function(url) { avatarQueryUrl = url; },
                $get: ['$q', '$http', '_', 'ModelDataContext', 'Avatar', factoryFn]
            };

            function factoryFn($q, $http, _, ModelDataContext, Avatar) {
                var avatar;
                var listeners = [];

                return {
                    getAvatarForPortrait: getAvatar,
                    onPortraitUpdate: onAvatarUpdate,
                    setAvatarForPortrait: setAvatar
                };

                function getAvatar() {
                    if( angular.isDefined(avatar) ) {
                        return $q.resolve(avatar);
                    } else if( angular.isDefined(avatarInfo) ) {
                        return $q.resolve( translateAvatar(avatarInfo) )
                    } else if( angular.isDefined(avatarQueryUrl) ) {
                        return $http.get(avatarQueryUrl)
                            .then(function(response) {
                                return translateAvatar(response.data);
                            });
                    } else {
                        $q.reject( new Error('Cannot get current avatar portrait. Query url not defined!') );
                    }
                }

                function onAvatarUpdate(listener) {
                    if( !angular.isFunction(listener) ) throw new Error('listener must be a function!');

                    if( !_.contains(listeners, listener) ) {
                        listeners.push(listener);
                    }

                    return function removeListener() {
                        listeners = _.without(listeners, listener);
                    }
                }

                function setAvatar(newAvatar) {
                    avatar = newAvatar;
                    _.forEach(listeners, function(listener) {
                        listener(newAvatar);
                    });
                }

                function translateAvatar(data) {
                    var ctx = new ModelDataContext(data);
                    return Avatar.fromData(ctx);
                }
            }
        });
})();