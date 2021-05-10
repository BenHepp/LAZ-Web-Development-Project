"use strict";

angular.module('shared')

    .directive('slider', function() {
        return {
            restrict: 'E',
            scope: {
                ngModel: '=',
                onChanged: '&',
                onSlide: '&'
            },
            replace: true,
            template: '<div></div>',
            require: 'ngModel',
            link: function (scope,element,attrs) {
                var settingInitVal = false;
                scope.$watch('ngModel', function(newVal, oldVal) {
                    if (newVal !== undefined){
                        settingInitVal = true;
                        element.slider("value", parseInt(newVal,10));
                        settingInitVal = false;
                    }
                });

                element.slider({
                    min: parseInt(attrs.min,10),
                    max: parseInt(attrs.max, 10),
                    value: scope.ngModel,
                    step: parseInt(attrs.step, 10)
                });

                element.bind( "slide", function( event, ui ) {
                    if ('onSlide' in attrs) {
                        scope.onSlide()(ui.value);
                    }
                    scope.ngModel = ui.value;
                    scope.$apply();
                });

                if ('onChanged' in attrs){
                    //(not executed during dragging the slider)
                    element.bind( "slidechange", function(event, ui) {
                        if (!settingInitVal) {
                            scope.onChanged()(ui.value);
                        }
                    });
                }
            }
        };
    })
