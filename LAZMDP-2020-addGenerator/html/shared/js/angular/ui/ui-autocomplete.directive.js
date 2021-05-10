( function() {

    angular.module('shared')

        .directive( 'uiAutocomplete', [function(){
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var options = scope.$eval(attrs.uiAutocomplete);
                    element.autocomplete({
                        source: options.source,
                        select: options.select,
                        dataType: "json",
                        minLength: 1,
                        delay: 100
                    });
                }
            };
        }]);
})();