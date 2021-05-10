(function(){
    'use strict';
    angular.module('resource')
        .component('resourceGrid', {
            templateUrl: '/shared/js/angular/resource/resource-grid.template.html',
            bindings: {
                resources: '<'
            }
        })
})();
