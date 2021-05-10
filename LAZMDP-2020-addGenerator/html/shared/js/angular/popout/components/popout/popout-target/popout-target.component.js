var app = angular.module('shared');

app.component("popoutTarget", {
    controller: 'PopoutTarget',
    template: '<ng-transclude ng-click="$ctrl.toggle()" ng-mouseover="$ctrl.hoverOpen()" ng-mouseleave="$ctrl.hoverOffClose()"></ng-transclude>',
    transclude: true,
    require: {
        parentCtrl: '^popout'
    }
});

app.controller('PopoutTarget', PopoutTarget);

function PopoutTarget() {
    var ctrl = this;
    ctrl.toggle = function() {
        if(ctrl.parentCtrl.isOpen()) ctrl.parentCtrl.close();
        if(!ctrl.hoverOpenActive) ctrl.parentCtrl.open();
        if(ctrl.parentCtrl.registerClickOutsideListener) ctrl.parentCtrl.registerClickOutsideListener();
    };
    ctrl.hoverOffClose = function() {
        if(ctrl.hoverOffActive) ctrl.parentCtrl.close();
    };
    ctrl.hoverOpen = function() {
        if(ctrl.hoverOpenActive) ctrl.parentCtrl.open();
    };
}