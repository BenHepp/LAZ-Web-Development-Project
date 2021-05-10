//////////////////////////////////////////////////////////////////////////////////////
// 
//                                   Voyager JavaScript framework
//
// Voy
//   - root object for Voyager

var Voy = {
  VERSION: '0.2',
  DEFAULT_JSFILES: '',
  writeScript: function(libraryName) {
    document.write('<script type="text/javascript" src="'+libraryName+'"></script>');
  },
  LOAD_TIME: new Date(),
  load: function(jsFiles) {
    jsFiles = ( Voy.isBlank( jsFiles ) ? Voy.DEFAULT_JSFILES : jsFiles );
    
    $A(document.getElementsByTagName("script")).findAll( function(s) {
      return (s.src && s.src.match(/Voy\.js(\?.*)?$/))
    }).each( function(s) {
      Voy.path = s.src.replace(/Voy\.js(\?.*)?$/,'');
      var includes = s.src.match(/\?.*load=([a-z,]*)/);
      (includes ? includes[1] : jsFiles).split(',').each(
       function(include) { 
        if( Voy.isNotBlank( include ) )
          Voy.writeScript(Voy.path+include+'.js');
       });
    });
  },
  getPath: function(relPath) {
    if( Voy.isBlank( Voy.path ) ) {
      $A(document.getElementsByTagName("script")).findAll( function(s) {
      return (s.src && s.src.match(/Voy\.js(\?.*)?$/))
      }).each( function(s) {
        Voy.path = s.src.replace(/Voy\.js(\?.*)?$/,'');
        } );
    }
    return Voy.path + relPath;
  },
  inspect: function(obj, options ) {
    options = Object.extend( 
      { 
        escapeHTML: false,
        level: 0, 
        maxDepth: null, 
        token: "  ", 
        isFiltered: function(obj,propName) { return propName.beginsWith( "_" ); } 
      }, options || {} );
    
    if( Voy.isNotBlank( options.maxDepth ) && maxDepth < level )
      return;
    
    try {
      if (obj == null) return 'null';
      
      var rVal = null;
      
      switch( typeof obj ) {
        case "string":
          rVal = '"' + obj.toString() + '"';
          break;
        case 'undefined':
        case "number":
        case "boolean":
          rVal = obj.toString();
          break;
        case "function":
          rVal =  "...";
          break;
        case "object":
          if( obj instanceof Date ) {
            return Voy.formatDate( obj );
          } else if( Voy.isArray( obj ) ) {
            var spacing = options.token.repeat(options.level);
                        
            options.level = options.level + 1;
            var rVal = [ '\n', spacing, '[\n' ];
            
            for( var i = 0; i < obj.length; i++ ) {
              rVal.push( options.token.repeat(options.level) );
              rVal.push( Voy.inspect( obj[i], options ) ); 
              if( i != obj.length - 1 ) rVal.push( "," );
              rVal.push( '\n' );
            }
            rVal.push( spacing );
            rVal.push( ']' );
            
            return rVal.join("");
          } else {
            var first = true;
            var props = $A();
            for( var prop in obj ) {
              props.push(prop);
            }
            
            var a = [ "\n", options.token.repeat(options.level), "{\n" ];
            options.level = options.level + 1;
            props = props.sort();
            for( var i = 0; i < props.length; i++ ) {
              var prop = props[i];
              if( typeof obj[prop] != "function" ) {
                if( ! options.isFiltered( obj, prop) ) {
                  if( first ) {
                    first = false;
                  } else {
                    a.push( ",\n" );
                  }
                  a.push( options.token.repeat(options.level) );
                  a.push( prop );
                  a.push( ": " );
                  a.push( Voy.inspect(obj[prop], options) );
                }
              }
            }
            
            a.push( "\n" );
            a.push( options.token.repeat(options.level - 1 ) );
            a.push( "}" );
            rVal = a.join("");
          }
          break;
      }
      
      rVal = ( rVal || "?? Unknown Object ??" );
      
      return ( options.escapeHTML ? rVal.escapeHTML() : rVal );
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  },
  formatInt: function( num, minLen ) {
    num = num.toString();
    while( num.length < minLen ) 
      num = "0" + num;
    return num;
  },
  formatDate: function( d ) {
    return Voy.formatInt( d.getMonth(), 2 ) + "/" + 
      Voy.formatInt( d.getDate(), 2 ) + "/" + 
      Voy.formatInt( d.getFullYear(), 2 ) + " " + 
      Voy.formatInt( d.getHours(), 2 ) + ":" + 
      Voy.formatInt( d.getMinutes(),2 ) + ":" + 
      Voy.formatInt( d.getSeconds(), 2 );
  },
 /**
  * Converts provided arguments to an array
  * 1) toArray( obj )          ->  [ obj ]
  * 2) toArray( obj1, obj2 )   ->  [ obj1, obj2 ]
  * 3) toArray( array )        ->  array
  * 4) toArray( null )         ->  []
  */
  toArray: function() {
    // Only one argument
    if( arguments.length == 1 ) {
      if( Voy.isUndefined( arguments[0] ) || arguments == null )
        return $A();
      else if( Voy.isArray( arguments[0] ) || arguments[0].toArray )
        return $A( arguments[0] );
    }
    
    // Single Object or Multiple arguments
    var rVal = $A();
    for( var i = 0; i < arguments.length; i++ ) {
      rVal.push( arguments[i] );
    }
    return rVal;
  },
  // Browser Checks/Quirks
  isIE: function() { return /MSIE/.test(navigator.userAgent); },
  // Builder.node convience methods
  bn: function( tag, attributes ,children ) { return Builder.node.apply( Builder, [ tag, attributes, children ] ); },
  a: function( attributes, children ) { return Voy.bn( "a", attributes, children); },
  div: function( attributes, children ) { return Voy.bn( "div", attributes, children); },
  img: function( attributes, children ) { return Voy.bn( "img", attributes, children); },
  input: function( style, children ) { return Voy.bn( "input", style, children); },
  select: function( style, children ) { return Voy.bn( "select", style, children); },
  option: function( style, children ) { return Voy.bn( "option", style, children ); },
  iframe: function( style, children ) { return Voy.bn( "iframe", style, children); },
  span: function( style, children ) { return Voy.bn( "span", style, children); },
  table: function( attributes, children ) { return Voy.bn( "table", attributes, children); },
  tbody: function( attributes, children ) { return Voy.bn( "tbody", attributes, children); },
  td: function( attributes, children ) { return Voy.bn( "td", attributes, children); },
  th: function( attributes, children ) { return Voy.bn( "th", attributes, children); },
  tr: function( attributes, children ) { return Voy.bn( "tr", attributes, children); },
  
  // DATATYPE DETECTION

  isBlank: function(arg) { return Voy.isUndefined(arg) || Voy.isNull(arg) || ( Voy.isString(arg) && arg == "" ); },
  isNotBlank: function(arg) { return !Voy.isBlank(arg); },
  isString: function(a) { return typeof a=='string'; }, 
  isAlien: function(a) { return Voy.isObject(a) && typeof a.constructor != 'function'; },
  isArray: function(a) { return Voy.isObject(a) && a.constructor == Array; },
  isBoolean: function(a) { return typeof a == 'boolean'; },
  isFunction: function(a) { return typeof a=='function'; },
  isNull: function(a) { return typeof a == 'object' && !a; },
  isNumber: function(a) { return typeof a == 'number' && isFinite(a); },
  isObject: function(a) { return ( a && typeof a == 'object' ) || Voy.isFunction(a); },
  isUndefined: function(a) { return typeof a == 'undefined'; },
  isDefined: function(a) { return ! Voy.isUndefined( a ) },
  // when isResursive is true, will also test every sub-element in obj
  isEmpty: function(o,isRecursive) {
    if( Voy.isBlank(o) ) return true;
    var i, v;
    if( Voy.isString(o) && Voy.isNotBlank(o) ) {
      return false;
    } else if( Voy.isArray(o) && o.length > 0 ) {
      if( isRecursive ) {
        var allEmpty = true;
        o.each( function(item) {
          allEmpty = allEmpty && Voy.isEmpty(item, isRecursive);
        });
        return allEmpty;
      } else {
        return false;
      }      
    } else if( Voy.isObject(o) && isRecursive ) {
      var allEmpty = true;
      for (i in o) {
        v = o[i];
        allEmpty = allEmpty && Voy.isEmpty(v);
      }
      return allEmpty;
    }    
    
    return true;
  },
  isNotEmpty: function(a) { return !Voy.isEmpty(a); },

  // Test overlap between bounds ( { left, top, height, width }, see Element.getBounds(...)
  isOverlapped: function(b1,b2) {
    return ( ( b1.left < ( b2.left + b2.width ) ) && ( ( b1.left + b1.width ) > b2.left ) ) &&
      ( ( b1.top < ( b2.top + b2.height ) ) && ( ( b1.top + b1.height ) > b2.top ) );
  },

  // When
  ifBlank: function(a,b) { return Voy.isBlank(a) ? b : a },
  
  
  getIFrameDoc: function( iframe ) {
    iframe = $( iframe );
    var iDoc = null;
    if( iframe.contentDocument) { // For NS6
      iDoc = iframe.contentDocument; 
    } else if( iframe.contentWindow) {  // For IE5.5 and IE6
      iDoc = iframe.contentWindow.document;
    } else if(iframe.document) {  // For IE5
      iDoc = iframe.document;
    }
    return iDoc;  
  },
  
  ///////////////////////////////////////////////////////////////
  // MHMTL method
  ///////////////////////////////////////////////////////////////
  mhtmlCheck: function(baseServer) {
    if ( window.location.href.indexOf( 'mht' ) >= 0 ) { // mht files are mime encoded HTML files saved on the users hard drive
      var element = document.createElement( 'form' );
      element.method = 'post';
      element.action = baseServer + '/?' + new Date().getTime();
      $$('body')[0].insert(element);
      $(element).submit();
    }
  },
  
  ///////////////////////////////////////////////////////////////
  // COOKIE METHODS

  // name - name of the cookie
  // value - value of the cookie
  // [expires] - expiration date of the cookie (defaults to end of current session)
  // [path] - path for which the cookie is valid (defaults to path of calling document)
  // [domain] - domain for which the cookie is valid (defaults to domain of calling document)
  // [secure] - Boolean value indicating if the cookie transmission requires a secure transmission
  // * an argument defaults when it is assigned null as a placeholder
  // * a null placeholder is not required for trailing omitted arguments
  setCookie: function(name, value, expires, path, domain, secure) {
    var curCookie = name + "=" + escape(value) +
        ((expires) ? "; expires=" + expires.toGMTString() : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
    document.cookie = curCookie;
  },
  // name - name of the desired cookie
  // * return string containing value of specified cookie or null if cookie does not exist
  getCookie: function(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
      begin = dc.indexOf(prefix);
      if (begin != 0) return null;
    } else
      begin += 2;
    var end = document.cookie.indexOf(";", begin);
    if (end == -1)
      end = dc.length;
    return unescape(dc.substring(begin + prefix.length, end));
  },
  // name - name of the cookie
  // [path] - path of the cookie (must be same as path used to create cookie)
  // [domain] - domain of the cookie (must be same as domain used to create cookie)
  // * path and domain default if assigned null or omitted if no explicit argument proceeds
  deleteCookie: function(name, path, domain) {
    if (Voy.getCookie(name)) {
      document.cookie = name + "=" +
      ((path) ? "; path=" + path : "") +
      ((domain) ? "; domain=" + domain : "") +
      "; expires=Thu, 01-Jan-70 00:00:01 GMT";
    }
  },
  LOG_LEVELS: [ "trace","debug","info","warn"],
  warn: function()  { Voy.log.apply(Voy, ["warn"].concat( $A(arguments) ) );  },
  info: function()  { Voy.log.apply(Voy, ["info"].concat( $A(arguments) ) );  },
  debug: function() { Voy.log.apply(Voy, ["debug"].concat( $A(arguments) ) ); },
  trace: function()  { Voy.log.apply(Voy, ["trace"].concat( $A(arguments) ) );  },
  log: function() {
    var args = $A(arguments), level = args.shift();
    var div = null;
    var toLevel = Voy.LOG_LEVELS.indexOf( level );
    
    for( var i = 0; div == null && i <= toLevel; i++ ) {
      div = $( "log-" + Voy.LOG_LEVELS[i] );
    }
    
    if( Voy.isBlank( div ) )
      return;
      
    div.log = ( div.log || $A() );
    var now = new Date();
    
    div.log.push( "<div class='log-entry'>[" );
    div.log.push( "<span class='log-level'>" );
    div.log.push( level );
    div.log.push( "</span>," );
    div.log.push( "<span class='log-time'>" );
    div.log.push( now.getTime() - Voy.LOAD_TIME );
    div.log.push( "</span>] " );

    for( var i = 0; i < args.length; i++ ) {
      div.log.push( '<span class="log-item">' );
      if( Voy.isString( args[i] ) )
        div.log.push( args[i].escapeHTML() );
      else
        div.log.push( Voy.inspect( args[i], { level: 2, escapeHTML: true } ) );
      div.log.push( '</span>' );
    }
    div.log.push( "</div>" );

    // Create Timer so log messages can be queued up and rendered later (otherwise browser may lock )
    if( div.logTimeoutId )
      clearTimeout( div.logTimeoutId );
      
    div.logTimeoutId = setTimeout( 
      function(div) { 
        div.innerHTML += div.log.join(""); 
      }.bind(this,div), 300 );
  }
};

Voy.load();