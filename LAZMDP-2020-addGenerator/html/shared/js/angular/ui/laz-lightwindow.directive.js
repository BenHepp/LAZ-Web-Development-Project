( function() {

    angular.module('shared')

    /**
     * laz-lightwindow directive provides a popup iframe
     *
     * Parameters:
     *
     * @href Url to be displayed. Can be specified as href parameter or href option of the laz-lightwindow.  Option setting takes precedence.
     * @height Height of the laz-lightwindow. default 1000.
     * @width Width of the laz-lightwindow. default: 900.
     *
     * Examples:
     *      <a laz-lightwindow href="https://local.raz-plus.com/main/ActivityPreview/id/9005"></a>
     *
     *      <a laz-lightwindow="{height:'500', width:'800', href:'{{::$ctrl.getReadPreviewLink()}}' }" ></a>
     */
        .directive( 'lazLightwindow', ['LazLightwindowService', function(LazLightwindowService){
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.on('click', function(event) {
                        event.preventDefault();
                        var options = scope.$eval( attrs.lazLightwindow);
                        if( !options) { options = {};}
                        options.href = options.href || attrs.href;
                        LazLightwindowService.show( options)
                            .then(function(modal){
                                scope.$on('laz-lightwindow:close', function(){
                                    modal.controller.close();
                                });
                            });
                    });
                }
            };
        }]);
})();