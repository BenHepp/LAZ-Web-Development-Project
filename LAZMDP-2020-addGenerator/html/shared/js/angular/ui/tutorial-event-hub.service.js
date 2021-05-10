"use strict";

angular.module('shared')

    .service('tutorialEventHub', [function tutorialEventHub() {
        var eventStore = {};
        var listeners = {};

        function emit(tutorialName, event) {
            if(isListenerRegistered(tutorialName)) {
                listeners[tutorialName](event);
            }
            else {
                storeEvent(tutorialName, event);
            }
        }

        function isListenerRegistered(tutorialName) {
            return listeners[tutorialName];
        }

        function storeEvent(tutorialName, event) {
            var isEventStoreCreatedForTutorial = eventStore[tutorialName];
            if(isEventStoreCreatedForTutorial) {
                eventStore[tutorialName].push(event);
            }
            else{
                eventStore[tutorialName] = [event];
            }
        }

        function registerListener(tutorialName, handler) {
            var isTutorialNotRegistered = !listeners[tutorialName];
            if(isTutorialNotRegistered) {
                listeners[tutorialName] = handler;
            }
            sendStoredEvents(tutorialName);
        }

        function sendStoredEvents(tutorialName) {
            if(eventStore[tutorialName]) {
                var events = eventStore[tutorialName];
                for(var i=0;i < events.length; i++) {
                    listeners[tutorialName](events[i]);
                }
            }
        }

        function deregisterListener(tutorialName) {
            delete listeners[tutorialName];
            //TODO: Events in the event store essentially store tutorial-popup-targets to tell tutorial-popups
            //what elements they are associated with. By deleting the stored events there can be a scenario
            //where the tutorial components are destroyed and reinitialized (and registered here),
            // but the tutorial-popup-targets are not
            //reinitialized, so they would not emit events again,
            // so we would lose knowing where tutorial-popups should be targeted.
            delete eventStore[tutorialName];
        }

        return {
            emit: emit,
            registerListener: registerListener,
            deregisterListener: deregisterListener
        }
    }])
