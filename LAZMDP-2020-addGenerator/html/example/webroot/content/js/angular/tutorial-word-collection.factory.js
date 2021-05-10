(function () {
    "use strict";
    
    angular.module("crossword")
        .factory('tutorialWordCollection', function() {
            function tutorialWordCollection(){
                // Copy tutorialCollection
                /*    0 1 2 3 4
                    0 b l a c k
                    1 e     o
                    2 e   b i g
                    3       n
                    4
                */
                this.tutorialWordCollection = {
                    'big': {
                        'definition': 'large, enormous',
                        'startRow': 2,
                        'startCol': 2,
                        'endRow': 2,
                        'endCol': 4,
                        'id': 0
                    },
                    'black': {
                        'definition': 'the darkest color, opposite of the color white',
                        'startRow': 0,
                        'startCol': 0,
                        'endRow': 0,
                        'endCol': 4,
                        'id': 1
                    },
                    'bee': {
                        'definition': 'yellow and black insect that can sting',
                        'startRow': 0,
                        'startCol': 0,
                        'endRow': 2,
                        'endCol': 0,
                        'id': 2
                    },
                    'coin': {
                        'definition': 'a flat, round piece of metal used as money',
                        'startRow': 0,
                        'startCol': 3,
                        'endRow': 3,
                        'endCol': 3,
                        'id': 3
                    }
                }
            }
            return tutorialWordCollection;
        });
})();
