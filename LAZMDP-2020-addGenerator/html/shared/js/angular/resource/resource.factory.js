(function() {
    'use strict';

    angular.module('resource')

        .factory('Resource', ['resourceUtil', 'ResourceDelivery', '_',
            function(resourceUtil, ResourceDelivery, _) {

                function Resource (data) {
                    this.resourceId    = data.resource_id !== undefined ? data.resource_id : null;
                    this.packId        = data.theme_category_id !== undefined ? data.theme_category_id : null;
                    this.collectionId  = data.collection_id !== undefined ? data.collection_id : null;
                    this.title         = data.title;
                    this.showTitle     = data.show_title;
                    this.sortableTitle = data.sortable_title;
                    this.level         = data.level;
                    this.levelId       = data.levelId;
                    this.image         = data.image.cover_thumbnail;
                    this.decoration    = data.decoration;
                    this.deliveries    = data.deliveries !== undefined ? resourceUtil.orderDeliveries(
                        resourceUtil.mapConstructor(data.deliveries, ResourceDelivery)) : null;
                }

                Resource.prototype.getCoverActivityUrl = function() {
                    var delivery = _.find(this.deliveries, function(delivery){
                        return !delivery.status.isCompleted && !delivery.status.isDisabled;
                    });
                    if (delivery === undefined) {
                        delivery = _.first(this.deliveries);
                    }
                    return delivery.getActivityUrl();
                };

                return Resource;

            }]);
}());
