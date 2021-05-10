"use strict";

angular.module('shared')

    .config(['$provide', function ($provide) {
            $provide.decorator('$templateRequest',
                ['$delegate', 'BuildTag', function $templateRequestBuildNumberDecorator($delegate, BuildTag) {
                    var trailingHtml = /\.html$/;
                    return BuildTag ? buildAnnotatedTemplateRequest : $delegate;
                    function buildAnnotatedTemplateRequest(tpl, ignoreRequestError) {
                        return $delegate(annotateTemplate(tpl), ignoreRequestError);
                    }

                    function annotateTemplate(template) {
                        return template.replace(trailingHtml, BuildTag + '.html');
                    }
                }]);
        }])
