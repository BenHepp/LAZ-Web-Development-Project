(function () {
    "use strict";

    angular.module("example")
        .provider('exampleStudents', [function () {
            var students;

            return {
                $get: ["$http", "$q", "_", ExampleStudents],
                setStudents: function (src) {
                    students = src;
                }
            };

            function ExampleStudents($http, $q, _) {

                function getStudents() {
                    if (students) {
                        var defer = $q.defer();
                        defer.resolve(students);
                        return defer.promise;
                    }
                    return $http.get("/api/students")
                        .then(function (result) {
                            students = result.data;
                            return students;
                        });
                }

                function addStudent(data) {
                    return $http.post("/api/students", data)
                        .then(function (result) {
                            students.push(result.data);
                        });
                }

                function removeStudent(studentId) {
                    return $http.delete("/api/students/" + studentId)
                        .then(function () {
                            var index = findStudentIndex(studentId);
                            students.splice(index, 1);
                        });
                }

                function editStudent(student) {
                    return $http.patch("/api/students/" + student.studentId, student)
                        .then(function (result) {
                            var index = findStudentIndex(student.studentId);
                            _.extend(students[index], result.data);
                        });
                }

                function findStudentIndex(studentId) {
                    for(var index = students.length - 1; index >= 0; index--) {
                        if(students[index].studentId === studentId ) {
                            return index;
                        }
                    }
                    return -1;
                }

                return {
                    getStudents: getStudents,
                    addStudent: addStudent,
                    removeStudent: removeStudent,
                    editStudent: editStudent
                };
            }

        }]);
})();
