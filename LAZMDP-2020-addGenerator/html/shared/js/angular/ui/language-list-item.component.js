(function () {
    "use strict";

    angular.module('shared')

        .component('languageListItem', {
            bindings: {
                name: '@',
                url: '@'
            },
            controller: 'LanguageListItem',
            templateUrl: '/shared/js/angular/ui/language-list-item.html',
            transclude: true
        })
        .controller('LanguageListItem',['$element',
            function LanguageListItemCtrl($element) {
                var ctrl = this;
                ctrl.$postLink = function () {
                    $element.addClass('languageList_item');
                };
            }]);










})();


