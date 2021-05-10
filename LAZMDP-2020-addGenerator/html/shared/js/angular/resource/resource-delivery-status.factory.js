(function () {
    'use strict';

    angular.module('resource')

        .factory('ResourceDeliveryStatus', [function () {

            function ResourceDeliveryStatus(data) {
                this.isBookmarked    = data.is_bookmarked;
                this.isCompleted     = data.is_completed;
                this.isPassed        = data.is_passed;
                this.isPassedPerfect = data.is_passed_perfect;
                this.isDisabled      = data.is_disabled;
            }

            return ResourceDeliveryStatus;

        }]);
}());
