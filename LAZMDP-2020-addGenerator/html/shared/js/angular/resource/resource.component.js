(function(){
    'use strict';
    angular.module('resource')
        .component('resource', {
            templateUrl: '/shared/js/angular/resource/resource.template.html',
            bindings: {
                resource: '<'
            }
        })
})();
