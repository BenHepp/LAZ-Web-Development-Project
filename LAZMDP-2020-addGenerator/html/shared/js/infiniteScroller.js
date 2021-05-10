/*
 * InfiniteScroller
 * Version 1.1
 * 
 * Requires Prototype 1.6 or higher
 * 
 * Library to handle continuous scroll by adding data to the end of a page
 * 
 * Required Parameters
 * 
 * url:  Where to query for the next page of results
 * 
 * contentId: Div Id that will receive the next page of results  
 * 
 * Optional Parameters
 * 
 * pixelsToBottom:  Number of pixels from the bottom of the window before starting to load the next page
 * 
 * percentToBottom:  Percentage scrolled down the window before a load is triggered. (default is 0.80) 0.01 - 1.0
 * 
 * pagesToPause: The number of pages to show before we pause and require a click to continue (default is 4).
 * 
 * params: Additional parameters to pass to the url
 * 
 * loaderImgPath:  Specify the path and name of a custom loader image; defaults to /shared/images/ajax-loader.gif
 * 
 * onDomLoad: Name of a callback function to call when the dom has fully loaded
 * 
 * onSuccess: Name of a callback function to call on successful load of new data
 * 
 * Usage:
 * 
 * var infiniteScroller = new InfiniteScroller({
    	        url: myurl.php,
    	        contentId: 'postResultsHereId',    	            	        
    	        params: {next: true}
    	        
    	    }); 	    
 * 
 */

var InfiniteScroller = Class.create({

    initialize: function (initObj) {
        /** required initialization parameters **/
        this.initObj = initObj || {};

        this.url = initObj.url;
        this.contentId = initObj.contentId;

        if (this.url == null) {
            throw ("Missing required parameters: url is required.");
        }

        if (this.contentId == null || typeof(this.contentId) == 'undefined') {
            throw ("Missing required parameter: contentId is required");
        }

        /** optional initialization parameters **/
        this.params = initObj.params || {};
        this.pixelsToBottom = initObj.pixelsToBottom != null ? initObj.pixelsToBottom : 400;
        this.percentToBottom = initObj.percentToBottom != null ? initObj.percentToBottom : 0.80;
        this.resultsPerPage = initObj.resultsPerPage != null ? initObj.resultsPerPage : 50;
        this.pagesToPause = initObj.pagesToPause != null ? initObj.pagesToPause : 4;
        this.moreContentText = initObj.moreContentText != null ? initObj.moreContentText : "See More";
        this.disableCache = initObj.disableCache != null ? (initObj.disableCache == 'true' ? true : false) : false;
        this.loaderImgPath = initObj.loaderImgPath != null ? initObj.loaderImgPath : "/shared/images/ajax-loader.gif";
        this.hiddenElementId = initObj.hiddenElementId != null ? initObj.hiddenElementId : null;
        this.enableScrollOnLoad = initObj.enableScrollOnLoad != null ? initObj.enableScrollOnLoad : true;
        this.onDomLoad = initObj.onDomLoad != null ? initObj.onDomLoad : null;
        this.onSuccess = initObj.onSuccess != null ? initObj.onSuccess : null;
        this.compileMarkup = (initObj.compileMarkup !== undefined && initObj.compileMarkup !== null) ? initObj.compileMarkup: false;

        /** private parameters **/
        this._scrollUpdate = false;
        this._pauseForClick = false;
        this._page = 1;
        this._moreDataAvailable = true;
        this._lowLimit = 0;
        this._highLimit = this.resultsPerPage;
        this._parameters = Object.clone(this.params) || {};
        this._boundScrollHandlerMethod = null;

        $(document).observe('dom:loaded', this._create.bind(this));

        //handle touchscreen devices
        //	if(this.initObj.event !== 'touchmove'){
        //		this.boundTouchCreate = this.create.bindAsEventListener(this);
        //		Event.observe(window, 'touchmove', this.boundTouchCreate);
        //	}
    },

    reset: function () {
        this._content = $(this.contentId);
        this._scrollUpdate = false;
        this._pauseForClick = false;
        this._page = 1;
        this._moreDataAvailable = true;
        this._lowLimit = 0;
        this._highLimit = this.resultsPerPage;
        this._parameters = Object.clone(this.params) || {};
        this.stopObserving();
    },

    replaceParameters: function (params) {
        var queryParamsIndex = this.url.indexOf('?');
        if (queryParamsIndex > 0) {
            this.url = this.url.substring(0, queryParamsIndex);
        }
        this._parameters = {};
        this.setParameters(params);
    },

    setParameters: function (params) {
        var requestKeys = Object.keys(params);
        if (requestKeys) {
            requestKeys.each(function (key) {
                this.setParameter(key, params[key]);
            }.bind(this));
        }
    },

    setParameter: function (key, value) {
        this._parameters[key] = value;
    },

    startObserving: function () {
        this._boundScrollHandlerMethod = this._checkAppend.bind(this);
        Event.observe(window, 'scroll', this._boundScrollHandlerMethod);
    },

    stopObserving: function () {
        //unregister the scroll event handler
        Event.stopObserving(window, 'scroll', this._boundScrollHandlerMethod);
        this._boundScrollHandlerMethod = null;
    },

    _create: function () {
        if (!window.console) {
            window.console = {
                log: function () {
                }
            };
        }

        if ('function' === typeof window[this.onDomLoad]) {
            window[this.onDomLoad]();
        }
        this._content = $(this.contentId);

        this._parameters.lowLimit = this._lowLimit;
        this._parameters.highLimit = this._highLimit;

        if (this.enableScrollOnLoad) {
            this.startObserving();
        }
    },

    _checkAppend: function () {
        //check to see if the scroll bar is positioned just before the max, if so, update
        var pageHeight = this.getDocumentHeight();
        var clientHeight = this.getClientPosition();
        var scrollPos = this.getScrollTop();

        this._scrollUpdate = (pageHeight - (scrollPos + clientHeight)) < this.pixelsToBottom;
        //this._scrollUpdate = ((clientHeight + scrollPos) / pageHeight) >= this.percentToBottom;
        if (this._scrollUpdate && !this._pauseForClick) {
            if (this._moreDataAvailable) {
                this._append();
            }
        }
    },

    //append the next page of content
    _append: function () {
        this._calculateNextLimit();
        //console.log(Object.toQueryString(this._parameters));

        if (Ajax.activeRequestCount < 1) {
            var self = this;
            var myAjax = new Ajax.Request(self.url,
                {
                    parameters: self._parameters,
                    method: 'get',
                    insertion: Insertion.Bottom,

                    onCreate: function () {
                        if (self._pauseForClick) {
                            self.hideShowMoreButton();
                        }
                        if (self._moreDataAvailable) {
                            self.showLoader();
                        }
                    },

                    onSuccess: function (transport) {
                        if (self._emptyResponse(transport.responseText)) {
                            self._shutItDown();
                        }
                        else {
                            self._pauseForClick = false;

                            if(!self.compileMarkup) {
                                self._content.insert(transport.responseText);
                            }
                            self._incrementPageCount();
                            self._checkForPause();
                        }

                        if ('function' === typeof this[self.onSuccess]) {
                            this[self.onSuccess](self._content.id, transport.responseText, self.compileMarkup);
                        } else if ('function' === typeof self.onSuccess) {
                            self.onSuccess(self._content.id, transport.responseText, self.compileMarkup);
                        }

                        self.hideLoader();
                    },

                    onFailure: function (xhr, textStatus, error) {
                        self.hideLoader();
                        if (self._pauseForClick) {
                            self.hideShowMoreButton();
                        }
                        console.log("cannot retrieve data");
                        console.log("the ajax call failed: " + xhr.statusText);
                    }
                });

        }
    },

    _emptyResponse: function (responseText) {
        var isEmpty = responseText.blank();
        if (!isEmpty) {
            // check to see if the hiddenElementId is the only data other than the spinner div
            var tempElement = new Element('div').update(responseText);
            var children = tempElement.childElements();
            if (children.size() === 2 && children.last().identify() === this.hiddenElementId) {
                isEmpty = true;
            }
        }
        return isEmpty;
    },

    showLoader: function () {
        var loadingImg = new Image();
        loadingImg.src = this.loaderImgPath;
        loaderDiv =
            "<div id=\"loader\" class=\"loadImgClass\" align=\"center\"><img src=\"" + loadingImg.src + "\"/></div>";
        this._content.insert(loaderDiv);
        this._loader = $('loader');
    },

    hideLoader: function () {
        var loadingImgElements = $$("div.loadImgClass");

        $(loadingImgElements).each(function () {
            Element.remove('loader');
        });
    },

    setShowMoreButton: function () {
        var seeMoreDiv = new Element('div', {'id': 'seeMore', 'class': 'retrieveMore'}).update(this.moreContentText);
        this._content.insert(seeMoreDiv);
        this._seeMore = seeMoreDiv;

        var self = this;
        this._seeMore.on('click', function (event) {
            event.stop();
            self._scrollUpdate = true;
            self._append();
        });
    },

    hideShowMoreButton: function () {
        if (this._seeMore) {
            //stop any events associated with the show more button
            this._seeMore.stopObserving();
            this._seeMore.remove();
            this._seeMore = null;
        }
    },

    _checkForPause: function () {
        var mod = this._page % this.pagesToPause;
        if (this._page >= this.pagesToPause) {
            if (mod == 0 && this._moreDataAvailable) {
                this.setShowMoreButton();
                this._pauseForClick = true;
                this._scrollUpdate = false;
            }
        }
    },

    _shutItDown: function () {
        //reached the last page of data
        // stop any event handlers
        // hide any buttons or loader images
        this.hideShowMoreButton();
        this.hideLoader();

        this._moreDataAvailable = false;
        this.stopObserving();
    },

    getDocumentHeight: function () {
        return $(document.body).getHeight();
    },

    getScrollTop: function () {
        return $(document).viewport.getScrollOffsets().top;
    },

    getClientPosition: function () {
        return $(document).viewport.getHeight();
    },

    _incrementPageCount: function () {
        this._page++;
    },

    _calculateNextLimit: function () {
        this._lowLimit = this._page * this.resultsPerPage;
        this._highLimit = this.resultsPerPage;
        this._parameters.lowLimit = this._lowLimit;
        this._parameters.highLimit = this._highLimit;
    }

});
	
