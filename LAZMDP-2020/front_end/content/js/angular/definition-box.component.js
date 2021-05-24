(function () {
    "use strict";

    angular.module("crossword")
        .component("definitionBox", {
            templateUrl: "content/js/angular/definition-box.html",
            controller: "definitionBox"
        })
        .controller("definitionBox", ['orchestration', 'tutorial', 'STEPNUM',
    function DefinitionBoxController(orchestration, tutorial, STEPNUM) {
        var ctrl = this;

        ctrl.DEFINITIONBOX = STEPNUM.DEFINITIONBOX;

        ctrl.displayHighlightedDefinition = function() {
            return orchestration.defBox_getActiveDef();
        }

        ctrl.upShellButton = function() {
            orchestration.onDefBoxUp_setActiveWord();
        }

        ctrl.downShellButton = function() {
            orchestration.onDefBoxDown_setActiveWord();
        }

        ctrl.isStepNum = function(num) { 
            return tutorial.isTutorial() && tutorial.getStepNum() == num;
        }

    }]);
})();