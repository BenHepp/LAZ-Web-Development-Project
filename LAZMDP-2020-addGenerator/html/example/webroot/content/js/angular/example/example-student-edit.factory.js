(function () {
    "use strict";

})();
angular.module('example')

    .factory('ExampleStudentEdit', ['ModalService', 'messageHandler', function (ModalService, messageHandler) {
        function RosterStudentEdit() {
            var self = this;

            self.show = function (student) {
                ModalService.showModal({
                    controller: 'ExampleStudentEditModal',
                    controllerAs: '$ctrl',
                    templateUrl: '/content/js/angular/example-student-edit.html',
                    inputs: {student: student}
                })
                    .catch(function (reason) {
                        console.debug(reason);
                        messageHandler.error("There was a problem processing your request.");
                    });
            };
        }

        return new RosterStudentEdit();
    }])
    .controller('ExampleStudentEditModal', ['student', 'exampleStudents', 'messageHandler', 'close',
        function RosterStudentEditController(student, exampleStudents, messageHandler, close) {
            var ctrl = this;
            ctrl.student = student;
            ctrl.formStudent = angular.copy(student);

            ctrl.close = function () {
                close();
            };

            ctrl.save = function () {
                exampleStudents.editStudent(ctrl.formStudent).then(function () {
                    messageHandler.publishSuccess("Successfully Updated Student");
                    ctrl.close();
                }).catch(function (reason) {
                    console.debug(reason);
                    messageHandler.publishError("There was a problem processing your request.");
                });

            };
        }
    ]);
