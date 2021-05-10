"use strict";

angular.module('shared').provider('loggedInInfo', [function loggedInInfoProvider() {
    var provider = this;

    provider.loggedInInfo = {};
    provider.extend = extend;

    provider.$get = function () {
        return provider.loggedInInfo;
    };

    function extend(loggedInInfo) {
        angular.extend(provider.loggedInInfo, loggedInInfo)
    }
}])