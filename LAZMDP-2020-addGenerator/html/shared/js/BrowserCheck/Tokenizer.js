
Voy.Tokenizer = Class.create();
Object.extend( Voy.Tokenizer,
{
  format: function( str, formatArray ) {
    var tokenizer = new Voy.Tokenizer( str );
    for( var i = 0; i < formatArray.length; i++ ) { 
      var format = formatArray[i]
      tokenizer.addRegEx( format.match, format.replace );
    }
    return tokenizer.toString();
  },
  FORMAT_TEXT: 
  [
    { match: /(\r\n)/, replace: "<br>" },
    { match: /(\n)/, replace: "<br>" },
    { match: /(<)/, replace: "&lt;" },
    { match: /(>)/, replace: "&gt;" },
    { match: /( )/, replace: "&nbsp;" }
  ],
  formatText: function( str ) {
    return Voy.Tokenizer.format(str.trim(), Voy.Tokenizer.FORMAT_TEXT );
  },
  FORMAT_JS: 
  [
    { match: /(Voy\.[0-9A-Za-z]+)\.([0-9A-Za-z]+)/, replace: "<span class='js-voy-class'>$1</span>.<span class='js-voy-method'>$2</span>" },
    { match: /(Voy)\.([0-9A-Za-z]+)/, replace: "<span class='js-voy-class'>$1</span>.<span class='js-voy-method'>$2</span>" },
    { match: /(\/\/.*)/, replace: "<span class='js-comment'>$1</span>" },
    { match: /(<)/, replace: "&lt;", removeFromSearch: false },
    { match: /(>)/, replace: "&gt;", removeFromSearch: false },
    { match: /(".*?")/, replace: "<span class='js-literal-string'>$1</span>" },
    { match: /('.*?')/, replace: "<span class='js-literal-string'>$1</span>" },
    { match: /(var|new|function|for|while|break|return)(?![0-9A-Za-z])/, replace: "<span class='js-keyword'>$1</span>" },
    { match: /(document|body|window)(?![0-9A-Za-z])/, replace: "<span class='js-object'>$1</span>" },
    { match: /(innerHTML)(?![0-9A-Za-z])/, replace: "<span class='js-dom-attributes'>$1</span>" },
    { match: /([\(\)])/, replace: "<span class-='js-paren'>$1</span>" },
    { match: /([{}\[\]])/, replace: "<span class-='js-bracket'>$1</span>" },
    { match: /(?:[^A-Za-z_])([0-9\.]+)(?![_A-Za-z])/, replace: "<span class='js-literal-number'>$1</span>" },
    { match: /([A-Za-z_][A-Za-z0-9_]+):/, replace: "<span class='js-method'>$1</span>:" }
  ],
  formatJS: function( str ) {
    return Voy.Tokenizer.format(str.trim(), Voy.Tokenizer.FORMAT_JS.concat( Voy.Tokenizer.FORMAT_TEXT ) );
  },
  FORMAT_CSS: 
  [
    { match: /(\/\*[\s\S]*?\*\/)/, replace: "<span class='css-comment'>$1</span>" },
    { match: /(\.\S+\s*)(?![^{])/, replace: "<span class='css-classname'>$1</span>" },
    { match: /([\S]+)(?![^:])/, replace: "<span class='css-attribute'>$1</span>" }
  ],
  formatCSS: function( str ) {
    return Voy.Tokenizer.format( str.trim(), Voy.Tokenizer.FORMAT_CSS.concat( Voy.Tokenizer.FORMAT_TEXT ) );
  },
  FORMAT_HTML: 
  [
    { match: /(<)(\!--[\s\S]*--)(>)/m, replace: "<span class='html-comment'>&lt;$2&gt;</span>" },
    { match: /(\${.*?})/, replace: "<span class='html-jst-eval'>$1</span>" },
    { match: /(\@{.*?})/, replace: "<span class='html-jst-eval'>$1</span>" },
    { match: /<([\/]?jst:.*)>/m, replace: "<span class='html-jst-tag'>&lt;$1&gt;</span>" },
    { match: /(<)([a-zA-Z0-9:]+[\s]*)/, replace: "&lt;<span class='html-tag html-$2'>$2</span>" },
    { match: /<([\/]?)([^\s]+)>/, replace: "&lt;$1<span class='html-tag html-$2'>$2</span>&gt;" },
    { match: /([\s]*)([a-zA-Z0-9]+)(=[^\s]*)/, replace: "$1<span class='html-attribute'>$2</span>$3" }
  ],
  formatHTML: function( str ) {
    return Voy.Tokenizer.format( str.trim(), Voy.Tokenizer.FORMAT_HTML.concat( Voy.Tokenizer.FORMAT_TEXT ) );
  }
} );


Voy.Tokenizer.prototype = {
  initialize: function(str) {
    this.str = str;
    this.tokens = $A();
    this.tokens.push( { token: this.str, match: "", replaced: "" } );
  },
  addRegEx: function( regex, replacement, removeFromSearch ) {
    var options = this.options;
    removeFromSearch = Voy.isBlank( removeFromSearch ) ? true : removeFromSearch;
    
    var newTokens = [];
    for( var i = 0, iLen = this.tokens.length; i < iLen; i++ ) {
      var token = this.tokens[i];
      
      if( Voy.isBlank( token.token ) ) {
        newTokens.push( token );
      } else {
        var iTokens = token.token.tokenize( regex );
        var tokens =  ( removeFromSearch ? newTokens : [] );

        for( var j = 0, jLen = iTokens.length; j < jLen; j++ ) {
          iTokens[j].replaced = Voy.isBlank( replacement ) ? iTokens[j].match : iTokens[j].match.replace( regex, replacement );
          tokens.push( iTokens[j] );
        }
        
        // Add token.match to end of array
        newTokens.push( 
          { 
            token: removeFromSearch ? "" : this.toString( tokens ), 
            match: token.match, 
            replaced: token.replaced 
          } 
        );
      }
    }
    this.tokens = newTokens;
  
    return this;
  },
  addRegEx2: function( regex, replacement, removeFromSearch ) {
    var options = this.options;
    removeFromSearch = Voy.isBlank( removeFromSearch ) ? true : removeFromSearch;
    
    this.tokens = this.tokens.inject( [], function( tokens, token, index ) {
      if( Voy.isBlank( token.token ) ) {
        tokens.push( token );
      } else {
        var moreTokens = [];
        token.token.tokenize( regex ).collect( function(token) {
          token.replaced = Voy.isBlank( replacement ) ? token.match : token.match.replace( regex, replacement );
          moreTokens.push( token ); 
        } );
        moreTokens.push( { token: "", match: token.match, replaced: token.replaced } );
        
        if( removeFromSearch ) {
          tokens = tokens.concat( moreTokens );
        } else {
          token.token = this.toString( moreTokens );
        }
      }
      return tokens;
    } );
    
    return this;
  },
  getTokens: function() {
    return this.tokens;
  },
  toString: function(tokens) {
    tokens = ( tokens || this.tokens );
    
    return this.tokens.collect( function( token ) { 
      return token.token + ( token.replaced || "" );
    } ).join('');
  }
};
