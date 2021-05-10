"use strict";

angular.module('shared')

    .service('Authorization', ['SiteHelper', 'ShareInAccountInfo', '_', 'memberInfo', 'Products',
        function AuthorizationService(SiteHelper, ShareInAccountInfo, _, memberInfo, Products) {
            var service = this;
            var boundByPrivilege = {};
            service.HOMEROOM_PRIVILEGE = "homeroom";
            init();
            service.studentHasPrivilege = studentHasPrivilege;
            service.getStudentPrivilegeChecker = getStudentPrivilegeChecker;
            service.studentHasSubject = studentHasSubject;
            service.studentWithoutPrivilegeCheckerFactory = studentWithoutPrivilegeCheckerFactory;
            service.studentHasResourceLicense = studentHasResourceLicense;
            service.getLicenseTypeForResourceCollection = getLicenseTypeForResourceCollection;
            service.studentWithoutResourceLicenseCheckerFactory = studentWithoutResourceLicenseCheckerFactory;

            function studentHasSitePrivilege(student, siteAbbrev) {
                return !student.is_shared ||
                    getStudentsTeachersAccountInfo(student).subscriptions.hasOwnProperty(siteAbbrev);
            }

            function studentHasPrivilege(student, privilege) {
                return boundByPrivilege[privilege](student);
            }

            function studentHasSubject(student, subject) {
                var siteAbbrev = memberInfo.subjects[subject] && memberInfo.subjects[subject].site_abbrev;
                if(!siteAbbrev){
                    return false;
                }
                return studentHasPrivilege(student, siteAbbrev)
            }

            function init() {
                _.map({
                    "RazKids": SiteHelper.RK_SITE_ABBREVIATION,
                    "Headsprout": SiteHelper.HEADSPROUT_SITE_ABBREVIATION,
                    "Science": SiteHelper.SAZ_SITE_ABBREVIATION,
                    "Writing": SiteHelper.WAZ_SITE_ABBREVIATION,
                    "ReadyTest": SiteHelper.TR_SITE_ABBREVIATION,
                    "ELL": SiteHelper.RAZ_ELL_SITE_ABBREVIATION
                }, function (abbrev, fnName) {
                    boundByPrivilege[abbrev] = service["studentHas" + fnName] = function (student) {
                        return studentHasSitePrivilege(student, abbrev)
                    }
                });
                boundByPrivilege[service.HOMEROOM_PRIVILEGE] = function (student) {
                    return !student.is_shared;
                }
            }

            function getStudentsTeachersAccountInfo(student) {
                return ShareInAccountInfo[student.homeroom_member_id.toString()];
            }

            function getStudentPrivilegeChecker(privilege) {
                return privilege === true
                    ? function () { return true; }
                    : boundByPrivilege[privilege];
            }
            function studentWithoutPrivilegeCheckerFactory(privilege) {
                var reason = "Student has no access to " + Products.getProductNameBySite(privilege);
                return function studentWithoutPrivilegeReason(student) {
                    if (!studentHasPrivilege(student, privilege)) {
                        return reason;
                    }
                }
            }

            function studentHasResourceLicense(student, license_type) {
                if (license_type == 'basic') {
                    return studentHasSitePrivilege(student, SiteHelper.RK_SITE_ABBREVIATION);
                } else {
                    return studentHasSitePrivilege(student, SiteHelper.RK_SITE_ABBREVIATION)
                        && studentHasSitePrivilege(student, SiteHelper.RAZ_SITE_ABBREVIATION);
                }
            }

            function getLicenseTypeForResourceCollection(resources) {
                return _.chain(resources)
                    .pluck('license_type')
                    .contains('solution')
                    .value() ? 'solution' : 'basic';
            }

            function studentWithoutResourceLicenseCheckerFactory(license_type, resource_description) {
                return function studentWithoutResourceLicenseReason(student) {
                    if (!studentHasResourceLicense(student, license_type)) {
                        return 'Student does not have access to ' + resource_description;
                    }
                }
            }
        }]);