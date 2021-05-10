"use strict";

angular.module('shared')
    .provider('targetedResource', [
        function targetedResourceProvider() {
            var provider = this;
            var resourceCache = {};
            var resourceInfoByTranslation = {};
            return {
                "$get": ['$q', 'serverTargetedResource', '_', 'FeatureCheck', targetedResourceFactory],
                setResourceInfoByTranslation: setResourceInfoByTranslation
            };

            function targetedResourceFactory($q, serverTargetedResource, _, FeatureCheck) {
                var factory = this;
                factory.getResourceInfo = getResourceInfo;
                factory.getResourceInfoByTranslation = getResourceInfoByTranslation;
                return factory;

                function getResourceInfoByTranslation() {
                    return resourceInfoByTranslation;
                }

                function getResourceInfo(action, resourceId, translationId, bookroomCollectionId, title) {
                    var key = action + '-' + resourceId + '-' + translationId;
                    if (resourceCache[key]) {
                        return $q.when(resourceCache[key]);
                    } else if (action == 'getAssessment') {
                        resourceCache[key] = getAssessment(resourceId, title);
                        return $q.when(resourceCache[key]);
                    } else {
                        return serverTargetedResource.getResourceInfo(action, resourceId, translationId)
                            .then(function (result) {
                                return resourceCache[key] =
                                    getTargetedResource(result, translationId, bookroomCollectionId, title);
                            })
                    }
                }

                function getAssessment(resourceId, title) {
                    return {
                        resource_type: 'assessment',
                        resources: [{kids_book_id: resourceId}],
                        activities: [],
                        title: title
                    }
                }

                function getTargetedResource(serverTargetedResource, translationId, bookroomCollectionId, title) {
                    var resourcesAndActivities = _.reduce(serverTargetedResource, function (memo, value, index) {
                        var resource = reduceResource(value, index);
                        memo.resources.push(resource);
                        memo.activities = _.union(memo.activities, resource.activities);
                        return memo;
                    }, {
                        resources: [],
                        activities: []
                    });
                    var targetedResource = {
                        resource_type: 'collection',
                        bookroom_collection_id: bookroomCollectionId,
                        translation_id: translationId,
                        resources: _.sortBy(resourcesAndActivities.resources, 'index')
                    };
                    if (title && title != "") {
                        targetedResource.title = title;
                    }
                    else if (targetedResource.resources.length == 1) {
                        targetedResource.title = targetedResource.resources[0].title;
                    }

                    if (FeatureCheck.isFeatureEnabled('EWORKSHEETS')) {
                        targetedResource.activities = [
                            { activity_name: 'listen',    display_name: 'Listen' },
                            { activity_name: 'read',      display_name: 'Read' },
                            { activity_name: 'quiz',      display_name: 'Quiz' },
                            { activity_name: 'worksheet', display_name: 'Interactivity' }
                        ].filter(function (item) {
                            return _.contains(resourcesAndActivities.activities, item.activity_name)
                        });
                    } else {
                        targetedResource.activities = [
                            { activity_name: 'listen',    display_name: 'Listen' },
                            { activity_name: 'read',      display_name: 'Read' },
                            { activity_name: 'quiz',      display_name: 'Quiz' }
                        ].filter(function (item) {
                            return _.contains(resourcesAndActivities.activities, item.activity_name)
                        });
                    }

                    return targetedResource;

                    function reduceResource(resource, kids_book_id) {
                        resource.kids_book_id = kids_book_id;
                        resource.activities = _.keys(resource.resource_deployment_ids);
                        return resource;
                    }
                }
            }

            function setResourceInfoByTranslation(resources) {
                resourceInfoByTranslation = resources;
            }
        }]);
