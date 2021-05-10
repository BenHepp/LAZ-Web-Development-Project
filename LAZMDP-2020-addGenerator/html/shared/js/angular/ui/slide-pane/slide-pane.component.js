(function() {
    'use strict';

    angular.module('shared')

        .component('slidePane', {
            templateUrl: '/shared/js/angular/ui/slide-pane/slide-pane.html',
            transclude: true,
            controller: 'SlidePaneController',
            bindings: { scrollModel: '<' }
        })

        .controller('SlidePaneController', [function() {
            var ctrl = this;

            ctrl.getArrowClasses = function() {
                return {
                    'no-left-arrow': ctrl.scrollModel && !ctrl.scrollModel.canScrollLeft,
                    'no-right-arrow': ctrl.scrollModel && !ctrl.scrollModel.canScrollRight
                }
            };

            ctrl.scrollEvent = function(type, direction) {
                var event = { type: type, direction: direction };
                this.scrollModel.onScrollChange(event);
            };
        }])
})();
