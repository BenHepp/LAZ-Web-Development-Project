"use strict";

angular.module('shared')

    .service('AuthGo', [function AuthGoService() {
        var service = this;
        service.getUrl = getUrl;

        function getUrl(site, targetUri) {
            console.assert(angular.isString(site) && angular.isString(targetUri));
            return '/main/AuthGo/site/' + site + '/authorizer/client/uri/' + encodeURIComponent(btoa(targetUri));
        }
    }])
