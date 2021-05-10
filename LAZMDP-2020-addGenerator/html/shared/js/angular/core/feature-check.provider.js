"use strict";

angular.module('shared')

    .provider('FeatureCheck', function FeatureCheckProvider() {
            var provider = this;
            var enabledFeatures = {};
            provider.$get = function () {
                function isFeatureEnabled(feature) {
                    return !!enabledFeatures[feature];
                }
                return {
                    isFeatureEnabled: isFeatureEnabled
                };
            };
            provider.setEnabledFeatures = function (features) {
                if (angular.isObject(features)) {
                    enabledFeatures = features;
                }
            }
        });
