"use strict"

angular.module('shared')
    .service('serverTargetedResource', ['$http',
        function serverTargetedResourceService($http) {
            var service = this;
            service.getResourceInfo = getResourceInfo;
            service.addAssignment = addAssignment;
            service.addAssessment = addAssessment;

            function getResourceInfo(action, resourceId, translationId) {
                return $http.get('/api/targeted-resources/resources/' + resourceId, {
                    params: {
                        action: action,
                        translation_id: translationId
                    }
                })
                    .then(function (result) {
                        return result.data
                    })
            }

            function addAssignment(assignment) {
                return $http.post('/api/targeted-resources/assignments', assignment)
            }

            function addAssessment(assessment) {
                return $http.post('/api/targeted-resources/assessments', assessment)
            }
        }
    ])
