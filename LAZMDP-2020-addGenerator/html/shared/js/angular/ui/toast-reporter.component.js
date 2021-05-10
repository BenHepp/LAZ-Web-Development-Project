"use strict";

angular.module('shared')

    .component('toastReporter', {
        template: '<div ng-repeat="error in $ctrl.getList() track by error.id" ng-click="$ctrl.remove(error)" ng-class="$ctrl.className(error)">'
        + '    <div>'
        + '        {{error.message}}'
        + '        <span class="floatR padL3">CLOSE</span>'
        + '    </div>'
        + '</div>',
        controller: 'ToastReporter'
    })
    .controller('ToastReporter', ['toastList', '$scope', function ToastReporterCtrl(toastList, $scope) {
        var ctrl = this;

        ctrl.$onInit = function () {
            toastList.setListener(listener);
        };

        function listener() {
            $scope.$apply();
        };

        ctrl.getList = function () {
            return toastList.getList();
        };

        ctrl.remove = function (messageObj) {
            toastList.removeToast(messageObj.id, false);
        };

        ctrl.className = function (messageObj) {
            if (messageObj.messageType == 0) {
                return 'message';
            }
            return 'success-message';
        }
    }])
