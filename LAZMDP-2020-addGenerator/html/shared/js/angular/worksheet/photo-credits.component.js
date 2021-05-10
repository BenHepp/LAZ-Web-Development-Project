(function () {
    "use strict";

    angular.module('shared.worksheet')

        .component('photoCredits', {
            templateUrl: '/shared/js/angular/worksheet/photo-credits.html',
            controller: 'PhotoCreditsController',
            bindings: {
                credits: '<'
            }
        })
        .controller('PhotoCreditsController', [
            function PhotoCreditsController() {
                var ctrl = this;

                ctrl.openPopover = function () {
                    angular.element('body').css({'overflow': 'hidden'});
                };

                ctrl.setPopover = function (popoverCtrl) {
                    ctrl.popoverCtrl = popoverCtrl;
                };

                ctrl.clickClosePopover = function ($event) {
                    if (!angular.element($event.target).hasClass('js-content')) {
                       ctrl.closePopover();
                    }
                };

                ctrl.closePopover = function () {
                    if (ctrl.popoverCtrl) {
                        ctrl.popoverCtrl.close();
                        angular.element('body').css({'overflow': 'auto'});
                    }
                };
            }
        ]);
})();
