"use strict";

angular.module('shared')

    .directive("clickOff", ['$document', '$parse', function ($document, $parse) {
            return {
                link: function ($scope, $element, $attributes) {
                    var scopeExpression = $attributes.clickOff,
                        onDocumentMousedown = function (event) {
                            var isChild = $element.find(event.target).length > 0;

                            if (!isChild) {
                                $scope.$apply(scopeExpression);
                            }
                        };

                    $document.on("mousedown", onDocumentMousedown);

                    $element.on('$destroy', function () {
                        $document.off("mousedown", onDocumentMousedown);
                    });
                }
            };
        }])
