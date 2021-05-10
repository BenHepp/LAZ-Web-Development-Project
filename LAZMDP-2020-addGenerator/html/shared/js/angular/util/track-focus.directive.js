"use strict";

/**
 * Track focused state in bound, assignable variable
 * @example
 <input ng-model="$ctrl.field" track-focus="$ctrl.fieldHasFocus"/>
 *
 * TODO: Delegate event handling to $document
 */
angular.module('shared')

    .directive('trackFocus', ['$rootScope', function($rootScope) {
            return {
                restrict: 'A',
                scope: {
                    hasFocus: '=trackFocus'
                },
                link: function(scope, elm, attrs) {
                    function onFocusChanged(hasFocus) {
                        scope.$apply(function (scope) {
                            scope.hasFocus = hasFocus;
                        });
                    }
                    var onFocus = onFocusChanged.bind(null, true);
                    var onBlur = onFocusChanged.bind(null, false);
                    elm.on('focus', onFocus)
                        .on('blur', onBlur)
                        .on('$destroy', function () {
                            elm.off('focus', onFocus)
                                .off('blur', onBlur);
                        });
                }
            }
        }])
