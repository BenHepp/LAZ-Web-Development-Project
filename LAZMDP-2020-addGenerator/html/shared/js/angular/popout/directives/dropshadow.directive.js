var app = angular.module('shared');

app.directive('dropShadow', dropShadow);

function dropShadow() {
    return {
        restrict: 'A',
        require: '^popoutContent',
        link: function(scope, element, attrs, popoverContentCtrl) {
            popoverContentCtrl.dropShadow = true;
        }
    }
}