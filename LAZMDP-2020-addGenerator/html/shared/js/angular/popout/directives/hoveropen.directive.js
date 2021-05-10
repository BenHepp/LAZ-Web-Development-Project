var app = angular.module('shared');

app.directive('hoverOpen', hoverOpen);

function hoverOpen() {
    return {
        restrict: 'A',
        require: ['^?popoutTarget'],
        link: function(scope, element, attrs, controllers) {
            if(controllers[0]) {
              controllers[0].hoverOpenActive = true;
            }
        }
    }
}