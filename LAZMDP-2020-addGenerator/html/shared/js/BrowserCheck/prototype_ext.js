////////////////////////////////////////////////////////////////////////////////////////
// ENHANCEMENTS TO PROTOTYPE.JS

Object.extend(Number.prototype, {
  times: function(iterator) {
    if( this > 0 )
      $R(0, this, true).each(iterator);
    return this;
  }
} );

Object.extend(String.prototype, {
  trim: function() {
    return this.strip();
  },
  beginsWith: function(str) {
    return this.substr(0,str.length) == str;
  },
  endsWith: function(str) {
    return this.length > str.length && this.substr(this.length - str.length) == str;
  },
  toProperCase: function()
  {
    return this.toLowerCase().replace(/^(.)|\s(.)/g, 
        function($1) { return $1.toUpperCase(); });
  },
  capitalize: function()
  {
    return this == "" ? this : ( this.substr(0,1).toUpperCase() + this.substr( 1 ) );
  },
  repeat: function( count ) {
    var rVal = [];
    while( count-- > 0 ) {
      rVal.push( this ); 
    }
    return rVal.join(""); 
  },
  tokenize: function(pattern, results) {
    results = $A(results);
    var source = this, match;

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        results[results.length] = { token: source.slice(0, match.index), match: match[0] };
        source  = source.slice(match.index + match[0].length);
      } else {
        results[results.length] = { token: source, match: '' };
        source = '';
      }
    }
    return results;
  },
  encodeJSString: function() {
    return this.replace(/\r/g, "\\r" )
      .replace( /\n/g, "\\n" )
      .replace( /\f/g, "\\f" )
      .replace( /\t/g, "\\t" )
      .replace( /"/g, '\\"' )
      .replace( /'/g, "\\'" );
  }
  
} );

/**
 * Handle multiple iterators for sorting
 * 
 *  var array1 = [...];
 *  var array2 = array1.sortBy( function(v,i) { return v.aProp; }, function(v,i) { return v.bProp; } );
 */
Object.extend(Array.prototype, {
  sortBy: function() {
    var iterators = $A(arguments);
    return this.collect(
      function(value, index) {
        return {
          value: value, 
          criterias: iterators.collect( function(iterator) { try { return iterator(value,index); } catch(e) { return null; } } )
        };
      } ).sort(function(left, right) {
        var rVal = 0;
        for( var i = 0; rVal == 0 && i < iterators.length; i++ ) {
          var a = left.criterias[i], b = right.criterias[i];
          rVal = ( a == b ? 0 : ( a < b ? -1 : 1 ) );
        }
        return rVal;
      }).pluck('value');
  },  
  // uses toString() method on objects to compare -- javascript 1.5 should do this just with ==, but its not working in current browsers
  indexOfObj: function(object) {
    for( var i = 0; i < this.length; i++ ) {
      if( Voy.isObject( this[i] ) && Voy.isObject(object) ) {
        if( this[i].toString() == object.toString() ) return i;
      } else if (this[i] == object) return i;
    }
    return -1;
  },
  randomize: function() {
    for( var i = 0; i < this.length - 1; i++ ) {
      var index = Math.floor( ( Math.random() * ( this.length - i ) ) + i );
      var tmp = this[i];
      this[i] = this[index];
      this[index] = this[i];
    }
    return this;
  }
});


Object.extend(Element, {
  getBounds: function(element) {
    var offsets = Position.cumulativeOffset( element );
    
    return {
      height: Element.getHeight( element ),
      width: Element.getWidth( element ),
      left: offsets[0],
      top: offsets[1]
    };
  },
  setBounds: function(element, rect) {
    if( rect.height ) Element.setHeight( element, rect.height );
    if( rect.width ) Element.setWidth( element, rect.width );
    if( rect.left ) Element.setLeft( element, rect.left );
    if( rect.top ) Element.setTop( element, rect.top);
  },
  getZIndex: function(element) {
    return element.style.zIndex;
  },
  setZIndex: function(element, zIndex) {
    element.style.zIndex = zIndex;
  },
  getWidth: function(element) {
      element = $(element);
      return element.offsetWidth; 
  },
  setWidth: function(element,w) {
      element = $(element);
      element.style.width = w +"px";
  },
  setHeight: function(element,h) {
      element = $(element);
      element.style.height = h +"px";
  },
  setTop: function(element,t) {
      element = $(element);
      element.style.top = t +"px";
  },
  setLeft: function(element,t) {
      element = $(element);
      element.style.left = t +"px";
  },
  setSelectable: function(element,isSelectable) {
    element = $(element);
    
    if(/MSIE/.test(navigator.userAgent)) {
      element.onselectstart = ( isSelectable ? "return true;" : "return false;" );
    } else {
      var val = isSelectable ? "none" : "";
      element.style[ "-moz-user-select" ] = val;
      element.style[ "-khtml-user-select" ] = val;
      element.style[ "user-select" ] = val;
    }
  },
  getPageDimension: function() {
    var scroll = {x:0, y:0};
    
    if (window.innerHeight && window.scrollMaxY) {  
      scroll.x = document.body.scrollWidth;
      scroll.y = window.innerHeight + window.scrollMaxY;
    } else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
      scroll.x = document.body.scrollWidth;
      scroll.y = document.body.scrollHeight;
    } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
      scroll.x = document.body.offsetWidth;
      scroll.y = document.body.offsetHeight;
    }
    
    var win = {width: 0, height: 0};
    if (self.innerHeight) { // all except Explorer
      win.width = self.innerWidth;
      win.height = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
      win.width = document.documentElement.clientWidth;
      win.height = document.documentElement.clientHeight;
    } else if (document.body) { // other Explorers
      win.width = document.body.clientWidth;
      win.height = document.body.clientHeight;
    } 
    
    // for small pages with total w/h less then w/h of the viewport
    var page = {
      width: ( scroll.x < win.width ? win.width : scroll.x ), 
      height: ( scroll.y < win.height ? win.height : scroll.y )
    };
  
    return page;
  },
  // includes padding & border in IE BackCompat mode
  getEffectiveBounds: function(element, bounds) {
    var rVal = {};
    if( bounds.left ) rVal.left = bounds.left
    if( bounds.top ) rVal.top = bounds.top
    
    if( bounds.width ) {
      rVal.width = bounds.width 
        - parseFloat(Element.getStyle(element,'margin-left') || 0) 
        - parseFloat(Element.getStyle(element,'margin-right') || 0) 
        - (document.compatMode == 'BackCompat' ? 0 : 
            parseFloat(Element.getStyle(element,'padding-left') || 0) 
            + parseFloat(Element.getStyle(element,'padding-right') || 0) 
            + parseFloat(Element.getStyle(element,'border-left-width') || 0)
            + parseFloat(Element.getStyle(element,'border-right-width') || 0));
            
      rVal.width = rVal.width > 0 ? rVal.width : 0;
    }

    if( bounds.height ) {
      rVal.height = bounds.height
            - parseFloat(Element.getStyle(element,'margin-top') || 0) 
            - parseFloat(Element.getStyle(element,'margin-bottom') || 0) 
            - (document.compatMode == 'BackCompat' ? 0 : 
                parseFloat(Element.getStyle(element,'padding-top') || 0) 
                + parseFloat(Element.getStyle(element,'padding-bottom') || 0) 
                + parseFloat(Element.getStyle(element,'border-top-width') || 0)
                + parseFloat(Element.getStyle(element,'border-bottom-width') || 0));
      rVal.height = rVal.height > 0 ? rVal.height : 0;
    }

    return rVal;
  },
  // clear the html contents of an element
  clear: function( element ) {
    try { 
      element.innerHTML = "";
    } catch( e ) { }
 
    while( element && element.childNodes && element.childNodes.length > 0 ) {
      element.removeChild( element.firstChild );
    }
  }
  
});


Object.extend( Form,
{
  // If the field has not changed, makes it empty
  clearDefaults: function ( form ) {
    Form.getInputs( form ).each( function(input) {
      if( Voy.isNotBlank( input.defaultValue ) && input.value == input.defaultValue )
         input.value = "";
    } );
  },
  // find 1st element that is for the given typeName(if given), is not hidden, and is not disabled
  findFirstElement: function(form, typeName) {
    return Form.getElements(form).find( function(element) {
      return ( (typeName && element.type == typeName) || (!typeName && element.type != 'hidden') )
        && !element.disabled && ['input', 'select', 'textarea'].include(element.tagName.toLowerCase());
    } );
  },															  
  // put focus on 1st element that is for the given typeName(if given), is not hidden, and is not disabled
  focusFirstElement: function(form, typeName) {
    Field.activate( Form.findFirstElement(form, typeName) );
  }
  
} );


Object.extend( Form.Element, 
{
  // Find All Input Names matching regEx
  findInputs: function(form, regEx) {
    return $(form).elements.inject( {}, function(obj, elem) {
      if( regEx.match( elem.name ) != null ) {
        obj[elem.name] = elem;
      }
      return obj;
    } );
  },
  // opts: [ { value:, text:, selected: },...]
  popuplateSelect: function(select,opts) {
    select = $(select);
    select.options.length = 0;
    $A(opts).each( function(opt, index) {
      opt = Object.extend( { value: "", text: "", selected: false }, opt );
      select.options[index] = new Option( opt.text, opt.value, opt.selected, opt.selected );
    } );
  },
  setValue: function(element, value) {
    element = $(element);
    
    switch( element.tagName.toLowerCase() ) {
      case "input":
      case "textarea":
        element.value = value;
        break;
      case "select":
        var opt, index = element.selectedIndex;
        for( var i = 0; i < element.options.length; i++ ) {
          opt = element.options[i];
          if( value == ( opt.value || opt.text ) ) {
            element.selectedIndex = i;
            break;
          }
        }
    }
  },
  serializeElements: function(elements) {
    var queryComponents = new Array();
    for (var i = 0; i < elements.length; i++) {
      var queryComponent = Form.Element.serialize(elements[i]);
      if (queryComponent)
        queryComponents.push(queryComponent);
    }
    return queryComponents.join('&');
  }
} );


Object.extend( Field, 
{
  setSelectionRange: function(input, start, end) {
    if (/gecko/i.test(navigator.userAgent)) {
      input.setSelectionRange(start, end);
    } else {
      // assumed IE
      var range = input.createTextRange();
      range.collapse(true);
      range.moveStart("character", start);
      range.moveEnd("character", end - start);
      range.select();
    }
  },
  getSelectionRange: function(input) {
    return [ Field.getSelectionStart(input), Field.getSelectionEnd(input) ];
  },
  getSelectionStart: function(input) {
    if (/gecko/i.test(navigator.userAgent))
      return input.selectionStart;
    var range = document.selection.createRange();
    var isCollapsed = range.compareEndPoints("StartToEnd", range) == 0;
    if (!isCollapsed)
      range.collapse(true);
    var b = range.getBookmark();
    return b.charCodeAt(2) - 2;
  },
  getSelectionEnd: function(input) {
    if (/gecko/i.test(navigator.userAgent))
      return input.selectionEnd;
    var range = document.selection.createRange();
    var isCollapsed = range.compareEndPoints("StartToEnd", range) == 0;
    if (!isCollapsed)
      range.collapse(false);
    var b = range.getBookmark();
    return b.charCodeAt(2) - 2;
  },
  hasChanged: function(input) {
    input = $( input );
    var defVal = ( input.defaultValue || "" );
    return ! ( defVal == $F(input) );
  }  
} );
function $N( element ) {
  var result = [];
  var elements = null;
  if ( arguments.length > 1 ) {
    for ( var i = 0, length = arguments.length; i < length; i++ ) {
      result.push( $N( arguments[ i ] ) );
    }
    
  }
  if ( typeof element == 'string' )
    elements = document.getElementsByName( element );
    if ( elements.length && elements.length > 0 ) {
      for ( var i = 0; i < elements.length; i++ ) {
        result.push( Element.extend( elements[ i ] ) );
      }
    } else {
      result.push( Element.extend( elements ) );
    }
  return result;
}

// from:  http://wiki.script.aculo.us/scriptaculous/show/OnlyLatestOfClass
// Extension to Ajax allowing for classes of requests of which only one (the latest) is ever active at a time
// - stops queues of now-redundant requests building up / allows you to supercede one request with another easily.
// just pass in onlyLatestOfClass: 'classname' in the options of the request
Ajax.currentRequests = {};
Ajax.Responders.register({
  onCreate: function(request) {
    if (request.options.onlyLatestOfClass && Ajax.currentRequests[request.options.onlyLatestOfClass]) {
      // if a request of this class is already in progress, attempt to abort it before launching this new request
      try { Ajax.currentRequests[request.options.onlyLatestOfClass].transport.abort(); } catch(e) {}
    }
    // keep note of this request object so we can cancel it if superceded
    Ajax.currentRequests[request.options.onlyLatestOfClass] = request;
    Ajax.activeRequestCount++;
  },
  onComplete: function(request) {
    if (request.options.onlyLatestOfClass) {
      // remove the request from our cache once completed so it can be garbage collected
       Ajax.currentRequests[request.options.onlyLatestOfClass] = null;
    }
    Ajax.activeRequestCount--;
  }
});
