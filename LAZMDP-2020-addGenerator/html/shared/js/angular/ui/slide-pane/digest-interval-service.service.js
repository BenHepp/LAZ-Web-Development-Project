(function() {
    'use strict';

    angular.module('shared')
        .service('digestIntervalService', [function () {
            var service = this;

            service.init = function (relevantNgScope, funcToRun, msDelay) {
                return setInterval(function () {
                    funcToRun();
                    relevantNgScope.$digest();
                }, msDelay);
            };

            service.cancel = function (setIntervalId) {
                clearInterval(setIntervalId)
            };
        }]);
}());
