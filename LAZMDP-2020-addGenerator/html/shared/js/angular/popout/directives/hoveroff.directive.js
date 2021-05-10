var app = angular.module('shared');

app.directive('hoverOff', hoverOff);

function hoverOff() {
    return {
        restrict: 'A',
        require: ['^?popoutContent', '^?popoutTarget'],
        link: function(scope, element, attrs, controllers) {
            if(controllers[0]) {
              controllers[0].hoverOffActive = true;
            }
            if(controllers[1]) {
              controllers[1].hoverOffActive = true;
            }
        }
    }
}