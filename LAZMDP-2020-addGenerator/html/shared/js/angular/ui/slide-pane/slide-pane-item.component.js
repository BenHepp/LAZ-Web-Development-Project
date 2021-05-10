(function() {
    'use strict';

    angular.module('shared')

        .component('slidePaneItem', {
            templateUrl: '/shared/js/angular/ui/slide-pane/slide-pane-item.html',
            transclude: true,
            controller: 'SlidePaneItemController',
            require: {
                'slidePane': '^slidePane'
            }
        })

        .controller('SlidePaneItemController', [function() {
            this.slidePane
        }])
})();
