"use strict";

angular.module('shared')

    .component('tutorialPopoverBaseContent', {
        require: {
            popoverCtrl: '^tutorialPopoverBase'
        },
        controller: 'TutorialPopoverBaseContent',
        //Moved to inline template. tutorial-popover-base couldnt find .popover-content on positioning/opening.
        //Tried moving tutorial-popover-base init-open to $postLink, but that still was not waiting for
        //tutorial-popover-base-content's template to load.
        //See https://github.com/angular/angular.js/issues/8877#issuecomment-54156319 for explanation by Igor Minar
        template: ''
        +'  <div class="tutorial_content" ng-if="$ctrl.isOpen()" ng-click="$event.stopPropagation()">'
        +'      <ng-transclude></ng-transclude>'
        +'  </div>',
        transclude: true
    })
    .controller('TutorialPopoverBaseContent', ['$scope', '$element', function TutorialPopoverBaseContentCtrl($scope, $element) {
        var ctrl = this;
        ctrl.$onInit = function () {
            ctrl.popoverCtrl.addContent(this);
            // Do not allow dynamic positioning. Only supporting positioning popup below target element.
            // Would require more time to support dynamic positioning.
            // if (ctrl.position) {
            //     ctrl.popoverCtrl.setPosition($scope.$eval(ctrl.position))
            // }
        };
        ctrl.isOpen = function () {
            return ctrl.popoverCtrl.isOpen();
        }
        ctrl.$onDestroy = function () {
            ctrl.popoverCtrl.removeContent(this);
        }
    }])
