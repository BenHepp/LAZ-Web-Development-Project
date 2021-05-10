Voy.BrowserCheck = Class.create();
Voy.BrowserCheckRequirements = Class.create();
Voy.BrowserCheckRequirements.Browser = Class.create();
Object.extend( Voy.BrowserCheckRequirements.Browser.prototype,
    {
        initialize: function( name, requirements ) {
            this.name = name;
            this.requirements = {
                versionMajor: null,
                versionMinor: null,
                os: null
            };
            this.requirements = Object.extend( this.requirements, requirements );
            if ( Voy.isNull( this.requirements.versionMajor ) ) {
                throw( "you must define the versionMajor" );
            }
        },
        validate: function() {
            var valid = true;
            if ( this.name != Voy.Env.Browser.browserName() ) {
                valid = false;
            } else {
                if ( this.requirements.os != null ) {
                    if ( Voy.Env.OS.baseOSName() == this.requirements.os ) {
                        if ( this.requirements.versionMajor > Voy.Env.Browser.version().major ) {
                            valid = false;
                        } else if ( this.requirements.versionMajor == Voy.Env.Browser.version().major ) {
                            if ( ! Voy.isNull( this.requirements.versionMinor ) && this.requirements.versionMinor > Voy.Env.Browser.version().minor ) {
                                valid = false;
                            }
                        }
                    } else {
                        valid = false;
                    }
                } else {
                    if ( this.requirements.versionMajor > Voy.Env.Browser.version().major ) {
                        valid = false;
                    } else if ( this.requirements.versionMajor == Voy.Env.Browser.version().major ) {
                        if ( ! Voy.isNull( this.requirements.versionMinor ) && this.requirements.versionMinor > Voy.Env.Browser.version().minor ) {
                            valid = false;
                        }
                    }
                }
            }
            return valid;
        }
    }
);
Voy.BrowserCheckRequirements.JavaScript = Class.create();
Object.extend( Voy.BrowserCheckRequirements.JavaScript.prototype,
    {
        initialize: function( name, requirements ) {
            this.name = name;
            this.requirements = {
                enabled: true
            };
        },
        validate: function() {
            return true;
        }
    }
);
Voy.BrowserCheckRequirements.OS = Class.create();
Object.extend( Voy.BrowserCheckRequirements.OS.prototype,
    {
        initialize: function( name, requirements ) {
            this.name = name;
            this.requirements = {
                version: null
            };
            this.requirements = Object.extend( this.requirements, requirements );
            if ( Voy.isNull( this.requirements.version ) ) {
                throw( "you must define the version" );
            }
        },
        validate: function() {
            var valid = false;
            this.requirements.version = $A( this.requirements.version );

            if ( this.name == Voy.Env.OS.baseOSName() ) {
                var osVersion = Voy.Env.OS.version();
                this.requirements.version.each( function( ver ) {
                    if ( ver == osVersion ) {
                        valid = true;
                        throw $break;
                    }
                });
            }
            return valid;
        }
    }
);
Voy.BrowserCheckRequirements.Resolution = Class.create();
Object.extend( Voy.BrowserCheckRequirements.Resolution.prototype,
    {
        initialize: function( requirements ) {
            this.requirements = {
                width: null,
                height: null
            };
            this.requirements = Object.extend( this.requirements, requirements );
            if ( Voy.isNull( this.requirements.height ) ) {
                throw( "you must define the height" );
            }
            if ( Voy.isNull( this.requirements.width ) ) {
                throw( "you must define the width" );
            }
        },
        validate: function() {
            var valid = false;
            if ( Voy.Env.Resolution.width >= this.requirements.width
                && Voy.Env.Resolution.height >= this.requirements.height ) {
                valid = true;
            }
            return valid;
        }
    }
);
Voy.BrowserCheckRequirements.Cookie = Class.create();
Object.extend( Voy.BrowserCheckRequirements.Cookie.prototype,
    {
        initialize: function() {},
        validate: function() {
            return Voy.Env.Browser.cookiesEnabled();
        }
    }
);
Voy.BrowserCheckRequirements.Acrobat = Class.create();
Object.extend( Voy.BrowserCheckRequirements.Acrobat.prototype,
    {
        initialize: function( requirements ) {
            this.requirements = {
                versionMajor: null,
                versionMinor: null
            };
            this.requirements = Object.extend( this.requirements, requirements );
            if ( Voy.isNull( this.requirements.versionMajor ) ) {
                throw( "you must define the versionMajor" );
            }
        },
        validate: function() {
            var valid = true;
            if ( Voy.Env.Acrobat.enabled() ) {
                var browserName = Voy.Env.Browser.browserName();
                if ( Voy.Env.OS.version() == 'Mac OS X' ) {
                    // MacOS X includes a native PDF viewer (Preview)
                    valid = true;
                } else if (browserName === 'Chrome' || browserName === 'Edge' || browserName === 'Firefox') {
                    // Some browsers have built-in PDF viewers
                    valid = true;
                } else if ( this.requirements.versionMajor > Voy.Env.Acrobat.version().major ) {
                    valid = false;
                } else if ( this.requirements.versionMajor == Voy.Env.Acrobat.version().major ) {
                    if ( ! Voy.isNull( this.requirements.versionMinor ) && this.requirements.versionMinor > Voy.Env.Acrobat.version().minor ) {
                        valid = false;
                    }
                }
            } else {
                valid = false;
            }
            return valid;
        }
    }
);
Object.extend( Voy.BrowserCheck.prototype,
    {
        initialize: function( options ) {
            this.options = {
                domId: Voy.BrowserCheck.DEFAULT_DOMID,
                template: Voy.BrowserCheck.DEFAULT_JST,
                imagePath: Voy.BrowserCheck.DEFAULT_IMG_PATH,
                orientation: Voy.BrowserCheck.DEFAULT_ORIENTATION,
                requirements: Voy.BrowserCheck.DEFAULT_REQS,
                displayOrder: Voy.BrowserCheck.DEFAULT_ORDER,
                recommend: Voy.BrowserCheck.DEFAULT_RECOMMEND,
                display: true
            };
            this.valid = true;
            this.options = Object.extend( this.options, options );
            this.options.displayOrder = $A( this.options.displayOrder );
            var self = this;

            try { // test for functionality
                var re = new RegExp( '(\${.*?})' );
                if ( this.options.display ) {
                    this.show();
                }
            } catch ( e ) {
                this.showInvalidBrowser();
            }
        },
        show: function() {
            Voy.Template.transform( this.options.template, 'bc', this, { div: this.options.domId } );
            // this adjusts for the 'validating' image
            if ( this.options.orientation == 'top' ) {
                $( this.options.domId ).style.top = ( parseInt( $( this.options.domId ).style.top ) + 50 ) + 'px';
            }
            // need to give the browser a chance to recognize the new DOM elements
            // setTimeout is broken on Safari < 1.2
            if ( Voy.Env.Browser.browserName() == 'Safari' && parseFloat( Voy.Env.Browser.version().asString() ) < 1.2 ) {
                this.showInvalidBrowser();
            } else {
                window.setTimeout( this.configureBC.bind( this ), 3000 );
            }
        },
        showInvalidBrowser: function() {
            $( this.options.domId ).innerHTML = '<a href=\'/common/bcMinimums.jsp\' target=\'_blank\'><img src=\'' + this.options.imagePath + 'invalid_environment.png\' height=\'80\' width=\'196\' border=\'0\' alt=\'Browser Check Failed\' title=\'Browser Check Failed\'/></a>'
        },
        configureBC: function() {
            if ( this.options.orientation == 'top' ) {
                $( 'bc-details' ).style.top = ( - $( 'bc-details' ).getHeight() + 1 ) + 'px';
            } else {
                $( 'bc-details' ).style.top = ( $( 'bc-bar' ).getHeight() + 1 ) + 'px';
            }
            // Automatic direct drop down should appear if validation fails.
            if ( !this.valid ) {
                $( 'bc-details' ).toggle();
                $( 'bc-openclose' ).replace('<span class="icon icon-minus" aria-hidden="true">');
                $( 'bc-bar' ).onclick = this.bcBarOnclick.bindAsEventListener( this );
            } else {
                $( 'bc-bar' ).onclick = this.bcBarOnclick.bindAsEventListener( this );
            }
            // .viewDetails and more being included from a JST template (BrowserCheck.jst)
            $('initialize').style.display='none';
            $('browserCheck').style.display='block';
            var self = this;
            this.options.displayOrder.each( function( property ) {
                new Voy.Tooltip( $( 'bc-' + property ), self.getTooltipHTML( property ), {effect: 'appear', viewport:true} );
            });
        },
        getTooltipHTML: function( property ) {
            var recommendation = this.options.recommend.get( property );
            var html = '<table border=\'0\' cellpadding=\'0\' cellspacing=\'0\'><col width=\'125\'/><col width=\'125\'/><col width=\'125\'/><col width=\'125\'/><tr><th>Category</th><th>PC</th><th>Mac</th><th>ChromeBook</th></tr>';
            html += '<tr><td class=\'description\'>';
            html += recommendation.category;
            html += '</td><td class=\'value\'>';
            html += recommendation.pc;
            html += '</td><td class=\'value\'>';
            html += recommendation.mac;
            html += '</td><td class=\'value\'>';
            html += recommendation.chromebook;
            html += '</td></tr></table>';
            return html;
        },

        // OLD event handler for drop down toggle icon styles
        // bcBarOnclick: function( event ) {
        //   $( 'bc-details' ).toggle();
        //   if ( $( 'bc-details' ).visible() ) {
        //     $( 'bc-openclose' ).src = this.options.imagePath + 'bc-minus.png';
        //   } else {
        //     $( 'bc-openclose' ).src = this.options.imagePath + 'bc-plus.png';
        //   }
        //},

        bcBarOnclick: function( event ) {
            $( 'bc-details' ).toggle();
            if ( $( 'bc-details' ).visible() ) {
                $( 'bc-openclose' ).removeClassName('icon-triangle-right').addClassName('icon-triangle-bottom');
            } else {
                $( 'bc-openclose' ).removeClassName('icon-triangle-bottom').addClassName('icon-triangle-right');
            }
        },


        getIcon: function( type ) {
            var icon = this.options.imagePath;
            switch ( type ) {
                case 'Browser':
                    icon += 'Browser-' + Voy.Env.Browser.browserName().replace( ' ', '' ) + '.png';
                    break;
                case 'OS':
                    icon += 'OS-' + Voy.Env.OS.osName().replace( ' ', '' ) + '.png';
                    break;
                case 'Resolution':
                    icon += 'Resolution.png';
                    break;
                case 'Cookie':
                    icon += 'Cookie.png';
                    break;
                case 'Acrobat':
                    icon += 'Acrobat.png';
                    break;
            }
            return icon;
        },
        getName: function( type ) {
            var name = 'unsupported';
            switch ( type ) {
                case 'Browser':
                    name = Voy.Env.Browser.browserName() + ' ' + Voy.Env.Browser.version().asString();
                    break;
                case 'OS':
                    name = Voy.Env.OS.version();
                    break;
                case 'Resolution':
                    name = Voy.Env.Resolution.asString();
                    break;
                case 'Cookie':
                    name = 'Cookies Enabled';
                    break;
                case 'Acrobat':
                    name = 'PDF Reader ' + Voy.Env.Acrobat.version().asString();
                    break;
            }
            return name;
        },
        validate: function( type ) {
            var icon = this.options.imagePath;
            var valid = false;
            if ( Voy.isDefined( type ) ) {
                this.options.requirements.each( function( requirement ) {
                    if ( requirement.type == type ) {
                        var passed = requirement.rules.invoke( 'validate' ).find( function( validated ) { return validated; } );
                        valid = Voy.isDefined( passed );
                    }
                });
                if ( valid ) {
                    icon += 'bc-pass.png';
                } else {
                    icon += 'bc-fail.png';
                    this.valid = false;
                }
            } else {
                // check everything
                var img;
                for ( var i = 0; i < this.options.displayOrder.length; i++ ) {
                    img += this.validate( this.options.displayOrder[ i ] );
                    if ( img.indexOf( 'critical' ) >= 0 ) {
                        this.valid = false;
                        break;
                    }
                }
                icon += ( this.valid ) ? 'bc-pass.png' : 'bc-fail.png';
            }
            return icon;
        }
    }
);
Object.extend( Voy.BrowserCheck,
    {
        functional: false,
        DEFAULT_DOMID: 'browserCheck',
        DEFAULT_JST: '/common/assets/scripts/BrowserCheck.jst',
        DEFAULT_IMG_PATH: '/common/assets/images/browserCheck/',
        DEFAULT_ORIENTATION: 'top',
        DEFAULT_REQS: $A( [
            {
                type: 'Browser',
                rules: $A( [ new Voy.BrowserCheckRequirements.Browser( 'Internet Explorer', {versionMajor: 11 } ),
                    new Voy.BrowserCheckRequirements.Browser( 'Edge', { versionMajor: 13, os: "Windows" } ),
                    new Voy.BrowserCheckRequirements.Browser( 'Mozilla', { versionMajor: 11 } ),
                    new Voy.BrowserCheckRequirements.Browser( 'Safari', { versionMajor: 9, versionMinor: 1, os: "Mac" } ),
                    new Voy.BrowserCheckRequirements.Browser( 'Chrome', { versionMajor: 49 } ),
                    new Voy.BrowserCheckRequirements.Browser( 'Firefox', { versionMajor: 52 } ) ] )
            },
            {
                type: 'OS',
                rules: $A( [ new Voy.BrowserCheckRequirements.OS( 'Windows', { version: [ 'Windows 7', 'Windows 8', 'Windows 10' ] } ),
                    new Voy.BrowserCheckRequirements.OS( 'Mac', { version: [ 'Mac OS X 10.9', 'Mac OS X 10.9.0', 'Mac OS X 10.9.1', 'Mac OS X 10.9.2', 'Mac OS X 10.9.3', 'Mac OS X 10.9.4', 'Mac OS X 10.9.5',
                        'Mac OS X 10.10', 'Mac OS X 10.10.0', 'Mac OS X 10.10.1', 'Mac OS X 10.10.2', 'Mac OS X 10.10.3', 'Mac OS X 10.10.4', 'Mac OS X 10.10.5',
                        'Mac OS X 10.11', 'Mac OS X 10.11.0', 'Mac OS X 10.11.1', 'Mac OS X 10.11.2', 'Mac OS X 10.11.3', 'Mac OS X 10.11.4', 'Mac OS X 10.11.5', 'Mac OS X 10.11.6',
                            'Mac OS X 10.12', 'Mac OS X 10.12.0', 'Mac OS X 10.12.1', 'Mac OS X 10.12.2', 'Mac OS X 10.12.3', 'Mac OS X 10.12.4', 'Mac OS X 10.12.5', 'Mac OS X 10.12.6',
                            'Mac OS X 10.13', 'Mac OS X 10.13.0', 'Mac OS X 10.13.1', 'Mac OS X 10.13.2', 'Mac OS X 10.13.3', 'Mac OS X 10.13.4' ] } ),
                    new Voy.BrowserCheckRequirements.OS( 'Linux', { version: [ 'Ubuntu', 'ChromeOS' ]   } ) ] )
            },
            {
                type: 'Resolution',
                rules: $A( [ new Voy.BrowserCheckRequirements.Resolution( { height:768, width:1024 } ) ] )
            },
            {
                type: 'Cookie',
                rules: $A( [ new Voy.BrowserCheckRequirements.Cookie() ] )
            },
            {
                type: 'JavaScript',
                rules: $A( [ new Voy.BrowserCheckRequirements.JavaScript( ) ] )
            },
            {
                type: 'Acrobat',
                rules: $A( [ new Voy.BrowserCheckRequirements.Acrobat( {versionMajor: 8 } ) ] )
            }
        ] ),
        DEFAULT_ORDER: $A( ['Browser', 'OS', 'Resolution', 'Cookie'] ),
        DEFAULT_RECOMMEND: $H({
            Browser:    { category: 'Minimum Internet Browser',
                pc:          'Internet Explorer 11.0<br/>Edge 13<br/>Firefox 52<br/>Chrome 49',
                mac:         'Firefox 52<br/>Chrome 49<br/>Safari 9.1',
                chromebook:  'Chrome 49'
            },
            OS:         { category: 'Minimum Operating System',
                pc:          'Windows 7',
                mac:         'OS 10.9',
                chromebook:  '7520'
            },
            Resolution: { category: 'Minimum Screen Resolution',
                pc:          '1024x768<sup>*</sup>',
                mac:         '1024x768<sup>*</sup>',
                chromebook:  '1024x768<sup>*</sup>'
            },
            Acrobat:    { category: 'PDF Settings',
                pc:          'Adobe Reader<sup>&reg;</sup> 10.0',
                mac:         'Built-in MAC PDF Reader or Adobe Reader<sup>&reg;</sup> 10.0',
                chromebook:  'Built-in PDF Viewer plugin'
            },
            Cookie:     { category: 'Browser Cookies',
                pc:          'Cookies must be enabled to experience this application.',
                mac:         'Cookies must be enabled to experience this application.',
                chromebook:  'Cookies must be enabled to experience this application.'
            }
        })
    }
);
