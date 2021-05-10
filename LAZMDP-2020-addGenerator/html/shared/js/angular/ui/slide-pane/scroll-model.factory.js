(function() {
   'use strict';

    angular.module('shared')

        .factory('ScrollModel', ['$interval', '_', function($interval, _) {

            function ScrollModel(config) {
                this._state = 'stopped';
                this._start = 0;
                this._items = [];
                this._scrollTarget = 0;
                this._scrollDir = 0;
                this._activeScroll = null;

                this.config = _.defaults(config || {}, {
                    itemWidth: 100,
                    viewportWidth: 500,
                    interval: 16,
                    stepSize: 7,
                    itemsToScroll: 1,
                    displayItemBuffer: 1
                });

                this.canScrollLeft = false; //TODO make these read only properties?
                this.canScrollRight = true;
                this.displayOffset = 0;
                this.displayList = [];
                this.page = 0;
                this.totalPages = 0;
            }

            ScrollModel.prototype = {
                setItems: function(newItems, startingIndex) {
                    this._items = newItems;
                    this.setScrollPosition(startingIndex || 0);
                },

                setScrollPosition: function(index) {
                    this.displayOffset = 0;
                    this._updateIndex(index - this._start);
                },

                /**
                 * This is what is primarily called when a button
                 * is pressed to initiate the internal state machine
                 * @param {Object}  event
                 * @param {String}  event.type : "start"|"stop"
                 * @param {Integer} event.direction : -1|1
                 */
                onScrollChange: function(event) {
                    switch(this._state) {
                        case 'stopped':   this._updateStopped(event);   break;
                        case 'stopping':  this._updateStopping(event);  break;
                        case 'scrolling': this._updateScrolling(event); break;
                    }
                },

                _updateStopped: function(event) {
                    if(event.type !== 'start') return;

                    this._setScrollDirection(event.direction);
                    if(this._isScrollingLeft() && this.canScrollLeft) {
                        this._startScrollLeftFromStopped();
                    } else if(this._isScrollingRight() && this.canScrollRight) {
                        this._startScrollRightFromStopped();
                    }
                },

                _isScrollingLeft: function() { return this._scrollDir < 0; },
                _isScrollingRight: function() { return this._scrollDir > 0; },

                _setScrollDirection: function(dir) {
                    this._scrollDir = dir;
                    this._scrollTarget = this._isScrollingLeft() ? 0 : -this.config.itemWidth;
                },

                _startScrollLeftFromStopped: function() {
                    console.log('starting scroll left from stopped');
                    this.displayOffset = -this.config.itemWidth;
                    this._updateIndex(-1);
                    this._startScroll();
                },

                _startScrollRightFromStopped: function() {
                    this.displayOffset = 0; //TODO is this right?
                    this._startScroll();
                },

                _updateStopping: function(event) {
                    if(event.type !== 'start') return;

                    this._setScrollDirection(event.direction);
                    this._startScroll();
                },

                _updateScrolling: function(event) {
                    if(event.type !== 'stop') return;
                    this._state = 'stopping';
                },

                 _startScroll: function() {
                    this._state = 'scrolling';
                    if(!this._activeScroll) {
                        this._activeScroll = $interval(this._updateScroll.bind(this), this.config.interval);
                    }
                },

                _stopScroll: function() {
                    $interval.cancel(this._activeScroll);
                    this._activeScroll = null;
                    this._state = 'stopped';
                },

                _updateScroll: function() {
                    if(this._state === 'stopped') {
                        this._stopScroll();
                    } else {
                        var distToBoundary = Math.abs(this._scrollTarget - this.displayOffset);
                        var step = this.config.stepSize * -this._scrollDir;
                        if( distToBoundary <= Math.abs(step) ) {
                            this._doStepOverBoundary(step);
                        } else {
                            this.displayOffset += step;
                        }
                    }
                },

                _doStepOverBoundary: function(step) {
                    if(this._state === 'stopping') {
                        this._stopScrollAtBoundary();
                    } else if( this._isScrollingLeft() ) {
                        this._continueScrollLeft(step);
                    } else {
                        this._continueScrollRight(step);
                    }
                },

                _stopScrollAtBoundary: function() {
                    this.displayOffset = 0;
                    if(this._scrollDir >= 0) {
                        this._updateIndex(this.config.itemsToScroll);
                    }

                    this._stopScroll();
                },

                _continueScrollLeft: function(step) {
                    this._updateIndex(-1*this.config.itemsToScroll);
                    this.displayOffset += step;
                },

                _continueScrollRight: function(step) {
                    this._updateIndex(1*this.config.itemsToScroll);
                    this.displayOffset += step;
                },

                _updateIndex: function(delta) {
                    var capacity = this._displayListItemCapacity();
                    var end = Math.max(0, this._items.length - capacity);

                    this._start += delta;

                    if(this._start < 0) {
                        this._start = 0;
                    } else if(this._start >= end) {
                        this._start = end;
                    }

                    this._updatePaging();

                    //TODO refactor this into an "updateLimits" function?
                    this.canScrollLeft = this._start > 0;
                    this.canScrollRight = this._start < end;

                    //TODO what other transition aren't captured in the state machine?  What variables are hanging
                    // particularly "state" and having an active scroll...

                    if(this._state === 'scrolling' && ( (!this.canScrollLeft && this._scrollDir < 0) || (!this.canScrollRight && this._scrollDir > 0) )) {
                        this._state = 'stopping';
                    }

                    this._updateDisplayList();
                },

                _updatePaging: function() {
                    var pageSize = this._displayListItemCapacity();
                    this.totalPages = pageSize >= this._items.length ? 1 : Math.ceil(this._items.length / pageSize);
                    this.page = Math.ceil( (this._start + 1) / pageSize);
                },

                _updateDisplayList: function() {
                    var capacity = this._displayListItemCapacity();
                    var end = this._start + capacity + this.config.displayItemBuffer;

                    this.displayList = this._items.slice(this._start, Math.min(this._items.length, end));
                },

                _displayListItemCapacity:  function () {
                    return Math.ceil(this.config.viewportWidth / this.config.itemWidth);
                }
            };

            return ScrollModel;
        }]);
})();
