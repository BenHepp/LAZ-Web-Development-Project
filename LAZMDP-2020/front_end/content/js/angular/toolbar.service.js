(function () {
    "use strict";
    
    angular.module("crossword")
        .service('toolbar', ['tutorial', function(tutorial) {
            var self = this;
            self.showTutorialModal = true;
            self.toggleTutorialModal = function () {
                self.showTutorialModal = !self.showTutorialModal;
                if(self.showTutorialModal){
                    self.playTutorialAudio();
                }
            }
            
            self.playTutorialAudio = function() {
                tutorial.setTutorialMode(true);
                    tutorial.resetStepNum();
                    tutorial.playAudio();
            }
           
        }]);
})();