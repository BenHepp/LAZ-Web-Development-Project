(function() {
    'use strict';

    angular.module('shared')

        .factory('downloadFile', ['$document', '$http', '$window', function($document, $http, $window) {
            return function downloadFile(config) {

                config = angular.extend({
                    url: null,
                    defaultFileName: 'user-download.csv',
                    method: 'GET'
                }, mapConfig(config));

                var blobAndFileNamePromise = getFile().then(extractBlobAndFileName);

                if(!navigator.msSaveBlob){
                    return blobAndFileNamePromise
                        .then(buildAnchorTag)
                        .then(triggerDownload)
                        .then(destruct)
                } else {
                    return blobAndFileNamePromise
                        .then(openFileForIE);
                }

                function mapConfig(config){
                    switch(typeof config){
                        case 'string':
                            return { url: config };
                        case 'object':
                            return config;
                        default:
                            return {}
                    }
                }

                function getFile(){
                    return $http({
                        method: config.method,
                        url: config.url,
                        responseType: 'blob'
                    });
                }

                function extractBlobAndFileName(response){
                    var headers = response.headers();
                    var contentDispositionHeader = headers['content-disposition'];
                    var matches = contentDispositionHeader && contentDispositionHeader.match(/filename[^;=\n]*=(?:(['"])(.*)\1|([^;\n]*))/);
                    var fileName = matches ? matches[2] || matches[3] : config.defaultFileName;
                    if(!fileName){
                        throw new Error("cannot download file without filename set");
                    }
                    return { blob: response.data, fileName: fileName };
                }

                function buildAnchorTag(blobAndFileName){
                    var blobUrl = $window.URL.createObjectURL(blobAndFileName.blob);
                    var fileName = blobAndFileName.fileName;
                    return angular.element('<a/>')
                        .css({display: 'none'})
                        .attr({
                            href: blobUrl,
                            download: fileName
                        });
                }

                function triggerDownload(anchor){
                    angular.element('body')
                        .append(anchor);
                    anchor[0].click();
                    return anchor;
                }

                function destruct(anchor){
                    $window.URL.revokeObjectURL(anchor.attr("href"));
                    anchor.remove();
                }

                function openFileForIE(blobAndFileName){
                    navigator.msSaveBlob(blobAndFileName.blob, blobAndFileName.fileName)
                }
            };
        }]);
})();