(function () {
    "use strict";
    
    angular.module("crossword")
        .service('tutorial', ['tutorialWordCollection', 'tutorialGrid', 'STEPNUM',
                 function(tutorialWordCollection, tutorialGrid, STEPNUM) {
            var self = this;
            self.tutorialCollection = new tutorialWordCollection();
            self.tutorialCollection = self.tutorialCollection.tutorialWordCollection;
            self.tutorialGrid = new tutorialGrid();
            self.tutorialGrid = self.tutorialGrid.tutorialGrid;
            var audio;
            var currentSoundPlaying = false;
            var tutorialDEFINITIONBOXAudio = "shared/sounds/tutorialDEFINITIONBOX.mp3";
            var tutorialENTERFIRSTWORDAudio = "shared/sounds/tutorialENTERFIRSTWORD.mp3";
            var tutorialSWITCHVERTICALAudio = "shared/sounds/tutorialSWITCHVERTICAL.mp3";
            var tutorialREMEMBERCLICKAudio = "shared/sounds/tutorialREMEMBERCLICK.mp3";
            var tutorialTUTORIALBUTTONAudio = "shared/sounds/tutorialTUTORIALBUTTON.mp3";
            var mermaidTutorialAudio = "shared/sounds/mermaidTutorial.mp3";
            
            

            // Copy tutorialCollection
            /*   0 1 2 3 4
               0 b l a c k
               1 e     o
               2 e   b i g
               3       n
               4
            */


            self.isTutorialMode = true;
            self.tutorialNum = STEPNUM.TUTORIALMODAL;

            self.isTutorial = function () {
                return self.isTutorialMode;
            }
            
            self.getStepNum = function() {
                return self.tutorialNum;
            }
        
            self.incrementStepNum = function() {
                self.tutorialNum++;
                if (self.tutorialNum > STEPNUM.TUTORIALBUTTON) {
                    self.turnOffTutorial();
                }
                else{
                    self.playAudio();
                }
            }

            self.decrementStepNum = function() {
                self.tutorialNum--;
                self.playAudio();
            }

            self.resetStepNum = function(){
                self.tutorialNum = STEPNUM.TUTORIALMODAL;
            }

            self.playAudio = function() {
                if(currentSoundPlaying){
                    audio.pause();
                    currentSoundPlaying = false;
                }
                if (self.getStepNum() == STEPNUM.TUTORIALMODAL){
                    audio = new Audio(mermaidTutorialAudio);
                }
                else if (self.getStepNum() == STEPNUM.DEFINITIONBOX){
                    audio = new Audio(tutorialDEFINITIONBOXAudio);
                }
                else if (self.getStepNum() == STEPNUM.ENTERFIRSTWORD){
                    audio = new Audio(tutorialENTERFIRSTWORDAudio);
                }
                else if (self.getStepNum() == STEPNUM.SWITCHVERTICAL){
                    audio = new Audio(tutorialSWITCHVERTICALAudio);
                }
                else if (self.getStepNum() == STEPNUM.REMEMBERCLICK) {
                    audio = new Audio(tutorialREMEMBERCLICKAudio);
                }
                else if (self.getStepNum() == STEPNUM.TUTORIALBUTTON) {
                    audio = new Audio(tutorialTUTORIALBUTTONAudio);
                }
                currentSoundPlaying = true;
                audio.play();
                
            }

            self.turnOffTutorial = function() {
                self.isTutorialMode = false;
            }

            self.setTutorialMode = function(isTutorialMode) {
                self.isTutorialMode = isTutorialMode;
            }

            self.turnOnTutorial = function() {
                self.setTutorialMode(true);
                //self.isTutorialMode = true;
                //toolbar.toggleTutorialModal(); 
                self.tutorialNum = STEPNUM.DEFINITIONBOX;
                self.playAudio();
            }

            self.automateStepThree = function(x, y) {
                if (x == 0 && y == 3 && self.tutorialNum == STEPNUM.SWITCHVERTICAL) {
                    self.incrementStepNum();
                    return true;
                }
                else {
                    return false;
                }
            }

            self.isTutorialCellHighlighted = function(x, y) {
                let showCell = false;
                if(!self.isTutorial()){
                    return showCell;
                }
                if (self.getStepNum() == STEPNUM.ENTERFIRSTWORD) {
                    if (x == 0 && y != 0){
                        showCell = true;
                    }
                }
                else if (self.getStepNum() == STEPNUM.SWITCHVERTICAL) {
                }
                else if (self.getStepNum() == STEPNUM.REMEMBERCLICK) {
                    if(x != 0 && y == 3){
                        showCell = true;
                    }
                }
                return showCell;
            }

            self.isTutorialCellWithHighlightedShadow = function(x,y) {
                let showCell = false;
                if(!self.isTutorial()){
                    return showCell;
                }

                if (self.getStepNum() == STEPNUM.ENTERFIRSTWORD) {
                    if (x == 0 && y == 0){
                        showCell = true;
                    }
                } // Highlight only 'r' at the start of 'rain' to prompt change word direction
                else if (self.getStepNum() == STEPNUM.SWITCHVERTICAL) {
                    if (x == 0 && y == 3) {
                        showCell = true;
                    }
                } // Highlight 'rain' to prompt user to finish the word
                else if (self.getStepNum() == STEPNUM.REMEMBERCLICK) {
                    if (x == 0 && y == 3) {
                        showCell = true;
                    }
                }
                return showCell;
            }

            self.getInstructions = function() {
                if(self.isTutorial()){
                    if (self.getStepNum() == STEPNUM.ENTERFIRSTWORD){
                        return 'Type your answer here, try "black"';
                    }
                    else if (self.getStepNum() == STEPNUM.SWITCHVERTICAL){
                        return "Good job! Now try click on this box to change the word direction";
                    }
                    else if (self.getStepNum() == STEPNUM.REMEMBERCLICK) {
                        return "Good! Remember one click changes the word to flat or tall";
                    }
                    else if (self.getStepNum() == STEPNUM.TUTORIALBUTTON) {
                        return "Nice! Now you're ready to start your journey. If you need help, click here.";
                    }
                }
            }


        }]);
})();