(function () {
    "use strict";

    angular.module("crossword")
        .component("star", {
            templateUrl: "content/js/angular/star.html",
            controller: "star",
            bindings: {
                size: '@',
                starIndex: '@'
            }
        })
        .controller("star", ['tutorial',
            function StarController(tutorial) {
                var ctrl = this;
                this.starSize;
                this.starId;
                ctrl.$onInit = function() {
                    this.starSize=this.size;
                    this.starId=this.starIndex;
                }
                ctrl.getStarSizeClass = function () {
                    return "star-" + this.starSize;
                }
                ctrl.getGlowSizeClass = function () {
                    return "glow-" + this.starSize;
                }
                ctrl.isTutorial = function () {
                    return tutorial.isTutorial();
                }
            }]);
})();