(function () {
    'use strict';

    angular.module('crossword', ['shared', 'angularModalService'])
        .constant('STEPNUM', {
            TUTORIALMODAL: 0,
            DEFINITIONBOX: 1,
            ENTERFIRSTWORD: 2, 
            SWITCHVERTICAL: 3,
            REMEMBERCLICK: 4,
            TUTORIALBUTTON: 5,
        });

})();
