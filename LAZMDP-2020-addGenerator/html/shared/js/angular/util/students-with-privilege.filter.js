"use strict";

angular.module('shared')
    .filter('studentsWithPrivilege', ['Authorization', '_',
        function studentsWithPrivilegeFactory(Authorization, _) {
            return function studentsWithPrivilege(students, privilege) {
                return _.filter(students, Authorization.getStudentPrivilegeChecker(privilege));
            }
        }])