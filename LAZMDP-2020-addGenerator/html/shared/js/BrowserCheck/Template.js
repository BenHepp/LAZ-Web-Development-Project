
Voy.Template = Class.create();
Object.extend( Voy.Template,
{
  transform: function( url, templateId, context, options ) {
    options = Object.extend( 
    { 
      div: null,
      clearDivFirst: true, 
      appendToDiv: false, // does not use innerHTML - only used when clearDivFirst is false
      onComplete: Prototype.emptyFunction,  
      onFailure: Prototype.emptyFunction,
      asynchronous: !( Voy.isBlank( options ) || ( Voy.isBlank( options.onComplete ) && Voy.isBlank( options.div ) ) )
    }, options );
  
    url = ( url || arguments.callee.url );
  
    var syncRVal = "";
    
    Voy.Template.loadTemplates( url, 
    {
      asynchronous: options.asynchronous,
      onComplete: 
        function(url, templateId, context, options,templates ) {
          var template = Voy.Template.get(url,templateId);
	        var str = template.evaluate( context );
	        if( Voy.isNotBlank( options.div ) ) {
            
	          if( options.clearDivFirst ) {
	            $( options.div ).innerHTML = str;
	          } else {
              if( options.appendToDiv ) {    
                var newDiv = document.createElement( "div" );
                $( options.div ).parentNode.appendChild( newDiv );
                newDiv.innerHTML = str;  
              } else {
                $( options.div ).innerHTML += str;
              }
            }
	        }
	        
	        // Call back
	        options.onComplete( str );
          syncRVal = str;
	      }.bind(this, url, templateId, context, options ),
      onFailure: 
        function(url,templateId,context,options,transport) { 
          Voy.log( "info", url + " not found" );
          // Call back
          options.onFailure();
          
          if( Voy.isNotBlank( options.div ) ) {
            if( options.clearDivFirst ) {
              options.div.innerHTML = "";
            }
          }
        }.bind(this, url, templateId, context, options )
    } );
    
    return syncRVal;
  },
  //////////////////////////////////////////////////////////////////////////////////////////
  // BACKWARDLY COMPATIBLE METHODS
  apply: function( elemId, context ) {
    var elem = $(elemId);
    // Cache template in elem
    elem._templates = ( elem._templates || $H() );
    elem._templates[elemId] = ( elem._templates[elemId]  || new Voy.Template( elem.innerHTML, null, null ) );
  
    return elem._templates[elemId].evaluate( context );
  },
  applyAll: function( elemId, contexts ) {
    return $A( contexts ).collect( function(context) { 
      return ( Voy.Template.apply(elemId, context ) || '' ); 
    } ).join('');
  },
  /////////////////////////////////////////////
  templates: {},
  loading: {},
  add: function( template ) {
    var url = ( template.url || "temp" );
    var templates = Voy.Template.templates[url];
    if( Voy.isBlank( templates ) ) {
      templates = Voy.Template.templates[url] = {};
    }
    
    templates[template.id] = template;
  },
  get: function( url, id ) {
    var templates = Voy.Template.templates[url];
    
    if( Voy.isBlank( id ) )
      return templates;
      
    return Voy.isBlank( templates ) ? null : templates[id];
  },
  loadTemplates: function( url, options ) {
    options = Object.extend( {
      onComplete: Prototype.emptyFunction,  // onComplete( templates<key=id,value=template> )
      onFailure: Prototype.emptyFunction,
      asynchronous: true
    }, options || {} );

    var templates = Voy.Template.get(url);
    if( Voy.isNotBlank( templates ) ) {
      if( options.asynchronous )
        setTimeout( function(options, url, templates) { 
          options.onComplete( templates ) 
          }.bind( this, options, url, templates ), 50 );
      else
        options.onComplete( templates );
    } else {
      var loading = Voy.Template.loading[url];
      if( Voy.isBlank( loading ) )
        loading = Voy.Template.loading[url] = $A();
	    loading.push( options );

      Voy.log( "debug", "Voy.Template.loadTemplates:  url=" + url );	    
	    if( loading.length == 1 ) {
        
		    var request = new Ajax.Request(
			      url, 
            Object.extend( 
              { 
                method: 'get', 
                asynchronous: options.asynchronous 
              }, 
              options.asynchronous ? { 
				        onComplete: Voy.Template.onAjaxComplete.bind( Voy.Template, url, options ),
		            onFailure: options.onFailure
              } : {} 
            )                
			  );
          
        if( ! options.asynchronous ) {
          if( request.success() ) {
            Voy.Template.onAjaxComplete( url, options, request.transport );
          } else {
            options.onFailure( request.transport );
          }
        }
	    }
    }
  },
  onAjaxComplete: function(url, options, transport) {
    var templates = Voy.Template.parseTemplates( url, transport.responseText );
    
    // Cache Template
    templates.each( function(template) { Voy.Template.add( template ); } );
    
    templates = Voy.Template.get(url);
    
    var loading = Voy.Template.loading[url];
    loading.each( function( options ) {
      options.onComplete(templates);
    } );
    loading.clear();
  },  
  variableCounter: 0,
  FixVariables: function( script ) {
    return script.replace( /jst/g, 'jst' + Voy.Template.variableCounter++ );
  },
  parseTemplates: function(url, str) {
    var tokenizer = new Voy.Tokenizer(str);
    tokenizer.addRegEx( /<jst\:template\s+id=["|'](.+?)["|']\s*?>/, "$1");
    tokenizer.addRegEx( /(<\/jst\:template>)/ );

    var templates = $A(), tokens = tokenizer.getTokens();
    var id = null, body = $A();
    
    for( var i = 0; i < tokens.length; i++ ) {
      if( Voy.isNotBlank( id ) )
        body.push( tokens[i].token );
      
      if( Voy.isNotBlank( tokens[i].replaced ) ) {
        // Look for begin and end template
	      if( "</jst:template>" == tokens[i].replaced ) {
	        if( Voy.isBlank( id ) )
	          alert( 'Warning:  <jst:template id="..." was not set' );
	        else
	          templates.push( new Voy.Template( body.join(""), id, url ) );
            
          id = null;
	      } else {
	        id = tokens[i].replaced;
	      }
        
        body.clear();
      }
    }
    return templates;
  }
} );


Voy.Template.prototype = 
{
  initialize: function(template, id, url) {
    this.id = id;
    this.url = url;
    
    var tokenizer = new Voy.Tokenizer(template);
    tokenizer.addRegEx( /<jst:script>([\s\S]+?)<\/jst:script>/, "$1\n" );
    
    // ${..} or #{..}
    tokenizer.addRegEx( /\$\{(.*?)\}/, "out.write( $1 );\n" );
    tokenizer.addRegEx( /\#\{(.*?)\}/, "out.write( $1 );\n" );

    //  <jst:for var="..." collection="..." varStatus="...">....</jst:for>
    tokenizer.addRegEx( /<jst:for var=['"]([a-zA-Z0-9_-]+?)['"][\s]*collection=['"](.*?)['"][\s]*varStatus=['"](.*?)['"][\s]*>/,
      '{\n' + 
      '  var $1_jstArray = Voy.toArray($2);\n' +
      '  var $3 = {current:$1_jstArray[0], index:0, count:$1_jstArray.length, first:true, last:false};\n' +
      '  for( var $1_jstIndex = 0; $1_jstIndex < $1_jstArray.length; $1_jstIndex++ ) {\n ' +
      '    var $1 = $1_jstArray[$1_jstIndex];\n' +
      '    $3.current = $1;\n' +
      '    $3.index = $1_jstIndex;\n' + 
      '    $3.first = ($1_jstIndex == 0);\n' + 
      '    $3.last = ($1_jstIndex == ($1_jstArray.length - 1));\n' );

    //  <jst:for var="..." collection="...">....</jst:for>
    tokenizer.addRegEx( /<jst:for var=['"]([a-zA-Z0-9_-]+?)['"][\s]*collection=['"](.*?)['"][\s]*>/,
      '{\n' + 
      '  var $1_jstArray = Voy.toArray($2);\n' +
      '  for( var $1_jstIndex = 0; $1_jstIndex < $1_jstArray.length; $1_jstIndex++ ) {\n ' +
      '    var $1 = $1_jstArray[$1_jstIndex];\n' );
    tokenizer.addRegEx( /<\/jst:for>/, '}\n}\n' );

    //  <jst:apply template="..." value="..." />
    tokenizer.addRegEx( /<jst:apply template=['"]([a-zA-Z0-9_-]+?)['"][\s]*value=['"](.*?)['"][\s]*\/>/, 
      'out.write( Voy.Template.transform( request.url, "$1", $2 ) );\n' );

    //  <jst:apply template="..." values="..." />
    tokenizer.addRegEx( /<jst:apply template=['"]([a-zA-Z0-9_-]+?)['"][\s]*values=['"](.*?)['"][\s]*\/>/, 
      'for( var i = 0; i < $2.length; i++ ) { out.write( Voy.Template.transform( request.url, "$1", $2[i] ) ); }\n' );
    
    // <jst:if test="...">...</jst:if>
    tokenizer.addRegEx( /<jst:if test=['"](.+?)['"][\s]*>/, 
       'if ($1) {' );
    tokenizer.addRegEx( /<\/jst:if>/, '}' );
    
    var script = $A();
    script.push( "{\n" );
    
    tokenizer.getTokens().each( function( t ) { 
      if( Voy.isNotBlank( t.token ) ) {
	      script.push( "out.write('" );
	      script.push( t.token.encodeJSString() );
	      script.push( "');\n" );
      }
      
      if( Voy.isNotBlank( t.replaced ) )
        script.push( t.replaced );
    } );
    
    script.push( "\n}" );
    this.script = script.join("");
    Voy.log( "info", this.script );
  },
  evaluate: function(context) {
    var out = this.createOut();
    
    try {
      // Create Method
      var fxn = new Function( "out", "request", "response", this.script );
      
	    try {
        // Call Method
        fxn.apply( context, new Array( out, { url: this.url }, { out: out } ) );
	    } catch(e) {
	      alert("Exception Thrown: " + e );
	    }
    } catch(e) {
      alert("Unable to create script:" + e + "\nScript:\n" + this.script);
    }

    return out.results.join("");
  },
  createOut: function() {
    return {
      results: $A(),
      add: function(arg) {
        this.results.push( this.format( arg ) );
      },
      format: function(arg) {
        if( arg && arg instanceof Date ) {
          arg = Voy.formatDate( arg );
        }
        return arg;
      },
      write: function() {
        for(var i = 0, len = arguments.length; i < len; i++ ) {
          this.add( arguments[i] );
        }
      },
      writeln: function() {
        this.write.apply( this, arguements );
      }
    };
  }
};



