"use strict";

angular.module('shared')

    .service('resourceList', [function () {
        var resourceList = null;
        var assignmentTitle = null;
        var folderID = 0;
        var customAssignment = null;
        var parentcontroller = null;
        var fromRibbon = false;

        function getResources() {
            return resourceList;
        }

        function setResources(inAr) {
            resourceList = inAr;
        }

        function getAssignmentTitle() {
            return assignmentTitle;
        }

        function setAssignmentTitle(inAssignmentTitle) {
            assignmentTitle = inAssignmentTitle;
        }

        function setFolderID(inFolderID) {
            folderID = inFolderID;
        }

        function getFolderID() {
            return folderID;
        }

        function getCustomAssignment() {
            return customAssignment;
        }

        function setCustomAssignment(inCustomAssignment) {
            customAssignment = inCustomAssignment;
        }

        function setParentcontroller(inParentcontroller) {
            parentcontroller = inParentcontroller;
        }

        function getParentcontroller() {
            return parentcontroller;
        }

        function getFromRibbon() {
            return fromRibbon;
        }

        function setFromRibbon(val) {
            fromRibbon = val;
        }

        return {
            getFromRibbon: getFromRibbon,
            setFromRibbon: setFromRibbon,
            setParentcontroller: setParentcontroller,
            getParentcontroller: getParentcontroller,
            setCustomAssignment: setCustomAssignment,
            getCustomAssignment: getCustomAssignment,
            setFolderID: setFolderID,
            getFolderID: getFolderID,
            getAssignmentTitle: getAssignmentTitle,
            setAssignmentTitle: setAssignmentTitle,
            getResources: getResources,
            setResources: setResources
        }
    }])
