(function () {
    "use strict";

    angular.module('shared')
        .component('messageReporter', {
            bindings: {
                delay: "@?",
            },
            templateUrl: '/shared/js/angular/ui/message-reporter.html',
            controller: 'MessageReporterCtrl'
        })
        .controller('MessageReporterCtrl',
            ['messageHandler', '$timeout', function MessageReporterCtrl(messageHandler, $timeout) {
                var ctrl = this;
                ctrl.messages = [];
                ctrl.$onDestroy = onDestroy;
                ctrl.remove = remove;
                ctrl.getMessageClass = getMessageClass;
                ctrl.callback = callback;

                //Implementation
                var DEFAULT_DELAY = 6000;
                var nextId = 1;
                messageHandler.subscribe(listener);

                function listener(message, messageType, linkText, callback, onRemove) {
                    var error = {
                        id: nextId++,
                        message: message,
                        messageType: messageType,
                        linkText: linkText,
                        callback: callback,
                        onRemove: onRemove
                    };
                    ctrl.messages.push(error)
                    error.timerPromise = $timeout(remove, getDelay(), true, error, true);
                }

                function getMessageClass(message) {
                    return message.messageType === 'error' ? 'message' : 'messageReporter_message-success';
                }

                function callback(message) {
                    message.callback();
                    remove(message);
                }

                function onDestroy() {
                    messageHandler.unsubscribe(listener);
                }

                function remove(removeError, fromTimer) {
                    ctrl.messages = _.filter(ctrl.messages, function (error) {
                        return error.id !== removeError.id;
                    });
                    if(removeError.onRemove){
                        removeError.onRemove();
                    }
                    if (!fromTimer) {
                        $timeout.cancel(removeError.timerPromise);
                    }
                }

                //Get optional bound delay (as a number)
                function getBoundDelay() {
                    if (ctrl.delay) {
                        var delay = Number(ctrl.delay);
                        if (!Number.isNaN(delay)) {
                            return delay;
                        }
                    }
                    return undefined;
                }

                function getDelay() {
                    return getBoundDelay() || DEFAULT_DELAY;
                }
            }])

})();