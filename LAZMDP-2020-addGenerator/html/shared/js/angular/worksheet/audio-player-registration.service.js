(function () {
    'use strict';

    angular.module('shared.worksheet')
        .service('audioPlayerRegistration', [audioPlayerRegistrationService]);

    // Remember the last played audio file so we can ensure only one audio file plays at a time
    function audioPlayerRegistrationService() {
        var self = this;
        self.lastPlayedAudioCtrl = null;

        self.getLastPlayedAudioCtrl = function () {
            return self.lastPlayedAudioCtrl;
        };

        self.setLastPlayedAudioCtrl = function (lastPlayedAudioCtrl) {
            self.lastPlayedAudioCtrl = lastPlayedAudioCtrl;
        }
    }

})();
