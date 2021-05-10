"use strict";

angular.module('shared')

    .service('toastList', ['$timeout', function ($timeout) {
        var tList;
        var nextid = 0;
        var DEFAULT_DELAY = 5000;
        var listener = null;

        function getList() {
            tList = tList == null ? new Array() : tList;
            return tList;
        }

        // messageType=0 for error, 1 for success
        function addToast(message, messageType) {
            var messageObj = new Object();
            messageObj['message'] = message;
            messageObj['messageType'] = messageType;
            messageObj['id'] = ++nextid;
            messageObj.timerPromise = $timeout(removeToast, DEFAULT_DELAY, false, nextid, true);
            getList();
            tList.push(messageObj);
        }

        function removeToast(messageID,apply) {
            var ar = getList();
            var newList = new Array();
            for (var idx = 0;idx < ar.length;idx++) {
                var messageObj = ar[idx];
                if (messageObj.id != messageID) {
                    newList.push(messageObj);
                } else {
                    $timeout.cancel(messageObj.timerPromise);
                }
            }
            tList = newList;
            if (apply) {
                listener();
            }
        }

        function setListener(inListener) {
            listener = inListener;
        }

        return {
            setListener: setListener,
            getList: getList,
            addToast: addToast,
            removeToast: removeToast
        }
    }])
