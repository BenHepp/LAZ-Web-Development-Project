"use strict";

angular.module('shared')

    .service('Products', ['memberInfo', 'SiteHelper',
        function (memberInfo, SiteHelper) {
            var service = this;
            service.getProductNameBySubject = getProductNameBySubject;
            service.getProductNameBySite = getProductNameBySite;
            service.getProductListFromSiteIds = getProductListFromSiteIds;

            function getProductNameBySubject(subject) {
                return memberInfo.subjects[subject] && memberInfo.subjects[subject].product_name;
            }

            function getProductNameBySite(siteAbbrev) {
                if (siteAbbrev == SiteHelper.RAZ_ELL_SITE_ABBREVIATION) {
                    return "ELL";
                }
                var siteSubject = _.find(memberInfo.subjects, function (subject) {
                    return subject.site_abbrev == siteAbbrev;
                })
                console.assert(siteSubject, "Unknown site: " + siteAbbrev);
                return siteSubject.product_name;
            }
            function getProductListFromSiteIds(siteIds) {
                var productNames = _.chain(memberInfo.subjects)
                 .filter(function (subject) {
                     return _.contains(siteIds, subject.site_id)
                 })
                 .map(function (subject) {
                     if (subject.site_id == SiteHelper.RK_SITE_ID) {
                         return _.contains(siteIds, SiteHelper.RAZ_SITE_ID) ? 'Raz-Plus' : 'Raz-Kids';
                     } else {
                         return subject.product_name;
                     }
                 })
                 .value();
                return productNames.join(", ")
            }
        }])