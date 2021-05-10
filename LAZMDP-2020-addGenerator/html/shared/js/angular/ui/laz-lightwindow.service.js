( function() {

    angular.module('shared')

        .service( 'LazLightwindowService', ['ModalService', '$sce',  function LazLightwindowServiceFactory(ModalService, $sce) {
            var service = this;

            service.show = function( options){
                var config = angular.extend( {width: 900, height: 1000}, options);
                if( !config.href) { throw "No href parameter specified";}
                config.href = $sce.trustAsResourceUrl( options.href);

                return ModalService.showModal({
                    controller: ['options', 'close', '$scope', function( options, close, $scope) {
                        var ctrl = this;
                        angular.extend( ctrl, options);
                        ctrl.close = close;
                        return ctrl;
                    }],
                    inputs: {
                        options: config,
                    },
                    controllerAs: '$ctrl',
                    templateUrl: '/shared/js/angular/ui/laz-lightwindow.html',
                });
            };
        }])

})();