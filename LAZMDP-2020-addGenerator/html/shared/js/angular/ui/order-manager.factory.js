"use strict";

angular.module('shared')

    .factory('OrderManager', function() {
        return function OrderManager(predicateMap, initialOrder, initialReverse) {
            var field;
            var reverse = false;
            var predicate = undefined;
            var predicates = predicateMap;

            orderBy(initialOrder, initialReverse);

            function orderBy(newField, newReverse) {
                if (newReverse !== undefined) {
                    reverse = !!newReverse;
                } else if (newField != field) {
                    reverse = false;
                } else {
                    reverse = !reverse;
                }
                field = newField;
                if (newField in predicates) {
                    predicate = predicates[newField];
                } else {
                    predicate = newField;
                }
            }

            function isOrderBy(testField) { return field == testField; }
            function getField() { return field; }
            function getPredicate() { return predicate; }
            function getReverse() { return reverse; }
            function getComparator() { return undefined; }

            return {
                orderBy: orderBy,
                getField: getField,
                getPredicate: getPredicate,
                getReverse: getReverse,
                getComparator: getComparator,
                isOrderBy: isOrderBy
            };
        }
    })
