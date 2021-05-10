//TODO (2018-10-2) add this to the include.html (after removing from shared.avatar post-release)
(function() {
    'use strict';

    angular.module('shared')

        .factory('modelUtils', ['_', function(_) {
            return {
                defineReadonly: defineReadonly,
                mapConstructor: mapConstructor,
                definePassthrough: definePassthrough,
                copyReadonly: copyReadonly
            };

            function defineReadonly(object, props) {
                var propDefs = _.reduce(props, function(propDefs, value, key) {
                    propDefs[key] = { value: value };
                    return propDefs;
                }, {});

                Object.defineProperties(object, propDefs);

                return object;
            }

            function mapConstructor(data, constructor) {
                return _.map(data, function(config) {
                    return new constructor(config);
                })
            }

            function definePassthrough(object, target, props) {
                var propDefs = _.reduce(props, function(defs, prop) {
                    defs[prop] = {
                        get: function() {
                            return target[prop];
                        }
                    };

                    return defs;
                }, {});

                Object.defineProperties(object, propDefs);

                return object;
            }

            function copyReadonly(object, target, props) {
                var propDefs = _.reduce(props, function(defs, prop) {
                    defs[prop] = { value: target[prop] };

                    return defs;
                }, {});

                Object.defineProperties(object, propDefs);

                return object;
            }
        }]);
})();

