(function () {
    "use strict";

    angular.module("crossword")
        .service('cleanInput', function () {

            var self = this;

            self.cleanUserInput = function (letter) {
                var permittedLetters = /^[a-zA-Z0-9]+$/;
                if (letter.match(permittedLetters)) {
                    return letter.toLowerCase();
                }
                return '';
            }

        });

})();