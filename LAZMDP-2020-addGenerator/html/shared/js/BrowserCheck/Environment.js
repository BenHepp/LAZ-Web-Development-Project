Voy.Env = Class.create();
Object.extend( Voy.Env, 
  {
    Resolution: Class.create(),
    Browser: Class.create(),
    OS: Class.create(),
    Acrobat: Class.create()
  }
);
Voy.Env.Version = Class.create();
Object.extend( Voy.Env.Version.prototype, 
  {
    initialize: function( versionArray ) {
      this.versionArray = Voy.isDefined( versionArray ) ? $A( versionArray ) : $A();
      this.major = '';
      this.minor = '';
      this.rev = '';
      var self = this;
      var minorSet = false;
      versionArray.each( function(item, index) { 
        switch (index) {
          case 0:
            self.major = item;
            break;
          case 1:
            if ( item != '.' ) {
              self.minor = item;
              minorSet = true;
            }
            break;
          case 2:
            if ( ! minorSet ) {
              self.minor = item;
            } else {
              self.rev += item;
            }
          case 3:
            break;
          default:
            self.rev += item;
        }
      }); 
    },
    asString: function() {
      return this.versionArray.join( '' );
    }
  }
);
Object.extend( Voy.Env.Version, {
  getVersionArray: function( versionString ) {
    var versionArray = $A();
    var currentChar;
    if ( Voy.isDefined( versionString ) ) {
      var currentCharX = "";
  	  for ( var i = 0; i < versionString.length; i++ ) {
  	    currentChar = versionString.charAt( i );
  	    if (currentChar == ".") {
  	      versionArray.push( currentCharX );
          versionArray.push( currentChar );
  	      currentCharX = "";
  	    } else {
          currentCharX = currentCharX + currentChar;
  	    }
	    }
  	  if (currentCharX!="") { versionArray.push( currentCharX ); }
    }
    return versionArray;
  }
});
Object.extend( Voy.Env.Resolution, 
  {
    width: screen.width,
    height: screen.height,
    asString: function() {
      return Voy.Env.Resolution.width + 'x' + Voy.Env.Resolution.height;
    }
  }
);
Object.extend( Voy.Env.Browser, 
  {
    _browser: null,
    _version: null,
    javaScriptEnabled: function() {
      return true; // would not be able to see these results otherwise ;)
    },
    cookiesEnabled: function() {
      return navigator.cookieEnabled;
    },
    browserName: function() {
      if ( Voy.isNull( Voy.Env.Browser._browser ) ) {
        Voy.Env.Browser._browser = Voy.Env.Browser.getBrowser();
  	  }
      return Voy.Env.Browser._browser.identity || 'unsupported browser';
    },
    version: function() {
      if ( Voy.Env.Browser._version == null ) {
        if ( Voy.isNull( Voy.Env.Browser._browser ) ) {
          Voy.Env.Browser._browser = Voy.Env.Browser.getBrowser();
        }
        var versionArray = Try.these( function() {return Voy.Env.Browser.getVersion( Voy.Env.Browser._browser, navigator.appVersion )},
                                      function() {return Voy.Env.Browser.getVersion( Voy.Env.Browser._browser, navigator.userAgent )} 
                                    ) || [ 'unsupported version' ];
        Voy.Env.Browser._version = new Voy.Env.Version( versionArray );
      }
      return Voy.Env.Browser._version;
    },
    getVersion: function( browser, searchIn ) {
      var searchFor = browser.versionSearch || browser.identity;
      var index = searchIn.indexOf( searchFor );
      if ( index == -1 ) { 
        throw exception;
      };
      var version = $A();
      if(searchFor == "Safari"){
    	  var previousChar = null;
    	  for ( var i = index - 2; i > -1; i-- ) {
            var currentChar = searchIn.charAt( i );
            if ( currentChar == '.' || ! isNaN( parseInt( currentChar ) ) ) {
              if((previousChar == null) || (previousChar == '.') || (currentChar == '.')){
              	version.push( currentChar );
              }
              else {
               	version[version.length - 1] = version[version.length - 1] + currentChar;
              }
              previousChar = currentChar;
            } else {
              version.reverse();
              break;
            }
          }
      }
      else {
          var previousChar = null;
          for ( var i = index + searchFor.length + 1; i < searchIn.length; i++ ) {
            var currentChar = searchIn.charAt( i );
           
            if ( currentChar == '.' || ! isNaN( parseInt( currentChar ) ) ) {
              if((previousChar == null) || (previousChar == '.') || (currentChar == '.')){
            	version.push( currentChar );
              }
              else {
            	version[version.length - 1] = version[version.length - 1] + currentChar;
              }
              previousChar = currentChar;
            } else {
              break;
            }
          }
      }
      if ( Voy.isDefined( browser.buildVersionMatrix ) ) {
        var buildVersion = version.join( '' );
        browser.buildVersionMatrix.each( function( matrixItem ) {
          if ( matrixItem.build == buildVersion ) {
            version = Voy.Env.Version.getVersionArray( matrixItem.version );
          }
        });
      }
      return version;
    },
    getBrowser: function() {
      var browsers = Voy.Env.Browser.browsers;
      for ( var i = 0; i < browsers.length; i++ ) {
        var identifier = browsers[ i ].identifier;
        var property = browsers[ i ].property;
        if ( Voy.isDefined( identifier ) ) {
          if ( identifier.toLowerCase().indexOf( browsers[ i ].subString.toLowerCase() ) != -1 ) {
            return browsers[ i ];
          }
        } else if ( Voy.isDefined( property ) ) {
          return browsers[ i ];
        }
      }
    },
    browsers: [
      // Edge lists Chrome in its user agent string so we have to check for Edge first
      { identifier: navigator.userAgent,
        subString: "Edge",
        identity: "Edge",
        versionSearch: "Edge"
      },
      //	September 2012, want the LAZ/RAZ Validate system requirements to support Chrome.
	  //	But the navigator.userAgent for Chrome looks like
	  //
	  //	"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.89 Safari/537.1"
	  //
	  //	That is, it contains both the words "Chrome" and "Safari". We can either change the logic of the above function,
	  //	so it has a specific test for Chrome before any other test, or we can do as I have done here: put Chrome first.
	  //	N.B.: the reverse problem does not occur: the .userAgent for Safari does not contain "Chrome"
	  { identifier: navigator.userAgent,
		subString: "Chrome",
		identity: "Chrome"
	  },
      { identifier: navigator.userAgent,
        subString: "Safari",
        identity: "Safari",
        versionSearch: "Safari",
        buildVersionMatrix: $A([
                         {build:'85.5',     version:'1.0',   osVersion:'10.2.8'},
                         {build:'85.7',     version:'1.0.2', osVersion:'10.2.8'},
                         {build:'85.8',     version:'1.0.3', osVersion:'10.2.8'},
                         {build:'85.8.1',   version:'1.0.3', osVersion:'10.2.8'},
                         {build:'100',      version:'1.1',   osVersion:'10.3'},
                         {build:'100.1',    version:'1.1.1', osVersion:'10.3.2'},
                         {build:'125.7',    version:'1.2.2', osVersion:'10.3.4'},
                         {build:'125.8',    version:'1.2.2', osVersion:'10.3.4'},
                         {build:'125.9',    version:'1.2.3', osVersion:'10.3.5'},
                         {build:'125.11',   version:'1.2.4', osVersion:'10.3.6'},
                         {build:'125.12',   version:'1.2.4', osVersion:'10.3.6'},
                         {build:'312',      version:'1.3',   osVersion:'10.3.9'},
                         {build:'312.3',    version:'1.3.1', osVersion:'10.3.9'},
                         {build:'312.3.1',  version:'1.3.1', osVersion:'10.3.9'},
                         {build:'312.5',    version:'1.3.2', osVersion:'10.3.9'},
                         {build:'312.6',    version:'1.3.2', osVersion:'10.3.9'},

                         {build:'412',      version:'2.0',   osVersion:'10.4'},
                         {build:'412.2',    version:'2.0',   osVersion:'10.4.2'},
                         {build:'412.2.2',  version:'2.0',   osVersion:'10.4.2'},
                         {build:'412.5',    version:'2.0.1', osVersion:'10.4.2'},
                         {build:'416.12',   version:'2.0.2', osVersion:'10.4.3'},
                         {build:'416.13',   version:'2.0.2', osVersion:'10.4.3'},
                         {build:'417.8',    version:'2.0.3', osVersion:'10.4.5'},
                         {build:'417.9.2',  version:'2.0.3', osVersion:'10.4.5'},
                         {build:'417.9.3',  version:'2.0.3', osVersion:'10.4.6'},
                         {build:'419.3',    version:'2.0.4', osVersion:'10.4.7'},
                         {build:'522.12',   version:'3.02',  osVersion:'10.4.10'},
                         {build:'525.22',   version:'3.1.2', osVersion:'10.4.11'},

                         {build:'523.1',    version:'3.0.4', osVersion:'10.5'},
                         {build:'523.1',    version:'3.0.4', osVersion:'10.5.1'},

                         {build:'522.13.1', version:'3.0.2', osVersion:'XP/Vista'},
                         {build:'525.21',   version:'3.1.2', osVersion:'XP/Vista'}
                       ])
                       // http://developer.apple.com/internet/safari/uamatrix.html
                       // http://www.seehowitruns.org/pages/web_browsers.php?records=45&search=Safari&field=browser_name
                       // https://addons.mozilla.org/en-US/firefox/search?q=user+agent&cat=all
                         // http://chrispederick.com/work/useragentswitcher/
      },
      { property: window.opera,
        identity: "Opera"
      },
      { identifier: navigator.vendor,
        subString: "KDE",
        identity: "Konqueror"
      },
      { identifier: navigator.userAgent,
        subString: "Firefox",
        identity: "Firefox"
      },
      { identifier: navigator.vendor,
        subString: "Camino",
        identity: "Camino"
      },
      { identifier: navigator.userAgent,
        subString: "Netscape",
        identity: "Netscape"
      },
      { identifier: navigator.userAgent,
        subString: "MSIE",
        identity: "Internet Explorer",
        versionSearch: "MSIE"
      },
      // (SM) entry below is for IE11+, it omits "MSIE" in favor of "rv"
      { identifier: navigator.userAgent,
        subString: "trident",
        identity: "Internet Explorer",
        versionSearch: "rv"
      },   
      { identifier: navigator.userAgent,
        subString: "Gecko",
        identity: "Mozilla",
        versionSearch: "rv"
      },
      { identifier: navigator.userAgent,
        subString: "Mozilla",
        identity: "Netscape",
        versionSearch: "Mozilla"
      }
    ],
    isMSIE: function() {
      return (
        Voy.Env.Browser.browserName()=="MSIE" ||
        Voy.Env.Browser.browserName().substr(0,8)=="Internet"
      )
    },
    isFirefox: function() {
      return Voy.Env.Browser.browserName()=="Firefox";
    },
    isSafari: function() {
      return Voy.Env.Browser.browserName()=="Safari";
    },
    isChrome: function() {
        return Voy.Env.Browser.browserName()=="Chrome";
    },
    isOpera: function() {
      return Voy.Env.Browser.browserName()=="Opera";
    },
    isKonqueror: function() {
      return Voy.Env.Browser.browserName()=="Konqueror";
    },
    isCamino: function() {
      return Voy.Env.Browser.browserName()=="Camino";
    },
    isMozilla: function() {
      return Voy.Env.Browser.browserName()=="Mozilla";
    },
    isNetscape: function() {
      return Voy.Env.Browser.browserName()=="Netscape";
    },
    isEdge: function() {
      return Voy.Env.Browser.browserName()=="Edge";
    }
  }
);
Object.extend( Voy.Env.OS,
  {
    _os: null,
    baseOSName: function() {
      Voy.Env.OS._os = Voy.Env.OS._os || Voy.Env.OS.getOS();
      return Voy.Env.OS._os && Voy.Env.OS._os.identity || 'unsupported os';
    },
    osName: function() {
      var baseName = Voy.Env.OS.baseOSName();
      if ( baseName == 'Linux' && Voy.Env.OS.getVersion( Voy.Env.OS._os ) == 'ChromeOS' ) {
        return 'ChromeOS';
      }
      return baseName;
    },
    version: function() {
      if ( Voy.Env.OS._os == null ) {
        Voy.Env.OS._os = Voy.Env.OS.getOS();
      }
      return Voy.Env.OS.getVersion( Voy.Env.OS._os );
    },
    getOS: function() {
      var oses = Voy.Env.OS.oses;
      for ( var i = 0; i < oses.length; i++ ) {
        var identifier = oses[ i ].identifier;
        var property = oses[ i ].property;
        if ( Voy.isDefined( identifier ) ) {
          if ( identifier.toLowerCase().indexOf( oses[ i ].subString.toLowerCase() ) != -1 ) {
            return oses[ i ];
          }
        } else if ( Voy.isDefined( property ) ) {
          return oses[ i ];
        }
      }
    },
    getVersion: function( os ) {
      var osVersion = null;
      if (os != null) {
	    os.versions.each( function( version ) {
	      version.subStrings.each( function( subString ) {
	        if ( navigator.userAgent.toLowerCase().indexOf( subString.toLowerCase() ) >= 0 ) {
	          osVersion = version.name;
	          throw $break;
	        }
	      });
	      if ( osVersion != null ) {
	        throw $break;
	      }
	    });
	    if ( osVersion == null ) {
	      osVersion = "unsupported version";
	    }	      
      }else {
    	osVersion = "unsupported version";
      }
      return osVersion;
    },
    oses : [
      { identifier: navigator.platform,
        subString: "Win",
        identity: "Windows",
        versionSearch: navigator.userAgent,
        versions: $A([
          { name: "Windows 98", subStrings: $A( [ "win98", "windows 98" ] ) },
          { name: "Windows ME", subStrings: $A( [ "Win 9x 4.90" ] ) },
          { name: "Windows 2000", subStrings: $A( [ "windows nt 5.0", "windows 2000" ] ) },
          { name: "Windows XP", subStrings: $A( [ "windows nt 5.1", "windows xp" ] ) },
          { name: "Windows 7", subStrings: $A( [ "windows nt 6.1", "windows 7" ] ) },
          { name: "Windows 8", subStrings: $A( [ "windows nt 6.2", "windows 8" ] ) },
          { name: "Windows Vista", subStrings: $A( [ "windows nt 6", "windows vista" ] ) },
          { name: "Windows 10", subStrings: $A( [ "windows nt 10", "windows 10" ] ) }
        ])
      },
      { identifier: navigator.platform,
        subString: "Mac",
        identity: "Mac",
        versionSearch: navigator.userAgent,
        versions: $A([
          { name: "Mac OS X 10.12", subStrings: $A( [ "mac os x 10_12", "mac os x 10.12" ] ) },
          { name: "Mac OS X 10.11.6", subStrings: $A( [ "mac os x 10_11_6" ] ) },
          { name: "Mac OS X 10.11.5", subStrings: $A( [ "mac os x 10_11_5" ] ) },
          { name: "Mac OS X 10.11.4", subStrings: $A( [ "mac os x 10_11_4" ] ) },
          { name: "Mac OS X 10.11.3", subStrings: $A( [ "mac os x 10_11_3" ] ) },
          { name: "Mac OS X 10.11.2", subStrings: $A( [ "mac os x 10_11_2" ] ) },
          { name: "Mac OS X 10.11.1", subStrings: $A( [ "mac os x 10_11_1" ] ) },
          { name: "Mac OS X 10.11", subStrings: $A( [ "mac os x 10_11", "mac os x 10.11" ] ) },
          { name: "Mac OS X 10.10.5", subStrings: $A( [ "mac os x 10_10_5" ] ) },
          { name: "Mac OS X 10.10.4", subStrings: $A( [ "mac os x 10_10_4" ] ) },
          { name: "Mac OS X 10.10.3", subStrings: $A( [ "mac os x 10_10_3" ] ) },
          { name: "Mac OS X 10.10.2", subStrings: $A( [ "mac os x 10_10_2" ] ) },
          { name: "Mac OS X 10.10.1", subStrings: $A( [ "mac os x 10_10_1" ] ) },
          { name: "Mac OS X 10.10", subStrings: $A( [ "mac os x 10_10", "mac os x 10.10" ] ) },
          { name: "Mac OS X 10.9.5", subStrings: $A( [ "mac os x 10_9_5" ] ) },
          { name: "Mac OS X 10.9.4", subStrings: $A( [ "mac os x 10_9_4" ] ) },
          { name: "Mac OS X 10.9.3", subStrings: $A( [ "mac os x 10_9_3" ] ) },
          { name: "Mac OS X 10.9.2", subStrings: $A( [ "mac os x 10_9_2" ] ) },
          { name: "Mac OS X 10.9.1", subStrings: $A( [ "mac os x 10_9_1" ] ) },
          { name: "Mac OS X 10.9", subStrings: $A( [ "mac os x 10_9", "mac os x 10.9" ] ) },
          { name: "Mac OS X 10.8.5", subStrings: $A( [ "mac os x 10_8_5" ] ) },
          { name: "Mac OS X 10.8.4", subStrings: $A( [ "mac os x 10_8_4" ] ) },
          { name: "Mac OS X 10.8.3", subStrings: $A( [ "mac os x 10_8_3" ] ) },
          { name: "Mac OS X 10.8.2", subStrings: $A( [ "mac os x 10_8_2" ] ) },
          { name: "Mac OS X 10.8", subStrings: $A( [ "mac os x 10_8", "mac os x 10.8" ] ) },
          { name: "Mac OS X 10.7.5", subStrings: $A( [ "mac os x 10_7_5" ] ) },
          { name: "Mac OS X 10.7.3", subStrings: $A( [ "mac os x 10_7_3" ] ) },
          { name: "Mac OS X 10.7.2", subStrings: $A( [ "mac os x 10_7_2" ] ) },
          { name: "Mac OS X 10.7", subStrings: $A( [ "mac os x 10_7", "mac os x 10.7" ] ) },                       
          { name: "Mac OS X 10.6.8", subStrings: $A( [ "mac os x 10_6_8" ] ) },
          { name: "Mac OS X 10.6.7", subStrings: $A( [ "mac os x 10_6_7" ] ) },
          { name: "Mac OS X 10.6.6", subStrings: $A( [ "mac os x 10_6_6" ] ) },
          { name: "Mac OS X 10.6.5", subStrings: $A( [ "mac os x 10_6_5" ] ) },
          { name: "Mac OS X 10.6.4", subStrings: $A( [ "mac os x 10_6_4" ] ) },
          { name: "Mac OS X 10.6.3", subStrings: $A( [ "mac os x 10_6_3" ] ) },
          { name: "Mac OS X 10.6.2", subStrings: $A( [ "mac os x 10_6_2" ] ) },
          { name: "Mac OS X 10.6.1", subStrings: $A( [ "mac os x 10_6_1" ] ) },
          { name: "Mac OS X 10.6", subStrings: $A( [ "mac os x 10_6", "mac os x 10.6" ] ) },                     
          { name: "Mac OS X 10.5.8", subStrings: $A( [ "mac os x 10_5_8" ] ) },
          { name: "Mac OS X 10.5.7", subStrings: $A( [ "mac os x 10_5_7" ] ) },
          { name: "Mac OS X 10.5.6", subStrings: $A( [ "mac os x 10_5_6" ] ) },
          { name: "Mac OS X 10.5.4", subStrings: $A( [ "mac os x 10_5_4" ] ) },
          { name: "Mac OS X 10.5.3", subStrings: $A( [ "mac os x 10_5_3" ] ) },
          { name: "Mac OS X 10.5.2", subStrings: $A( [ "mac os x 10_5_2" ] ) },
          { name: "Mac OS X 10.5", subStrings: $A( [ "mac os x 10_5", "mac os x 10.5" ] ) },
          { name: "Mac OS X 10.4.11", subStrings: $A( [ "mac os x 10_4_11" ] ) },
          { name: "Mac OS X 10.4", subStrings: $A( [ "mac os x 10_4" ] ) },
          { name: "Mac OS X", subStrings: $A( [ "mac os x" ] ) },
          { name: "Mac PowerPC", subStrings: $A( [ "mac_powerpc" ] ) },
          { name: "Mac", subStrings: $A( [ "mac" ] ) }
        ])
      },
      { identifier: navigator.platform,
        subString: "Linux",
        identity: "Linux",
        versionSearch: navigator.userAgent,
        versions: $A([
          { name: "Ubuntu", subStrings: $A( [ "Ubuntu" ] ) },
          { name: "ChromeOS", subStrings: $A( [ "CrOS" ] ) }
        ])
      },
      { identifier: navigator.platform,
  	    subString: "iPhone",
  	    identity: "iPhone",
  	    versionSearch: navigator.userAgent,
  	    versions: $A([
  	      { name: "iPhone OS 4", subStrings: $A( [ "OS 4" ] ) },
  	      { name: "iPhone OS 3", subStrings: $A( [ "OS 3" ] ) }
  	    ])
  	  }      
    ]  
  }
);
Object.extend( Voy.Env.Acrobat, {
    _version: null,
    enabled: function() {
      if ( Voy.isNull( Voy.Env.Acrobat._version ) ) {
        Voy.Env.Acrobat.getVersion();
      }
      return ( ! Voy.isNull( Voy.Env.Acrobat._version ) && Voy.Env.Acrobat._version.asString() != 'not installed' );
    },
    version: function() {
      if ( Voy.isNull( Voy.Env.Acrobat._version ) ) {
        Voy.Env.Acrobat.getVersion();
      }
      return Voy.Env.Acrobat._version;
    },
    getVersion: function() {
      Voy.Env.Acrobat._version = Try.these(
        function() { if ( ! Voy.isNull( new ActiveXObject( 'AcroPDF.PDF.1' ) ) ) { return new Voy.Env.Version( Voy.Env.Version.getVersionArray( 'Installed' ) ); } },
        function() { if ( ! Voy.isNull( new ActiveXObject( 'PDF.PdfCtrl.1' ) ) ) { return new Voy.Env.Version( Voy.Env.Version.getVersionArray( '4.0' ) ); } },
        function() { if ( ! Voy.isNull( new ActiveXObject( 'PDF.PdfCtrl.2' ) ) ) { return new Voy.Env.Version( Voy.Env.Version.getVersionArray( '2.0' ) ); } },
        function() { if ( ! Voy.isNull( new ActiveXObject( 'PDF.PdfCtrl.3' ) ) ) { return new Voy.Env.Version( Voy.Env.Version.getVersionArray( '3.0' ) ); } },
        function() { if ( ! Voy.isNull( new ActiveXObject( 'PDF.PdfCtrl.4' ) ) ) { return new Voy.Env.Version( Voy.Env.Version.getVersionArray( '4.0' ) ); } },
        function() { if ( ! Voy.isNull( new ActiveXObject( 'PDF.PdfCtrl.5' ) ) ) { return new Voy.Env.Version( Voy.Env.Version.getVersionArray( '5.0' ) ); } },
        function() { if ( ! Voy.isNull( new ActiveXObject( 'PDF.PdfCtrl.6' ) ) ) { return new Voy.Env.Version( Voy.Env.Version.getVersionArray( '6.0' ) ); } },
		function () {
          if ( Voy.Env.Browser.isEdge() ) {
            return new Voy.Env.Version( ['Installed'] );
          }
		  var version = '0.0';
	      if (navigator.plugins && navigator.plugins.length) {
			for ( var i = 0; i < navigator.plugins.length; i++ ) {
				var filename = navigator.plugins[i].filename;
				if ( filename.indexOf('nppdf32') != -1 ) {
					// netscape-style plugin
					version = navigator.plugins[i].version.split('.').slice(0,2).join('.')
				} else if ( filename.indexOf('pdf-viewer') != -1 ) {
					// chrome plugin -- version is not expressed anywhere in the plugin metadata
					version = 'Installed';
				}
			}
			if((version == '0.0') && (Voy.Env.OS.osName() == 'Mac' )){ // one last check to see if it is OS X before indicating PDF is not installed
              return new Voy.Env.Version( ['Installed'] );
            }
			return new Voy.Env.Version( Voy.Env.Version.getVersionArray( version ) );
		  }
          if ( Voy.Env.OS.osName() == 'Mac' ) { // one last check to see if it is OS X before indicating PDF is not installed
            return new Voy.Env.Version( ['Installed'] );
          }
          return new Voy.Env.Version( ['not installed'] );
        }
      );
    }
  }
);
