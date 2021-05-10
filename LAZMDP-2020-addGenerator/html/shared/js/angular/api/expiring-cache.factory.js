(function() {
    'use strict';

    angular.module('shared')

        .factory('ExpiringCache', ['_', function(_) {

            function ExpiringCache(config) {
                config = _.defaults(config || {}, {
                    staleAfter: 1000,
                    maxItems: 1000,
                    trace: false
                });

                this._items = {};
                this._staleAfter = config.staleAfter;
                this._maxItems = config.maxItems;
                this._log = !!config.trace ? function(msg) { console.log('ExpiringCache:' + msg) } : angular.noop;
            }

            angular.extend(ExpiringCache.prototype, {
                put: function(key, value) {
                    this._log('inserting key "' + key + '"');

                    this._garbageCollect();

                    var item = this._items[key];
                    if(!item) {
                        item = this._items[key] = { key: key };
                        this._log('inserted key "' + key + '"');
                    } else {
                        this._log('updated key "' + key + '"');
                    }

                    item.value = value;
                    item.lastUpdated = new Date();
                },

                get: function(key) {
                    this._log('fetching key "' + key + '"');

                    var item = this._items[key];
                    if(item && this._isItemStale(item)) {
                        delete this._items[key];
                        item = null;

                        this._log('removed key "' + key + '"');
                    }

                    return item ? item.value : null;
                },

                has: function(key) {
                    var item = this._items[key];

                    var found = false;
                    if(item) {
                        if(this._isItemStale(item)) {
                            delete this._items[key];
                            this._log('removed key "' + key + '"');
                        } else {
                            found = true;
                        }
                    }

                    return found;
                },

                remove: function(key) {
                    this._log('removing key "' + key + '"');

                    var exists = this.has(key);
                    if(exists) {
                        delete this._items[key];
                        this._log('removed key "' + key + '"');
                    }
                    return exists;
                },

                _isItemStale: function(item) {
                    var age = new Date().getTime() - item.lastUpdated.getTime();
                    if(age > this._staleAfter) {
                        this._log('key "' + item.key + '" is stale (age: ' + age + ')');
                        return true;
                    } else {
                        this._log('key "' + item.key + '" age ' + age + '/' + this._staleAfter);
                        return false;
                    }
                },

                _garbageCollect: function() {
                    if(this._items.length < this._maxItems) return;

                    var changed = false;
                    while(this._items.length >= this._maxItems) {
                        var toDelete = _.reduce(this._items, function(leastRecent, item, key) {
                            if(item.lastUpdated < leastRecent.lastUpdated) {
                                leastRecent.key = key;
                                leastRecent.lastUpdated = item.lastUpdated;
                            }

                            return leastRecent;
                        }, {
                            key: null,
                            lastUpdated: new Date()
                        });

                        if(toDelete.key != null) {
                            delete this._items[toDelete.key];
                            changed = true;

                            this._log('garbage collecting key "' + key + '"');
                        } else {
                            return changed;
                        }
                    }

                    return changed;
                }

            });

            return ExpiringCache;
        }])
})();