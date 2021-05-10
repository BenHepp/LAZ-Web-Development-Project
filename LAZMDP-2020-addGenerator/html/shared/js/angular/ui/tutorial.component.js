(function () {
    "use strict";

    angular.module('shared')

        .component('tutorial', {
            template: ''
            +'  <div ng-if="$ctrl.isActive()">'
            +'      <ng-transclude></ng-transclude>'
            +'      <div ng-if="$ctrl.isOverlayActive()" class="body-overlay" ng-click="$ctrl.dismiss()"></div>'
            +'  </div>',
            controller: 'Tutorial',
            transclude: true,
            bindings: {
                showOnInit: "@",
                showOverlay: "@",
                name: "@"
            }
        })
        .controller('Tutorial',
            [   '$element', 'tutorialEventHub', '_',
                function Tutorial($element, tutorialEventHub, _) {
                    var ctrl = this;
                    var isActive = false;
                    var isOverlayActive = false;

                    var popupIndex = 0;
                    var tutorialPopupControllerList = [];
                    var initEventRecievedCount = 0;

                    ctrl.$onInit = function() {
                        isActive = ctrl.showOnInit === 'true';
                        isOverlayActive = ctrl.showOverlay === 'true';
                    }

                    ctrl.registerPopupController = function(tutorialPopupController) {
                        ctrl.addPopupController(tutorialPopupController);
                        if(isLastPopupRegistering()) {
                            registerEventListenerToEventHub();
                        }
                    }

                    ctrl.addPopupController = function(tutorialPopupController) {
                        var currentPopupIndex = tutorialPopupControllerList.length;
                        tutorialPopupControllerList.push(tutorialPopupController);
                        tutorialPopupController.setIndex(currentPopupIndex);
                    }

                    function isLastPopupRegistering() {
                        return $element.find("tutorial-popup").size() == tutorialPopupControllerList.length
                    }

                    ctrl.isPopupLastPopup = function(popupIndex) {
                        return popupIndex == tutorialPopupControllerList.length-1;
                    }

                    function registerEventListenerToEventHub() {
                        tutorialEventHub.registerListener(ctrl.name, function(event) {
                            handleEvent(event);
                        });
                    }

                    function handleEvent(event) {
                        setPopupTargetElement(event.tutorialPopupName, event.element);
                        initEventRecievedCount++;
                        var isLastEventRecieved = initEventRecievedCount == tutorialPopupControllerList.length;
                        if(isLastEventRecieved) {
                            showCurrentPopup();
                        }
                    }

                    function setPopupTargetElement(tutorialPopupName, targetElement) {
                        var tutorialPopupController = _.find(tutorialPopupControllerList, function(tutorialPopupController) {
                            return tutorialPopupController.name == tutorialPopupName
                        });
                        tutorialPopupController.setTargetElement(targetElement);
                    }

                    function showCurrentPopup() {
                        tutorialPopupControllerList[popupIndex].show();
                    }

                    ctrl.showNextPopup = function() {
                        var canShowNextPopup = (popupIndex + 1) < tutorialPopupControllerList.length;
                        if(canShowNextPopup) {
                            hideCurrentPopup();
                            popupIndex++;
                            showCurrentPopup();
                        }
                        else{
                            ctrl.cleanUp();
                        }
                    }

                    function hideCurrentPopup() {
                        tutorialPopupControllerList[popupIndex].hide();
                    }

                    ctrl.cleanUp = function() {
                        isActive = false;
                        isOverlayActive = false;
                        tutorialEventHub.deregisterListener(ctrl.name);
                    }

                    ctrl.isActive = function() {
                        return isActive;
                    }

                    ctrl.isOverlayActive = function() {
                        return isOverlayActive;
                    }

                    ctrl.dismiss = function() {
                        ctrl.cleanUp();
                    }
                }
            ]);
})();