(function () {
    'use strict';

    angular.module('resource')

        .factory('resourceUtil', ['_', function (_) {

            var deliveryOrder = ['listen', 'read', 'quiz', 'word_game', 'word game', null];

            function orderDeliveries(deliveries) {
                return _.sortBy(deliveries, function(delivery){
                    return _.indexOf(deliveryOrder, delivery.name);
                });
            }

            function orderResources(resources, resourceOrder) {
                return _.sortBy(resources, function(resource) {
                    return _.indexOf(resourceOrder, resource.resourceId);
                });
            }

            function naturalSortByTitle (resources) {
                return resources.sort(function(a, b){
                    return a.title.localeCompare(b.title);
                });
            }

            function mapConstructor(data, constructor) {
                if(_.isEmpty(data)) {
                    return [];
                }
                return _.map(data, function(config) {
                    return new constructor(config);
                })
            }

            return {
                orderDeliveries: orderDeliveries,
                orderResources: orderResources,
                naturalSortByTitle: naturalSortByTitle,
                mapConstructor: mapConstructor
            };
        }]);
}());
