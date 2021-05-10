var app = angular.module('shared');

app.component("popout", {
    controller: 'Popout',
    templateUrl: '/shared/js/angular/popout/components/popout/popout.template.html',
    transclude: true,
    bindings: {
        overrideClass: '@',
        serviceCtrl: '<?',
        openState: '=?'
    }
});

app.controller('Popout', Popout);

function Popout($timeout, $scope) {
    var ctrl = this;

    $scope.$watch(function() {
        if(ctrl.parentObject) return ctrl.parentObject.isOpen;
    }, function(newVal, oldVal) {
        ctrl.openState = newVal;
    });

    ctrl.$onInit = function() {
        ctrl.parentObject = {isOpen: !!ctrl.serviceCtrl};
    };

    ctrl.close = function() {
        $timeout(function() {
            if(ctrl.serviceCtrl) {
                ctrl.serviceCtrl.close();
            }
            ctrl.parentObject.isOpen = false;
        }, 0);
    };

    ctrl.isOpen = function() {
        return ctrl.parentObject.isOpen;
    };

    ctrl.open = function() {
        ctrl.parentObject.isOpen = true;
    };
}

Popout.$inject = ["$timeout", "$scope"];