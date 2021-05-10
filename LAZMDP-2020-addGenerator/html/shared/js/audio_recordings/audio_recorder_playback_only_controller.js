window.clg = window.clg || {};
window.clg.audio = window.clg.audio || {};
window.clg.audio.recorder = window.clg.audio.recorder || {};

(function (ns) {
    'use strict';

    ns.RecordingErrorHandler = function () {
        var displayError = function (errorCode) {
            $j('#recording-message'+' > #error-msg').empty();
            switch(errorCode) {
                case 'SERVER_CONNECTION_ERROR':
                    $j('#recording-message'+' > #error-msg').append('The recorder is not available.');
                    break;
                case 'RECORDING_UNAVAILABLE_ERROR':
                    $j('#recording-message'+' > #error-msg').append('The recording is not available.');
                    break;
                default:
                    $j('#recording-message'+' > #error-msg').append('The recorder is not available.');

            }
            $j('#playButton').webuiPopover('show');
        };

        var eventListener = function (topic) {
            if (
                (topic === audioRecorderEvents.SERVER_CONNECTION_ERROR) ||
                (topic === audioRecorderEvents.RECORDING_UNAVAILABLE_ERROR)
            ) {
                displayError(topic);
            }
        };

        (function () {
            audioRecorderEventBus.subscribe(audioRecorderEvents.SERVER_CONNECTION_ERROR, eventListener, 200);
            audioRecorderEventBus.subscribe(audioRecorderEvents.RECORDING_UNAVAILABLE_ERROR, eventListener, 200);
        }());
    };

    ns.RecordingController = function () {
        var initialize = function (recordingInfo) {
            var recordingData = JSON.parse(recordingInfo);
            audioRecording.initialize(recordingData.state, parseInt(recordingData.total_ms_recorded),
                recordingData.max_recording_seconds, recordingData.max_inactivity_seconds);

            var timer = new ns.Timer("timer");
            var playbackSlider = ns.PlaybackSlider("playbackSliderAxis", "playbackSliderHandle", "noselect");

            var playButton = new ns.PlayButton("playButton", "", "", "is-disabled", false);
            var pausePlayingButton = new ns.PausePlayingButton("pausePlayingButton", "", "", "is-disabled", true);

            var player = new ns.Player(recordingData.authorize_playback_url, recordingData.content_server_url);
        };

        return {
            initialize: initialize
        };
    };
}(window.clg.audio.recorder));