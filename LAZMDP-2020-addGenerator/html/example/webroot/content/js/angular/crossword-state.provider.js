(function () {
    "use strict";

    angular.module("crossword")
        .provider('crosswordState', [function () {
            var crossword;
            var wordDataArr;

            return {
                $get: ["$http", "$q", "_", 'wordInfo', ExampleCrossword],
                setWordData: function (src) {
                    wordDataArr = src;
                },
                setCrossword: function (src) {
                    crossword = src;
                }
            };

            function ExampleCrossword($http, $q, _, wordInfo) {

                function createWordObjects(wordDataArr) {
                    var wordCollection = {};//find better name
                    _.each(wordDataArr, function(value, key){
                        wordCollection[key] = new wordInfo(value);
                    });
                    return wordCollection;
                }

                // function getCrossword() {
                //     if (crossword) {
                //         var defer = $q.defer();
                //         defer.resolve(crossword);
                //         return defer.promise;
                //     }

                //     // consider changing route
                //     return $http.get("/api/crossword")
                //         .then(function (result) {
                //             crossword = result.data;
                //             return crossword;
                //         });
                // }

                function getCrossword() {
                    if (crossword) {
                        var defer = $q.defer();
                        defer.resolve(crossword);
                        return defer.promise;
                    }

                    // consider changing route
                    return $http.get("/api/crossword")
                        .then(function (result) {
                            crossword = result.data;
                            return crossword;
                        });
                }

                function getWordCollection() {
                    if (wordDataArr) {   
                        var wordCollection = createWordObjects(wordDataArr);        
                        var defer = $q.defer();
                        defer.resolve(wordCollection);
                        return defer.promise;
                    }

                    return $http.get("/api/crossword") 
                        .then(function (result) {
                            wordDataArr = result.data;
                            var wordCollection = createWordObjects(wordDataArr);
                            return wordCollection;
                        });
                }

                return {
                    getWordCollection: getWordCollection,
                    getCrossword: getCrossword
                };
            }

        }]);
})();
