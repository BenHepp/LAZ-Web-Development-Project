(function () {
    "use strict";

    angular.module("crossword")
        .component("characters", {
            templateUrl: "content/js/angular/characters.html",
            controller: "characters"
        })
        .controller("characters", ['orchestration',
    function CharactersController(orchestration) {
        var ctrl = this;
        
        ctrl.getProgress = function() {
            return Math.round(orchestration.getProgress());
        }
        ctrl.mermaidSpeech = function() {
            return orchestration.mermaidSpeech();
        }
    }]);

})();