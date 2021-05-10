"use strict";
angular.module('shared')

    .directive('tutorialPopupTarget', ['tutorialEventHub', function(tutorialEventHub) {
        var tutorialName;
        var tutorialPopupName;

        function link(scope, element, attrs) {
            var unwrappedElement = element[0];
            tutorialName = attrs.tutorialName;
            tutorialPopupName = attrs.tutorialPopupName;

            var event = createEvent(element);
            emitEvent(event);
        }

        function createEvent(element) {
            var event = {
                tutorialPopupName: tutorialPopupName,
                element: element
            }

            return event;
        }

        function emitEvent(event) {
            tutorialEventHub.emit(tutorialName, event);
        }

        return {
            restrict: 'A',
            link: link
        }
    }])
