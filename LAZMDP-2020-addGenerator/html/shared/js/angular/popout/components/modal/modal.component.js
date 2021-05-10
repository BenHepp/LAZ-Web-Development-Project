var app = angular.module('shared');

app.component("modal", {
    controller: 'Modal',
    templateUrl: '/shared/js/angular/popout/components/modal/modal.template.html',
    transclude: true,
    bindings: {
        modalContent: '@?',
        parentBindings: '<?',
        serviceCtrl: '<?',
        iframeContent: '@?',
        contentId: '@?'
    }
});

app.controller('Modal', Modal);

function Modal($sce) {
    var ctrl = this;

    ctrl.$onInit = function() {
        if(ctrl.iframeContent) {
            ctrl.iframeUrl = $sce.trustAsResourceUrl(ctrl.iframeContent);
        }
        if(ctrl.contentId) {
            ctrl.content = $j("#" + ctrl.contentId);
        }
    };

    ctrl.getIdContent = function() {
        $j("#idcontent").append(ctrl.content.show());
    }
}

Modal.$inject = ["$sce"];