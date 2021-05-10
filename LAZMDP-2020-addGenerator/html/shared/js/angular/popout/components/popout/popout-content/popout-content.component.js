var app = angular.module('shared');

app.component("popoutContent", {
    controller: 'PopoutContent',
    templateUrl: '/shared/js/angular/popout/components/popout/popout-content/popout-content.template.html',
    transclude: true,
    require: {
        parentCtrl: '^popout'
    },
    bindings: {
        overrideClass: '@',
        type: '@',
        useTemplate: '=',
        parentBindings: '<?'
    }
});

app.controller('PopoutContent', PopoutContent);

function PopoutContent() {
    var ctrl = this;
    ctrl.isOpen = function() {
        return ctrl.parentCtrl.parentObject.isOpen;
    };
    ctrl.hoverClose = function() {
        if(ctrl.hoverOffActive) ctrl.parentCtrl.close();
    };
    ctrl.close = function() {
        ctrl.parentCtrl.close();
    };
    ctrl.getClass = function() {
        return ctrl.overrideClass ? ctrl.overrideClass : "popout-" + ctrl.type;
    };
    ctrl.hasTemplate = function() {
        return !!ctrl.useTemplate;
    };
}