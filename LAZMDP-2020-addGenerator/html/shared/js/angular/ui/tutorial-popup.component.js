(function () {
    "use strict";

    angular.module('shared')

        .component('tutorialPopup', {
            require: {
                tutorial: '^^tutorial'
            },
            bindings: {
                targetElementSelector: '@',
                nextButtonText: '@',
                name: '@'
            },
            template: ''
            +'  <tutorial-popover-base'
            +'      ng-class="{\'show-above-overlay\' : $ctrl.isOverlayActive}"'
            +'      class="tutorial"'
            +'      on-inited="$ctrl.popoverOnInit(ctrl)">'
            +'      <tutorial-popover-base-target target-element="$ctrl.targetElement" is-active="$ctrl.isActive()"></tutorial-popover-base-target>'
            +'      <tutorial-popover-base-content>'
            +'          <div><ng-transclude></ng-transclude></div>'
            +'          <div class="floatR marginT">'
            +'              <button class="btn btn-fauxLink" ng-if="$ctrl.isNotLastPopup()" ng-click="$ctrl.onDismissedButtonClick()">dismiss</button>'
            +'              <button class="btn" ng-click="$ctrl.onNextButtonClick()">{{$ctrl.nextButtonText}}</button>'
            +'          </div>'
            +'      </tutorial-popover-base-content>'
            +'  </tutorial-popover-base>',
            controller: 'TutorialPopup',
            transclude: true
        })
        .controller('TutorialPopup',
            [
                function TutorialPopup() {
                    var ctrl = this;
                    var isActive = false;
                    ctrl.isOverlayActive = false;
                    ctrl.targetElement;
                    ctrl.index;

                    ctrl.$onInit = function() {
                        ctrl.isOverlayActive = ctrl.tutorial.isOverlayActive();
                        setNextButtonText();
                    }

                    ctrl.show = function() {
                        isActive = true;
                        ctrl.popoverCtrl.open();
                    }

                    ctrl.hide = function() {
                        isActive = false;
                        ctrl.popoverCtrl.close();
                    }

                    ctrl.setTargetElement = function(element) {
                        ctrl.targetElement = element;
                        ctrl.popoverCtrl.addTargetElement(ctrl.targetElement);
                    }

                    ctrl.isActive = function() {
                        return isActive;
                    }

                    ctrl.onNextButtonClick = function() {
                        ctrl.tutorial.showNextPopup();
                    }

                    ctrl.onDismissedButtonClick = function() {
                        ctrl.tutorial.dismiss();
                    }

                    ctrl.isNotLastPopup = function () {
                        return !ctrl.tutorial.isPopupLastPopup(ctrl.index);
                    }

                    ctrl.popoverOnInit = function(popoverCtrl) {
                        ctrl.popoverCtrl = popoverCtrl;
                        ctrl.tutorial.registerPopupController(ctrl);
                    }

                    ctrl.setIndex = function(index) {
                        ctrl.index = index;
                    }

                    function setNextButtonText() {
                        if(!ctrl.nextButtonText) {
                            ctrl.nextButtonText = "Next Tip";
                        }
                    }
                }
            ]);
})();