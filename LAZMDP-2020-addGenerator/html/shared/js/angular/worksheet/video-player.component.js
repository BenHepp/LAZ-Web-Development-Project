(function () {
    'use strict';

    angular.module('shared.worksheet')

        .component('videoPlayer', {
            templateUrl: '/shared/js/angular/worksheet/video-player.html',
            controller: 'VideoPlayerController',
            bindings: {
                src: '<'
            }
        })
        .controller('VideoPlayerController', [function () {
            var ctrl = this;

        }]);
})();


