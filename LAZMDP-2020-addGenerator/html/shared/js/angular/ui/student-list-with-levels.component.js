(function () {
    "use strict";

    angular.module('shared')

        .component('studentListWithLevels', {
            templateUrl: '/shared/js/angular/ui/student-list-with-levels.html',
            controller: 'StudentListWithLevels'
        })
        .controller('StudentListWithLevels', ['studentList', '$element',
            function StudentCheckboxList(studentList, $element) {
                var ctrl = this;
                ctrl.students = studentList.get();

                ctrl.$postLink = function () {
                    $element.addClass('listStudents')
                }
        }])
        .config(['studentListProvider', function (studentListProvider) {
            studentListProvider.include(['core']);
        }])
})();
