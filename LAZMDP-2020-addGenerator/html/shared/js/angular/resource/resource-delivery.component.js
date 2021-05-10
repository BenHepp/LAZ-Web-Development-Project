(function(){
    'use strict';
    angular.module('resource')
        .component('resourceDelivery', {
            templateUrl: '/shared/js/angular/resource/resource-delivery.template.html',
            bindings: {
                delivery: '<'
            }
        })
})();
