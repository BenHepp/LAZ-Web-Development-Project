"use strict"

angular.module('shared')
    .service('assignTargetedResource', ['ModalService', 'targetedResource', 'messageHandler', 'studentList', 'Authorization', 'SiteHelper',
        function assignTargetedResourceService(ModalService, targetedResource, messageHandler, studentList, Authorization, SiteHelper) {
            var service = this;
            service.show = show;
            service.showResourceInfo = showResourceInfo;

            function showResourceInfo(resourceInfo) {
                studentList.annotateSelectableStudents([
                    Authorization.studentWithoutPrivilegeCheckerFactory(SiteHelper.RK_SITE_ABBREVIATION),
                    studentAtTargetedResourceLimit,
                    Authorization.studentWithoutResourceLicenseCheckerFactory(
                        Authorization.getLicenseTypeForResourceCollection(resourceInfo.resources),
                        resourceInfo.resources.length > 1 ? 'these resources' : 'this resource')])
                ModalService.showModal({
                    templateUrl: '/shared/js/angular/targeted-resource-assignments/assign-targeted-resource-modal.html',
                    controller: 'assignTargetedResourceModal',
                    controllerAs: '$ctrl',
                    inputs: {
                        resourceInfo: resourceInfo
                    }
                })
                .catch(function (reason) {
                    messageHandler.publishError(
                        'There was a problem showing the assignment.  Try again later');
                })
            }

            function show(action, resourceId, translationId, bookroomCollectionId, title) {
                targetedResource.getResourceInfo(action, resourceId, translationId, bookroomCollectionId, title)
                    .then(function (resourceInfo) {
                        showResourceInfo(resourceInfo);
                    }, function (reason) {
                        messageHandler.publishError(
                            'There was an error retrieving the assignment information.  Try again later.')
                    })
            }

            function studentAtTargetedResourceLimit(student) {
                if (student.is_at_targeted_resource_limit) {
                    return "This student is at the limit of allowed assignable resources."
                }
            }
        }
    ])
    .controller('assignTargetedResourceModal',
        ['close', '$scope', 'resourceInfo', 'studentList', 'serverTargetedResource', '_', 'messageHandler', 'AuthGo',
            '$window', 'SiteHelper', 'FeatureCheck',
            function assignTargetedResourceModalCtrl(close, $scope, resourceInfo, studentList, serverTargetedResource,
                                                     _, messageHandler, AuthGo, $window, SiteHelper, FeatureCheck) {
                var ctrl = this;
                ctrl.kidsRosterUrl = AuthGo.getUrl('kaz', '/main/students');
                ctrl.close = ctrl.cancel = close;
                ctrl.title = resourceInfo.title;
                ctrl.switchAnyStudents = switchAnyStudents;
                ctrl.quizSelected = quizSelected;
                ctrl.isValid = isValid;
                ctrl.submit = submit;
                ctrl.areActivitiesDisabled = areActivitiesDisabled;
                init();

                function init() {
                    var step = 1;
                    ctrl.activities = angular.copy(resourceInfo.activities);
                    ctrl.activities.forEach(function (activity) {
                        activity.selected = true;
                        activity.iconClass = 'icon-' + activity.activity_name + 'C';
                    });

                    ctrl.showActivities = ctrl.activities.length;
                    if (ctrl.showActivities) {
                        ctrl.activitiesStep = step++;
                    }
                    ctrl.resources = angular.copy(resourceInfo.resources);
                    ctrl.resources.forEach(function (resource) {
                        resource.selected = true;
                    });

                    ctrl.showResources = ctrl.resources.length > 1;
                    if (ctrl.showResources) {
                        ctrl.resourcesStep = step++;
                    }
                    ctrl.studentsStep = step;
                    studentList.clearSelected();

                    ctrl.constructedResponseEnabled = resourceInfo.constructedResponseEnabled;
                }

                document.addEventListener('keyup', checkEscape)
                $scope.$on('$destroy', function () {
                    document.removeEventListener('keyup', checkEscape)
                });

                function switchAnyStudents() {
                    if (studentList.pending) {
                        return "pending";
                    }
                    return studentList.get().length ? "some" : "none";
                }

                function filterSelected(collection) {
                    return collection.filter(function (item) {
                        return item.selected;
                    })
                }

                function getSelectedActivities() {
                    return filterSelected(ctrl.activities);
                }

                function getSelectedResources() {
                    return filterSelected(ctrl.resources);
                }

                function quizSelected() {
                    return !!_.filter(getSelectedActivities(), function (item) {
                        return item.activity_name == 'quiz';
                    }).length
                }

                function quizValid() {
                    if (!quizSelected()) {
                        return true;
                    }
                    return ctrl.activities.length == 1
                        || getSelectedActivities().length > 1;
                }

                function validActivities() {
                    return resourceInfo.resource_type == 'assessment'
                        || (getSelectedActivities().length
                            && quizValid());
                }

                function isValid() {
                    return studentList.getSelected().length && validActivities() &&
                        getSelectedResources().length;
                }

                function submit() {
                    console.assert(isValid(), "Invalid submit attempt");
                    if (!isValid()) {
                        return;
                    }
                    if (resourceInfo.resource_type == 'assessment') {
                        serverTargetedResource.addAssessment(getServerAssessment())
                            .then(function () {
                                messageHandler.publishSuccess('Assessment created. Track progress on the ', 'assignments page.', assignmentRedirect);
                                close();
                            }, function () {
                                messageHandler.publishError(
                                    "There was an error adding the assessment. Try again later.")
                            })

                    } else {
                        serverTargetedResource.addAssignment(getServerAssignment())
                            .then(function (response) {
                                if (response.data.status === "success") {
                                    messageHandler.publishSuccess('Assignment created. Track progress on the ', 'assignments page.', assignmentRedirect);
                                } else {
                                    messageHandler.publishError('There was an error adding the assignment. Try again later.');
                                }
                                close();
                            }, function () {
                                messageHandler.publishError(
                                    "There was an error adding the assignment. Try again later.")
                            })
                    }
                }

                function assignmentRedirect() {
                    $window.location.href = AuthGo.getUrl(SiteHelper.KAZ_SITE_ABBREVIATION, '/main/Assign/action/readingPractice');
                };

                function getServerAssignment() {
                    return {
                        activities: getActivities(),
                        resources: getSelectedResources().map(function (resource) {
                            return _.pick(resource, 'kids_book_id')
                        }),
                        students: studentList.getSelected().map(function (student) {
                            return _.pick(student, 'student_id')
                        }),
                        bookroom_collection_id: resourceInfo.bookroom_collection_id,
                        constructed_response_enabled: ctrl.constructedResponseEnabled
                    };

                    function getActivities() {
                        return _.pluck(getSelectedActivities(), 'activity_name');
                    }
                }

                function getServerAssessment() {
                    return {
                        kids_book_id: ctrl.resources[0].kids_book_id,
                        students: studentList.getSelected().map(function (student) {
                            return _.pick(student, 'student_id')
                        }),
                    }
                }

                function checkEscape(event) {
                    if (event.key == "Escape") {
                        close();
                    }
                }

                function areActivitiesDisabled() {
                    return ctrl.activities.length == 1
                }
            }
        ])
    .config(['studentListProvider', function (studentListProvider) {
        studentListProvider.include('at-targeted-resource-limit')
    }])
