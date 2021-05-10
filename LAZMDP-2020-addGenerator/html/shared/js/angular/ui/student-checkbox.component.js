"use strict";

angular.module('shared')

    .component('studentCheckbox', {
        bindings: {
            student: "<"
        },
        controller: 'StudentCheckbox',
        templateUrl: '/shared/js/angular/ui/student-checkbox.html'
    })
    .controller('StudentCheckbox', ['SiteHelper',
        function StudentCheckboxCtrl(SiteHelper) {
            var ctrl = this;
            ctrl.isSelectable = isSelectable;
            ctrl.isDisabled = isDisabled;
            ctrl.reasonDisabled = reasonDisabled;

            ctrl.$onInit = function(){
                ctrl.studentAccountIds = studentToStudentAccountIds(ctrl.student);
            };

            function isSelectable() {
                return !('is_selectable' in ctrl.student) || ctrl.student.is_selectable;
            }

            function isDisabled() {
                return !isSelectable();
            }

            function reasonDisabled() {
                return ctrl.student.selection_disabled_reason
            }

            function studentToStudentAccountIds(student) {
                var studentAccounts = {};
                studentAccounts[SiteHelper.RAZ_SITE_ABBREVIATION] = student.reading_student_account_id || null;
                studentAccounts[SiteHelper.HEADSPROUT_SITE_ABBREVIATION] = student.phonics_student_account_id || null;
                studentAccounts[SiteHelper.SAZ_SITE_ABBREVIATION] = student.science_student_account_id || null;
                studentAccounts[SiteHelper.WAZ_SITE_ABBREVIATION] = student.writing_student_account_id || null;
                studentAccounts[SiteHelper.TR_SITE_ABBREVIATION] = student.test_student_account_id || null;
                return studentAccounts;
            }

        }]);