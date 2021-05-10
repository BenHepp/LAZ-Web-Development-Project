"use strict";

angular.module('shared')

    .directive('rangedSlider', function() {
        return {
            restrict: 'E',
            scope: {
                ngModel: '=',
                onChanged: '&',
                onSlide: '&',
                min: '<',
                max: '<',
                initMin: '<',
                initMax: '<',
                step: '<'
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
                    min: parseInt(scope.min,10),
                    max: parseInt(scope.max, 10),
                    value: scope.ngModel,
                    step: parseInt(scope.step, 10),
                    range: true,
                    values: [scope.initMin, scope.initMax]
                });

                element.bind("slide", function( event, ui ) {
                    if((ui.values[0]) >= ui.values[1]) {
                        return false;
                    }
                    if ('onSlide' in attrs) {
                        scope.onSlide({
                            leftValue: ui.values[0],
                            rightValue: ui.values[1]
                        });
                    }
                    scope.ngModel = ui.value;
                    scope.$apply();
                });

                if ('onChanged' in attrs){
                    //(not executed during dragging the slider)
                    element.bind( "slidechange", function(event, ui) {
                        if (!settingInitVal) {
                            scope.onChanged({
                                leftValue: ui.values[0],
                                rightValue: ui.values[1]
                            });
                        }
                    });
                }
            }
        }
    });
