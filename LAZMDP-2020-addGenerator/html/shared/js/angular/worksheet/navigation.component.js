(function() {
    'use strict';

    angular
        .module('shared.worksheet')
        .component('navigation', {
            templateUrl: '/shared/js/angular/worksheet/navigation.html',
            controller: 'NavigationController',
            bindings: {
                numQuestions: '<',
                questionIndex: '<'
            }
        })
        .controller('NavigationController', NavigationController);

    NavigationController.$inject = ['worksheetService'];

    function NavigationController(worksheetService) {
        var ctrl = this;

        ctrl.isPreview = worksheetService.getIsPreview();

        ctrl.onQuestionChange = function(questionIndex) {
            ctrl.questionIndex = questionIndex;
            worksheetService.setQuestionIndex(questionIndex);
        };

        ctrl.currentQuestionIndex = function() {
            return worksheetService.getQuestionIndex();
        };

        ctrl.bookmarkedQuestionIndex = function() {
            return worksheetService.getBookmarkedQuestionIndex();
        }
    }
})();
