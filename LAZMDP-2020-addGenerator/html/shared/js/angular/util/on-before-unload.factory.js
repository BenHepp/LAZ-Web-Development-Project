(function() {
    'use strict';

    angular
        .module('shared')
        .factory('onBeforeUnload', onBeforeUnloadFactory);

    onBeforeUnloadFactory.$inject = ['$window', '_'];

    function onBeforeUnloadFactory($window, _) {
        return function onBeforeUnload(handler) {
            var actualHandler = _.once(handler);
            $window.addEventListener('beforeunload', actualHandler);

            return function cancel() {
                $window.removeEventListener('beforeunload', actualHandler);
            }
        }
    }
})();
