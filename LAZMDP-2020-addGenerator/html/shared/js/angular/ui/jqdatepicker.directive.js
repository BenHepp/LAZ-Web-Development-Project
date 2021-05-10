"use strict";

angular.module('shared')

    .directive('jqdatepicker', function () {
        return {
            restrict: 'A',
            inline: true,
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                var dateFormat = attrs.dateformat || 'mm/dd/yy';
                element.datepicker({
                    dateFormat: dateFormat
                });
                if( attrs.mindate){
                    element.datepicker( "option", "minDate", attrs.mindate);
                }
                $j('#ui-datepicker-div').on('mousedown', stopPropagation);

                if (ngModel && attrs.modelFormat) {
                    ngModel.$formatters.push(function(modelValue) {
                        if(modelValue){
                            var parsedDate = $j.datepicker.parseDate(attrs.modelFormat, modelValue);
                            return $j.datepicker.formatDate(dateFormat, parsedDate);
                        }
                        return "";
                    });

                    ngModel.$parsers.push(function(viewValue) {
                        if(viewValue){
                            var parsedDate = $j.datepicker.parseDate(dateFormat, viewValue);
                            return $j.datepicker.formatDate(attrs.modelFormat, parsedDate);
                        }
                        return "";
                    });
                }
            },
            controller: function () {
                var ctrl = this;
                ctrl.$onDestroy = function () {
                    $j('#ui-datepicker-div').off('mousedown', stopPropagation);
                }
            }
        };

        function stopPropagation(e) {
            e.stopPropagation();
        };
    })
