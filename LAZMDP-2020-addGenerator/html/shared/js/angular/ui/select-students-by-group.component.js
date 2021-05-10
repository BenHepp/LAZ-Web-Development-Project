"use strict";

angular.module('shared')

    .component('selectStudentsByGroup', {
        templateUrl: "/shared/js/angular/ui/select-students-by-group.html",
        controller: 'StudentCheckboxFilter',
    })
    .controller('StudentCheckboxFilter', ['studentList', '$filter',
        function StudentCheckboxFilter(studentList, $filter) {
        var ctrl = this;
        ctrl.students = studentList.get();
        ctrl.students.$promise.then(reduceGroups);

        function reduceGroups() {
            ctrl.groups =
                _.chain(ctrl.students)
                .pluck('groups')
                .flatten()
                .unique(function (group) {
                    return group.grouping_id;
                })
                .sortBy(function (group) {
                    return group.grouping_name.toLowerCase();
                })
                .value();
        }

        ctrl.selectGroup = function (group) {
            ctrl.clearAll();
            selectableStudents().forEach(function (student) {
                if (_.find(student.groups, function (studentGroup) {
                        return studentGroup.grouping_id === group.grouping_id;
                    })) {
                    student.selected = true;
                }
            });
        }

        ctrl.selectAll = function () {
            selectableStudents().forEach(function (student) {
                student.selected = true;
            });
        }

        ctrl.clearAll = function () {
            selectableStudents().forEach(function (student) {
                student.selected = false;
            });
        }

        function selectableStudents() {
            return studentList.getSelectable()
        }
    }])