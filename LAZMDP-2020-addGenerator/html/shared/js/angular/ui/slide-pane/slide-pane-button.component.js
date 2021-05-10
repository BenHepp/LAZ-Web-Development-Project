(function() {
    'use strict';

    angular.module('shared')

        .component('slidePaneButton', {
            templateUrl: '/shared/js/angular/ui/slide-pane/slide-pane-button.html',
            controller: 'SlidePaneButtonController',
            bindings: {
                src: '@',
                onChange: '&'
            },
            transclude: true
        })

        .controller('SlidePaneButtonController', ['$element', function($element) {
            var ctrl = this;
            var pressed = false;

            ctrl.$postLink = function() {
                $element.on('touchstart', ctrl.startTouch);
                $element.on('touchend', ctrl.stopTouch);
            };
            ctrl.$onDestroy = function() {
                $element.off('touchstart');
                $element.off('touchend');
            };

            ctrl.startPress = function() {
                if(pressed) return;

                pressed = true;
                ctrl.onChange({ type: 'start' });
            };

            ctrl.stopPress = function() {
                if(!pressed) return;

                pressed = false;
                ctrl.onChange({ type: 'stop' });
            };

            ctrl.startTouch = function(event) {
                event.preventDefault();
                ctrl.startPress();
            };

            ctrl.stopTouch = function(event) {
                event.preventDefault();
                ctrl.stopPress();
            }
        }]);
})();
