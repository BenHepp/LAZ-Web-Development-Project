var app = angular.module('shared');

app.directive('clickOutside', clickOutside);

function clickOutside($document) {
    return {
        restrict: 'A',
        require: ['^popout'],
        link: function (scope, el, attr, controllers) {
            controllers[0].registerClickOutsideListener = function() {
                $document.on('mousedown', function (e) {
                    if (el.find(e.target).length === 0 && controllers[0].isOpen) {
                        controllers[0].close();
                        $document.off("mousedown");
                    }
                });
            }
        }
    }
}