(function () {
    "use strict";

    // todo: make example students folder
    angular.module("example")
        .component("exampleStudentList", {
            templateUrl: "content/js/angular/example-student-list.html",
            controller: "ExampleStudentList"
        })
        .controller("ExampleStudentList", [
            "exampleStudents", "messageHandler", "ExampleStudentEdit", "OrderManager",
    function ExampleStudentListController(exampleStudents, messageHandler, ExampleStudentEdit, OrderManager) {
        var ctrl = this;

        function getSortableDate(field, item) {
            return new Date(item[field]);
        }

        // todo: show some sort of "edit in place"
        ctrl.pending = true;
        ctrl.alphaNumericPattern = /^[a-zA-Z0-9]+$/;
        ctrl.orderManager = new OrderManager({addedAt: getSortableDate.bind(null, "addedAt")}, "studentId");

        exampleStudents.getStudents().then(function (students) {
            ctrl.students = students;
            ctrl.pending = false;
        }).catch(function (reason) {
            console.debug(reason);
            messageHandler.publishError("There was a problem processing your request.");
        });

        ctrl.addPending = false;
        ctrl.addStudent = function () {
            if (ctrl.addPending || !ctrl.newStudentForm.$valid) {
                return;
            }
            ctrl.addPending = true;
            exampleStudents.addStudent(ctrl.newStudent).then(function () {
                ctrl.newStudent = null;
                ctrl.newStudentForm.$setPristine();
                messageHandler.publishSuccess("Successfully Added Student");
            }).catch(function (reason) {
                console.debug(reason);
                messageHandler.publishError("There was a problem processing your request.");
            }).finally(function () {
                ctrl.addPending = false;
            });
        };

        ctrl.editStudent = function (student) {
            ExampleStudentEdit.show(student);
        };

        ctrl.removeStudent = function (student) {
            exampleStudents.removeStudent(student.studentId).then(function () {
                messageHandler.publishSuccess("Successfully Removed Student");
            }).catch(function (reason) {
                console.debug(reason);
                messageHandler.publishError("There was a problem processing your request.");
            });
        };
    }
        ]);

})();
