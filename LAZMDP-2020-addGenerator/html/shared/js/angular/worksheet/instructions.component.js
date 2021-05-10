(function () {
    'use strict';

    angular.module('shared.worksheet')

        .component('instructions', {
            templateUrl: '/shared/js/angular/worksheet/instructions.html',
            controller: 'InstructionsController',
            bindings: {
                instructionsText: '<',
                instructionsMedia: '<'
            }
        })
        .controller('InstructionsController', ['$timeout', '$q',
            function ($timeout, $q) {
                var ctrl = this;

                ctrl.openPopover = function () {
                    angular.element('body').css({'overflow': 'hidden'});
                };

                ctrl.setPopover = function (popoverCtrl) {
                    ctrl.popoverCtrl = popoverCtrl;
                };

                ctrl.clickClosePopover = function ($event) {
                    if (!angular.element($event.target).hasClass('js-content')) {
                        ctrl.closePopover();
                    }
                };

                ctrl.closePopover = function () {
                    if (ctrl.popoverCtrl) {
                        ctrl.popoverCtrl.close();
                        angular.element('body').css({'overflow': 'auto'});
                    }
                };

                ctrl.makeSticky = function (element) {
                    var pageContainer = '.js-chart';
                    var initialPadding = angular.element(pageContainer).css('padding-top');
                    var scrollLimit = parseInt(
                        angular.element('.js-header').outerHeight() +
                        angular.element('.js-worksheetHeader').outerHeight()
                    );
                    var elementHeight = angular.element(element).outerHeight();

                    angular.element(window).scroll(function () {
                        elementHeight = angular.element(element).outerHeight();

                        if (angular.element(this).scrollTop() > scrollLimit) {
                            angular.element(pageContainer).css('padding-top', parseInt(elementHeight) + parseInt(initialPadding));
                            angular.element(element).addClass('is-sticky').css({
                                'position': 'fixed',
                                'top': '0',
                                'z-index': '999'
                            });
                        } else {
                            angular.element(pageContainer).css('padding-top', initialPadding);
                            angular.element(element).removeClass('is-sticky').css({
                                'position': 'static'
                            });
                        }
                    });
                };

                ctrl.getMediaLoadedPromise = function (mediaType, src) {
                    if (src == '') {
                        return $q.resolve();
                    } else {
                        var media = angular.element(mediaType + '[src="'+ src +'"]');
                        return $q(function(resolve, reject) {
                            media.on('load', resolve);
                        });
                    }
                };

                angular.element(window).on('resize', function() {
                    ctrl.makeSticky('.js-answerBank');
                });

                ctrl.$postLink = function () {

                    // Wait for image and/or video to be fully loaded before making the answer bank sticky.
                    // Stickiness depends on the height of the instructions which isn't established until everything
                    // inside of it has loaded.
                    $timeout()
                        .then(function () {
                            var imagePromise = ctrl.getMediaLoadedPromise('img', ctrl.instructionsMedia.imagePath);
                            var videoPromise = ctrl.getMediaLoadedPromise('video', ctrl.instructionsMedia.videoPath);
                            return $q.all(imagePromise, videoPromise);
                        })
                        .then(function () {
                            return $timeout();
                        })
                        .then(function () {
                            ctrl.makeSticky('.js-answerBank');
                        })
                };
        }]);
})();
