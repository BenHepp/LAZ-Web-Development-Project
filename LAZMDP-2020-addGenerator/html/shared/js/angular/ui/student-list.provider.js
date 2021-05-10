"use strict";

//service to provide source-of-truth client state for studentList
angular.module('shared')

    .provider('studentList', function studentListProvider() {
        var students;
        var includes = [];

        return {
            $get: ['$q', 'apiStudentsList', '_', studentListFactory],
            setStudents: setStudents,
            include: include
        };

        function studentListFactory($q, apiStudentsList, _) {
            var factory = this;
            factory.get = get;
            factory.getSelected = getSelected;
            factory.add = add;
            factory.clearSelected= clearSelected;
            factory.remove = remove;
            factory.annotateSelectableStudents = annotateSelectableStudents;
            factory.isSelectable = isSelectable;
            factory.getSelectable = getSelectable;
            if (angular.isDefined(students)) {
                students.$promise = $q.resolve(students);
            }
            return factory;

            function initStudents() {
                factory.pending = true;
                students = [];
                var getPromise = apiStudentsList.get(getIncludes());
                getPromise.finally(function () { factory.pending = false})
                students.$promise = getPromise
                    .then(function (result) {
                        Array.prototype.push.apply(students, result.data);
                    }).catch(angular.noop)
            }

            function get() {
                if (students === undefined) {
                    initStudents();
                } else if (!('$promise' in students)) {
                    students.$promise = $q.resolve(students);
                }
                return students;
            }

            function getSelected() {
                return get().filter(function (student) {
                    return student.selected;
                });
            }

            function clearSelected() {
                get().forEach(function (student) { student.selected = false})
            }


            function indexOfStudentById(student) {
                for (var idx = 0; idx < students.length; ++idx) {
                    if (students[idx].student_id == student.student_id) {
                        return idx;
                    }
                }
                return -1;
            }

            function add(student) {
                if (-1 == indexOfStudentById(student)) {
                    students.push(student);
                }
            }

            function remove(student) {
                var idx = indexOfStudentById(student);
                if (idx != -1) {
                    students.splice(idx, 1);
                }
            }

            function compositeDisabledChecker(studentSelectionDisabledCheckers) {
                return function (student) {
                    for (var idx = 0; idx < studentSelectionDisabledCheckers.length; ++ idx) {
                        var result = studentSelectionDisabledCheckers[idx](student);
                        if (result) {
                            return result;
                        }
                    }
                }
            }

            function annotateSelectableStudents(studentSelectionDisabledChecker) {
                var checkerDisabledFn = _.isArray(studentSelectionDisabledChecker) ?
                    compositeDisabledChecker(studentSelectionDisabledChecker) :
                    studentSelectionDisabledChecker;
                get().$promise.then(function () {
                    _.each(students, function (student) {
                        var disabled = checkerDisabledFn(student);
                        student.is_selectable = !disabled;
                        if (_.isString(disabled)) {
                            student.selection_disabled_reason = disabled;
                        } else {
                            delete student.selection_disabled_reason;
                        }
                    })
                })
                return students;
            }

            function isSelectable(student) {
                return !('is_selectable' in student) || student.is_selectable;
            }

            function getSelectable() {
                return _.filter(get(), isSelectable);
            }
        }

        function setStudents(src) {
            if (students !== undefined) {
                throw new Error("Multiple calls to setStudents")
            }
            students = src;
        }

        function include(addIncludes) {
            includes = _.union(includes, addIncludes);
        }

        function getIncludes() {
            return includes.length ? includes.join(',') : undefined;
        }
    });
