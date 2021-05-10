(function () {
    "use strict";
    
    angular.module("crossword")
        .factory('tutorialGrid', function() {
            function tutorialGrid(){
                this.tutorialGrid = [
                    // First row
                    [{'letter': 'b',
                      'horizontalWord': 'black',
                      'verticalWord': 'bee'
                     },
                     {'letter': 'l',
                      'horizontalWord': 'black',
                      'verticalWord': null
                     },
                     {'letter': 'a',
                      'horizontalWord': 'black',
                      'verticalWord': null
                     },
                     {'letter': 'c',
                      'horizontalWord': 'black',
                      'verticalWord': 'coin'
                     },
                     {'letter': 'k',
                      'horizontalWord': 'black',
                      'verticalWord': null
                     }
                    ],
                    // Second row
                    [{'letter': 'e',
                      'horizontalWord': null,
                      'verticalWord': 'bee'
                     },
                     {'letter': null,
                      'horizontalWord': null,
                      'verticalWord': null
                     },
                     {'letter': null,
                      'horizontalWord': null,
                      'verticalWord': null
                     },
                     {'letter': 'o',
                      'horizontalWord': null,
                      'verticalWord': 'coin'
                     },
                     {'letter': null,
                      'horizontalWord': null,
                      'verticalWord': null
                     }
                    ],
                    // Third row
                    [{'letter': 'e',
                      'horizontalWord': null,
                      'verticalWord': 'bee'
                     },
                     {'letter': null,
                      'horizontalWord': null,
                      'verticalWord': null
                     },
                     {'letter': 'b',
                     'horizontalWord': 'big',
                     'verticalWord': null
                     },
                     {'letter': 'i',
                     'horizontalWord': 'big',
                     'verticalWord': 'coin'
                     },
                     {'letter': 'g',
                     'horizontalWord': 'big',
                     'verticalWord': null
                     },
                    ],
                    // Forth row
                    [{'letter': null,
                      'horizontalWord': null,
                      'verticalWord': null
                     },
                     {'letter': null,
                      'horizontalWord': null,
                      'verticalWord': null
                     },
                     {'letter': null,
                      'horizontalWord': null,
                      'verticalWord': null
                     },
                     {'letter': 'n',
                      'horizontalWord': null,
                      'verticalWord': 'coin'
                     },
                     {'letter': null,
                      'horizontalWord': null,
                      'verticalWord': null
                     }
                    ],
                    // Fifth row
                    [{'letter': null,
                      'horizontalWord': null,
                      'verticalWord': null
                     },
                     {'letter': null,
                      'horizontalWord': null,
                      'verticalWord': null
                     },
                     {'letter': null,
                      'horizontalWord': null,
                      'verticalWord': null
                     },
                     {'letter': null,
                      'horizontalWord': null,
                      'verticalWord': null
                     },
                     {'letter': null,
                      'horizontalWord': null,
                      'verticalWord': null
                     }
                    ]
                ]
            }
            return tutorialGrid;
        });
})();

