(function () {
    "use strict";

    angular.module('shared')

        .component('skipLink', {
            templateUrl: '/shared/js/angular/ui/skip-link.html',
            controller: 'SkipLinkCtrl',
        })
        .controller('SkipLinkCtrl', ['skipToProps', function SkipLinkCtrl(skipToProps) {
           var ctrl = this;
           ctrl.skipToProps = skipToProps;

           ctrl.handleSkip = function(selector){
               $j(selector).attr('tabindex', -1).on('blur focusout', function () {
                   $j(this).removeAttr('tabindex');
               }).focus();
           };
           ctrl.hasTarget = function(selector) {
              if (angular.element(selector).length) {
                   return true;
              }
           }
            }]);
})()
