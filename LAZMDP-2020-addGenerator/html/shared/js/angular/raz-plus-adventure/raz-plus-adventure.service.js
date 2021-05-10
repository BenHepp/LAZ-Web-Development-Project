(function(){
'use strict';

angular.module('shared')
    .factory('razPlusAdventureService', ['$http', dataService]);

function dataService($http){

    var razPlusAdventureUrl = '/api/razPlusAdventure';

    return {
        recordAdventureLinkClick: recordAdventureLinkClick
    };

    function recordAdventureLinkClick(){
        return $http({
            method: "POST",
            url: razPlusAdventureUrl + "/click",
            data: {}
        });
    }
}

}());
