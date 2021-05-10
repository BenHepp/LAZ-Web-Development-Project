"use strict";

angular.module('shared')

    .component('pager', {
        bindings: {
            onPageChanged: '&',
            items: '@',
            itemsPerPage: '@?',
        },
        controller: 'Pager',
        templateUrl: '/shared/js/angular/ui/pager.html'
    })
    .controller('Pager', ['$scope', '_', function PagerCtrl($scope, _) {
        var MIN_ITEMS_PER_PAGE = 5;
        var MAX_NAVIGABLE_PAGES = 7;
        console.assert(MAX_NAVIGABLE_PAGES % 2 == 1, "MAX_NAVIGABLE_PAGES must be odd");
        var ADJACENT_NAVIGABLE_PAGES = Math.floor(MAX_NAVIGABLE_PAGES / 2); //e.g. 3 (current page is middle, 3
        var DEFAULT_ITEMS_PER_PAGE = 25;
        var itemsPerPage;
        var collection = [];
        var ctrl = this;
        ctrl.$onInit = onInit;
        ctrl.showPager = showPager;
        ctrl.gotoPage = gotoPage;
        ctrl.goRelativePages = goRelativePages;
        ctrl.goRelativeBlocks = goRelativeBlocks;
        ctrl.showLeftEllipsis = showLeftEllipsis;
        ctrl.showRightEllipsis = showRightEllipsis;
        ctrl.showStatistics = showStatistics;
        ctrl.isCurrentPage = isCurrentPage;
        return;

        function onInit() {
            initItemsPerPage();
            $scope.$parent.$watchCollection(ctrl.items, paginate);

            function initItemsPerPage() {
                var attrItemsPerPage = ctrl.itemsPerPage && parseInt(ctrl.itemsPerPage, 10);
                itemsPerPage =
                    (attrItemsPerPage >= MIN_ITEMS_PER_PAGE) ? attrItemsPerPage : DEFAULT_ITEMS_PER_PAGE;
            }
        }

        function paginate(newCollection) {
            if (!Array.isArray(newCollection)) {
                return;
            }
            var destinationPage = 1;
            collection = newCollection;
            ctrl.numPages = Math.ceil(collection.length / itemsPerPage);
            setPage(destinationPage);
        }

        function isValidPage(page) {
            return (page >= 1 && page <= ctrl.numPages) || (page == 1 && !collection.length);
        }

        //Stronger than gotoPage, which may do nothing if same page
        function setPage(page) {
            if (!isValidPage(page)) {
                throw new RangeError('Invalid page value');
            }
            ctrl.currentPage = page;
            var offset = page - 1;
            ctrl.navigablePages = getNavigablePages();

            ctrl.onPageChanged({page: collection.slice(offset * itemsPerPage, (offset + 1) * itemsPerPage)});
        }

        function getNavigablePages() {
            if (ctrl.numPages <= MAX_NAVIGABLE_PAGES + 2) {
                return _.range(2, ctrl.numPages);
            }
            if (ctrl.currentPage <= ADJACENT_NAVIGABLE_PAGES + 2) {
                return _.range(2, MAX_NAVIGABLE_PAGES + 2);
            }
            if (ctrl.currentPage >= ctrl.numPages - ADJACENT_NAVIGABLE_PAGES - 1) {
                return _.range(ctrl.numPages - MAX_NAVIGABLE_PAGES, ctrl.numPages);
            }
            return _.range(ctrl.currentPage - ADJACENT_NAVIGABLE_PAGES, ctrl.currentPage + ADJACENT_NAVIGABLE_PAGES +
                1);
        }

        function gotoPage(page) {
            if (!isValidPage(page)) {
                throw new RangeError('Invalid page value');
            }
            if (page != ctrl.currentPage) {
                setPage(page);
            }
        }

        function showPager() {
            return ctrl.numPages > 1;
        }

        function requestPage(page) {
            if (isValidPage(page)) {
                gotoPage(page);
            } else if (page < 1) {
                gotoPage(1);
            } else {
                gotoPage(ctrl.numPages);
            }
        }

        function goRelativePages(offset) {
            requestPage(ctrl.currentPage + offset);
        }

        function goRelativeBlocks(offset) {
            requestPage(ctrl.currentPage + offset * MAX_NAVIGABLE_PAGES);
        }

        function showLeftEllipsis() {
            return ctrl.navigablePages[0] > 2;
        }

        function showRightEllipsis() {
            return ctrl.navigablePages.slice(-1)[0] < ctrl.numPages - 1;
        }

        function showStatistics() {
            return showRightEllipsis();
        }

        function isCurrentPage(page) {
            return ctrl.currentPage == page;
        }
    }])
