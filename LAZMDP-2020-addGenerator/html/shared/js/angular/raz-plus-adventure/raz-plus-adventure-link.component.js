(function() {
'use strict';
angular.module('shared')
    .component('razPlusAdventureLink', {
        templateUrl: '/shared/js/angular/raz-plus-adventure/raz-plus-adventure-link.html',
        controller: 'RazPlusAdventureLinkController',
        bindings: {
            adventureType: '@',
            href: '@',
            linkType: '@?'
        }
    })
    .controller('RazPlusAdventureLinkController', ['razPlusAdventureService', '$window',
        function(razPlusAdventureService, $window) {
            var ctrl = this;

            ctrl.AdventureType = {
                TRIAL: "trial",
                PAID: "paid"
            };

            ctrl.LinkType = {
                HEADER: "header",
                NAV_LINK: "nav",

                linkTypeExists : function(linkType){
                    return Object.keys(this).indexOf(ctrl.linkType) !== -1
                }
            };

            ctrl.$onInit = function(){
                ctrl.linkType = ctrl.LinkType.linkTypeExists(ctrl.linkType) ? ctrl.linkType : ctrl.LinkType.HEADER;
                ctrl.displayTitle = ctrl.adventureType === ctrl.AdventureType.TRIAL ? "Trial Adventure" : "Raz-Plus Adventure"
            };

            ctrl.onClick = function(){
                razPlusAdventureService.recordAdventureLinkClick()
                    .catch(function(err){
                        console.error(err);
                    })
                    .then(function(){
                        $window.location.href = ctrl.href;
                    });
            }
    }]);
})();
