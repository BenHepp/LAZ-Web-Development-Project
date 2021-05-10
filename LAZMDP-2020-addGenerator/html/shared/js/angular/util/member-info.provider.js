"use strict";

angular.module('shared')
    .provider('memberInfo', function memberInfoProvider() {
        var memberInfo = {};
        return {
            extend: extend,
            $get: memberInfoFactory,
        };

        function memberInfoFactory() {
            return memberInfo;
        }

        function extend(src) {
            angular.extend(memberInfo, src)
        }
    })
