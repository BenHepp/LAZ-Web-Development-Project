"use strict";

angular.module('shared')

    .component('assignResourcesButton', {
        templateUrl: '/shared/js/angular/ui/assign-resources-button.html',
        controller: 'AssignResourcesButton',
        bindings: {
            folderid: '<',
            assignmenttitle: '<',
            parentcontroller: '<',
            resources: '<',
            customassignment: '<',
            size: '@'
        },
        transclude: true
    })
    .controller('AssignResourcesButton', ["$http", 'MessageBox', 'resourceList', 'AssignResources', 'messageHandler',
        function AssignResourcesButtonController($http, MessageBox, resourceList, AssignResources, messageHandler) {
            var ctrl = this;

            ctrl.deleteAssignmentAction = function () {
                if (!ctrl.messageBoxOpen) {
                    ctrl.messageBoxOpen = true;
                    MessageBox.show({
                        message: 'Are you sure you want to unassign?',
                        responses: [
                            {
                                subtle: true,
                                label: 'No, Cancel'
                            },
                            {
                                id: 'removeAssignment',
                                confirm: true,
                                label: 'Yes, Unassign'
                            }
                        ]
                    }).then(function (response) {
                        ctrl.messageBoxOpen = false;
                        if (response.id == 'removeAssignment') {
                            var url = "/api/resources/deleteAssignment/" + ctrl.customassignment.custom_assignment_id;
                            $http.delete(url).then(onDeleteRepos, onError);
                        }
                    });
                }
            };

            ctrl.keyDown = function(event,method) {
                if (event.keyCode != 13 && event.keyCode != 32) {
                    return;
                }
                event.preventDefault();
                method();
            };


            var onDeleteRepos = function (response) {
                if (response.data) {
                    if (ctrl.parentcontroller != null) {
                        ctrl.parentcontroller.customAssignmentDeleted();
                    }
                    messageHandler.publishSuccess('Assignment successfully unassigned.');
                }
                else {
                    messageHandler.publishError('Could not delete assignment.');
                }
            };

            // Clicked the assign resource button
            ctrl.assignResourcesAction = function () {
                if (ctrl.readingResources || ctrl.readingCustomAssignment || ctrl.readingFolderTitle) { // prevent double click
                    return;
                }
                ctrl.readingResources = true;
                ctrl.readingCustomAssignment = true;
                ctrl.readingFolderTitle = true;
                resourceList.setCustomAssignment(null);
                resourceList.setParentcontroller(ctrl.parentcontroller);
                ctrl.folderid = ctrl.folderid == null ? 0 : ctrl.folderid;

                // Get resources
                if (ctrl.resources != null) { // resources bound to button
                    var response = new Object();
                    var data = new Object();
                    data.assignable = ctrl.resources;
                    response.data = data;
                    onRepos1(response);
                }
                else {
                    resourceList.setFromRibbon(true);
                    var url = "/api/filecabinet/resource/" + ctrl.folderid; // retrieve all resources in this folder
                    $http.get(url).then(onRepos1, onError);
                }

                // Get assignment
                if (ctrl.customassignment != null) {   // cust assignment bound to button
                    var response = new Object();
                    response.data = ctrl.customassignment;
                    onRepos2(response);
                }
                else {
                    var url = "/api/resources/getCustomAssignment/" + ctrl.folderid; // retrieve any custom assignment
                    $http.get(url).then(onRepos2, onError);
                }

                // Get file cabinet folder name
                if (ctrl.assignmenttitle != null) {
                //if (resourceList.getAssignmentTitle() != null) {
                    onRepos3(null);
                }
                else {
                    var url = "/api/filecabinet/folder/" + ctrl.folderid; // retrieve foldername
                    $http.get(url).then(onRepos3, onError);
                }
            };

            var onRepos1 = function (response) {
                var allR = response.data.assignable;
                if (allR != null && allR.length > 0) {
                    ctrl.selectNone(allR);
                    resourceList.setFolderID(ctrl.folderid);
                    resourceList.setResources(allR);
                    resourceList.setAssignmentTitle(ctrl.assignmenttitle);
                }
                else {
                    ctrl.failed = true;
                    messageHandler.publishError('No assignable resources were found in this folder.');
                }
                ctrl.readingResources = false;
                checkShow();
            };

            var onRepos2 = function (response) {
                var customAssignment = response.data;
                if (customAssignment != null && customAssignment.custom_assignment_id != null) {
                    resourceList.setCustomAssignment(customAssignment);
                    resourceList.setAssignmentTitle(customAssignment.assignment_name);
                }
                ctrl.readingCustomAssignment = false;
                checkShow();
            };

            var onRepos3 = function (response) {
                if (resourceList.getAssignmentTitle() == null && response != null && response.data != null && response.data.length > 0) {
                    var res = response.data[0];
                    resourceList.setAssignmentTitle(res.collection_name);
                }
                ctrl.readingFolderTitle = false;
                checkShow();
            };

            // Only bring up window after all 3 webservice calls have completed
            var checkShow = function () {
                if (ctrl.readingResources || ctrl.readingCustomAssignment || ctrl.readingFolderTitle || ctrl.failed) {
                    return;
                }
                AssignResources.show();
            };

            var onError = function (reason) {
                ctrl.readingResources = false;
                messageHandler.publishError('Failed Assigning Resources. Please refresh and try again.');
            };

            // mark all resources as selected
            ctrl.selectNone = function (resources) {
                for (var counter = 0; counter < resources.length; counter++) {
                    var oneResource = resources[counter];
                    oneResource.isChecked = false;
                    var resourceIDs = oneResource.resourceIDs;
                    if (resourceIDs == null) {
                        continue;
                    }
                    for (var counter2 = 0; counter2 < resourceIDs.length; counter2++) {
                        var oneResourceID = resourceIDs[counter2];
                        oneResourceID.checked = false;
                    }
                }
            };

            ctrl.showMessage = function (errorMessage) {
                MessageBox.show({
                    message: errorMessage,
                    responses: [
                        {
                            id: 'ok',
                            confirm: true,
                            label: 'OK'
                        }
                    ]
                }).then(function (response) {
                    ctrl.messageBoxOpen = false;
                }, function (reason) {
                    alert(errorMessage);
                });
            };
        }])
