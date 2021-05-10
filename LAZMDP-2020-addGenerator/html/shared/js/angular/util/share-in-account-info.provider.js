"use strict";

angular.module('shared')

    .provider('ShareInAccountInfo',
        function ShareInAccountInfoProvider() {
            var shareInAccountInfo = {

            };
            var provider = {
                extend: extend,
                $get: [factoryFn]
            };

            return provider;

            function factoryFn() {
                return shareInAccountInfo;
            }

            function extend(accountInfo) {
                _.extend(shareInAccountInfo, accountInfo);
            }

        });