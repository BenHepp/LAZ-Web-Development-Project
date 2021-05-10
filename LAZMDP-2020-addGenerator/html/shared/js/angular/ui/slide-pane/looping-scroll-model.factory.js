(function() {
    'use strict';

    angular.module('shared')

        .factory('LoopingScrollModel', ['ScrollModel', function(ScrollModel) {
            function LoopingScrollModel() {
                ScrollModel.apply(this, arguments);
            }

            LoopingScrollModel.prototype = Object.create(ScrollModel.prototype);
            LoopingScrollModel.prototype.constructor = LoopingScrollModel;

            LoopingScrollModel.prototype._continueScrollLeft = function(step) {
                this._updateIndex(-1);
                this.displayOffset += step - this.config.itemWidth;
            };

            LoopingScrollModel.prototype._continueScrollRight = function(step) {
                this.displayOffset += step + this.config.itemWidth;
                this._updateIndex(1);
            };

            LoopingScrollModel.prototype._updateIndex = function(delta) {
                this._start += delta;
                if(this._start < 0) {
                    // https://math.stackexchange.com/a/1670676
                    this._start = ((this._items.length - 1) * - this._start) % this._items.length;
                } else {
                    this._start = this._start % this._items.length;
                }

                this._updatePaging();
                this._updateDisplayList();
            };

            LoopingScrollModel.prototype._updateDisplayList = function() {
                var capacity = Math.ceil(this.config.viewportWidth / this.config.itemWidth);
                var end = this._start + capacity + 1;
                var items = this._items; // REVIEW: code smell?
                var displayList;

                if(capacity >= items.length) {
                    displayList = items;
                    this._setAllowScroll(false);
                } else {
                    displayList = items.slice(this._start, Math.min(items.length, end));
                    this._setAllowScroll(true);

                    if(end >= items.length) {
                        var repeatEnd = end - items.length;
                        displayList = displayList.concat( items.slice(0, repeatEnd) );
                    }
                }

                this.displayList = displayList;
            };

            LoopingScrollModel.prototype._setAllowScroll = function(value) {
                this.canScrollLeft = this.canScrollRight = value;
            };

            return LoopingScrollModel;
        }]);
})();
