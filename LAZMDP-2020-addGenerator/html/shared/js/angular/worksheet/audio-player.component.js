(function () {
    'use strict';

    angular.module('shared.worksheet')

        .component('audioPlayer', {
            templateUrl: '/shared/js/angular/worksheet/audio-player.html',
            controller: 'AudioPlayerController',
            bindings: {
                src: '<'
            }
        })
        .controller('AudioPlayerController', ['audioPlayerRegistration', '$scope',
            function (audioPlayerRegistration, $scope) {
                var ctrl = this;

                ctrl.$onInit = function () {
                    ctrl.isSoundPlaying = false;
                    ctrl.audio = new Audio(ctrl.src);
                };

                ctrl.playPauseAudio = function () {

                    if (ctrl.audio.paused) {
                        // Ensure only one audio player plays at a time
                        var lastPlayedAudioCtrl = audioPlayerRegistration.getLastPlayedAudioCtrl();
                        if (lastPlayedAudioCtrl) {
                            lastPlayedAudioCtrl.audio.pause();
                            lastPlayedAudioCtrl.isSoundPlaying = false;
                        }
                        ctrl.audio.play();
                        ctrl.isSoundPlaying = true;
                        audioPlayerRegistration.setLastPlayedAudioCtrl(ctrl);
                    } else {
                        ctrl.audio.pause();
                        ctrl.isSoundPlaying = false;
                    }

                    ctrl.audio.addEventListener("ended", function () {
                        ctrl.isSoundPlaying = false;
                        $scope.$apply();
                    });
                };

                ctrl.$onDestroy = function () {
                    ctrl.isSoundPlaying = false;
                    ctrl.audio.pause();
                }
            }]);
})();
