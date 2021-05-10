(function () {
    'use strict';

    var module = angular.module('angularPopoutService', []);

    module.factory('PopoutService',
        ['$animate', '$document', '$compile', '$controller', '$http', '$rootScope', '$q', '$templateRequest',
            '$timeout',
            function ($animate, $document, $compile, $controller, $http, $rootScope, $q, $templateRequest, $timeout) {

                function PopoutService() {
                    var self = this;

                    var getTemplate = function (template, templateUrl) {
                        var deferred = $q.defer();
                        if (template) {
                            deferred.resolve(template);
                        } else if (templateUrl) {
                            $templateRequest(templateUrl, true)
                                .then(function (template) {
                                    deferred.resolve(template);
                                }, function (error) {
                                    deferred.reject(error);
                                });
                        } else {
                            deferred.reject("No template or templateUrl has been specified.");
                        }
                        return deferred.promise;
                    };

                    var appendChild = function (parent, child) {
                        angular.element("body").css("overflow", "hidden");

                        var children = parent.children();
                        if (children.length > 0) {
                            return $animate.enter(child, parent, children[children.length - 1]);
                        }
                        return $animate.enter(child, parent);
                    };

                    self.showPopout = function (options) {
                        var body = angular.element($document[0].body);
                        var deferred = $q.defer();
                        var controllerName = options.controller;
                        if (!controllerName) {
                            deferred.reject("No controller has been specified.");
                            return deferred.promise;
                        }

                        getTemplate(options.template, options.templateUrl)
                            .then(function (template) {
                                var popoutScope = (options.scope || $rootScope).$new();
                                var rootScopeOnClose = $rootScope.$on('$locationChangeSuccess', cleanUpClose);
                                var closeDeferred = $q.defer();
                                var closedDeferred = $q.defer();
                                var inputs = {
                                    $scope: popoutScope,
                                    close: function (result, delay) {
                                        if (delay === undefined || delay === null) {
                                            delay = 0;
                                        }
                                        $timeout(function () {

                                            cleanUpClose(result);

                                        }, delay);
                                    }
                                };

                                if (options.inputs) {
                                    angular.extend(inputs, options.inputs);
                                }

                                var linkFn = $compile(template);
                                var popoutElement = linkFn(popoutScope);
                                inputs.$element = popoutElement;

                                var controllerObjBefore = popoutScope[options.controllerAs];
                                var popoutController = $controller(options.controller, inputs, false,
                                    options.controllerAs);

                                if (options.controllerAs && controllerObjBefore) {
                                    angular.extend(popoutController, controllerObjBefore);
                                }

                                if (options.appendElement) {
                                    appendChild(options.appendElement, popoutElement);
                                } else {
                                    appendChild(body, popoutElement);
                                }

                                var popout = {
                                    controller: popoutController,
                                    scope: popoutScope,
                                    element: popoutElement,
                                    close: closeDeferred.promise,
                                    closed: closedDeferred.promise
                                };

                                deferred.resolve(popout);

                                function cleanUpClose(result) {

                                    angular.element("body").css("overflow", "");
                                    closeDeferred.resolve(result);

                                    $animate.leave(popoutElement)
                                        .then(function () {
                                            closedDeferred.resolve(result);

                                            popoutScope.$destroy();
                                            inputs.close = null;
                                            deferred = null;
                                            closeDeferred = null;
                                            popout = null;
                                            inputs = null;
                                            popoutElement = null;
                                            popoutScope = null;
                                        });
                                    rootScopeOnClose && rootScopeOnClose();
                                }
                            })
                            .then(null, function (error) { // 'catch' doesn't work in IE8.
                                deferred.reject(error);
                            });

                        return deferred.promise;
                    };

                }

                return new PopoutService();
            }]);
})();