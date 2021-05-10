"use strict";

angular.module('shared')

    .component('studentCheckboxList', {
        templateUrl: '/shared/js/angular/ui/student-checkbox-list.html',
        controller: 'StudentCheckboxList',
    })
    .controller('StudentCheckboxList', ['studentList', '$element',
        function StudentCheckboxList(studentList, $element) {
            var ctrl = this;
            ctrl.students = studentList.get();

            ctrl.$postLink = function () {
                $element.addClass('listStudents')
            }
    }]);
