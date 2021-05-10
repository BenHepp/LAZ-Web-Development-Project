(function () {
    'use strict';

    angular.module('resource')

        .factory('ResourceDelivery', ['ResourceDeliveryStatus',
            function (ResourceDeliveryStatus) {

                function ResourceDelivery(data) {
                    this.resourceDeploymentId = data.resource_deployment_id;
                    this.name                 = data.name;
                    this.status = new ResourceDeliveryStatus(data.status);
                }

                ResourceDelivery.prototype.getActivityUrl = function() {
                    if (!this.status.isDisabled) {
                        return '/main/Activity/id/' + this.resourceDeploymentId;
                    }
                    return ''
                };

                return ResourceDelivery;

            }]);
}());
