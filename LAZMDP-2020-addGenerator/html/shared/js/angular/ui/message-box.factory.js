"use strict";

angular.module('shared')

    .factory('MessageBox', [
        'ModalService', '_','$timeout',
        function (ModalService, _, $timeout) {
            function MessageBoxService() {
                var service = this;

                var defaultOptions = {
                    templateUrl: '/shared/js/angular/ui/message-box.html',
                    controller: ['$scope', 'title', 'message', 'responses', 'close', MessageBoxController],
                }

                function getModalInputs(options) {
                    return {
                        title: options.title || '',
                        message: options.message || '',
                        responses: options.responses || []
                    };
                }

                function filterModalOptions(options) {
                    return _.pick(options, 'controller', 'controllerAs', 'templateUrl', 'template', 'appendElement',
                        'scope');
                }

                function modalOptions(options) {
                    var filteredModalOptions = filterModalOptions(options);
                    var defaults = ('template' in filteredModalOptions
                    || 'templateUrl' in filteredModalOptions)
                        ? _.omit(defaultOptions, 'template', 'templateUrl')
                        : defaultOptions;
                    var modalOpts = angular.extend({}, defaults, filterModalOptions(options));
                    modalOpts.inputs = getModalInputs(options);
                    return modalOpts;
                }

                function MessageBoxController($scope, title, message, responses, close) {
                    $scope.title = title;
                    $scope.message = message;
                    $scope.responses = responses;
                    $scope.close = function () {
                        close(false);
                    }
                    $scope.choose = function (response, event) {
                        close(response);
                        event.stopPropagation();
                    }
                    $scope.getAutoFocus = function(index) {
                        return index == 0 ? 'autofocus' : undefined;
                    }
                    $scope.getClassName = function(index,response) {
                        var className = "";
                        if (response.subtle) {
                            className = className + 'btn-fauxLink ';
                        }
                        if (response.confirm) {
                            className = className + 'response.confirm ';
                        }
                        if (index == 0) {
                            className = className + 'js-first-item ';
                        }
                        else if (index == (responses.length - 1)) {
                            className = className + 'js-last-item ';
                        }
                        return className.trim();
                    }
                    $scope.keyDown = function(event) {
                        if (typeof modalKeyDown == 'function') {
                            modalKeyDown(event,close,null);
                        }
                    }

                }


                this.show = function (options) {
                    var modalOpts = modalOptions(options);
                    var modalResult = ModalService.showModal(modalOpts);
                    return modalResult.then(function (modal) {
                        return modal.close;
                    });
                }
            }

            return new MessageBoxService();
        }
    ])
