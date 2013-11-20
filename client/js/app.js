;(function() {
	"use strict";

    // window.requestAnimFrame = (function(){
    //     return window.requestAnimationFrame ||
    //         window.webkitRequestAnimationFrame ||
    //         window.mozRequestAnimationFrame;
    // })();

    // if ( !window.requestAnimFrame ) {
    //     window.requestAnimFrame = function( callback ) {
    //         window.setTimeout(callback, 1000 / 30);
    //     };
    // }

    var Config = {
        SERVER_ADDR : 'http://144.76.114.228',
        PLANE_SIZE : 800,
        GRID_SIZE : 50,
        SPEED : 50,
        FRAME_WIDTH : 64,
        FRAME_HEIGHT : 64,
        LEFT : 0,
        RIGHT : 1,
        UP : 3,
        DOWN : 0,
        SCALE : 1,
        FRAMES : 9
    };

    var Rocket = new Image();
    Rocket.src = 'asset/rocket.png';

    var Cloud1 = new Image();
    Cloud1.src = 'asset/cloud-big-white.png';
    var Cloud2 = new Image();
    Cloud2.src = 'asset/cloud1.png';
    var Cloud3 = new Image();
    Cloud3.src = 'asset/cloud2.png';

    var Logo = new Image();
    Logo.src = 'asset/brainly.png';

    var Helper = {
        random : function( min, max ) {
            return Math.round( min + Math.random() * max );
        },
        randomColor : function() {
            return "#" + ( ( 1<<24 ) * Math.random() | 0 ).toString( 16 );
        },
        randomName : function() {
            return 'Luki ' + Pro() + ' ' + this.random(1,9999);
        }
    };

    function Pro() {
        var a = [
            'the Great',
            'the Villain',
            'the Maiden',
            'the King',
            'the Knight',
            'the Lover',
            'the Horse',
            'the Peasant',
            'the Programmer',
            'the Cook',
            'the Priest',
            'the Mystery Man',
            'the Zombie'
        ];

        return a[ Helper.random(0, a.length - 1 )];
    }

    function Player(x,y,name,color,ctrl) {
        this.x = x;
        this.y = y;
        this._name = name;
        this.color = color || Helper.randomColor();
        this.me = ctrl || false;

        this.pos = Config.DOWN;

        this.sprite = new Image();
        this.sprite.src = "asset/qqq.png";
        this.charX = 0;
        this.charY = 0; //Helper.random(0,1);
        this.spriteFrame = 0;
        this.lastUpdate = 0;
    }

    Player.prototype = {
        serialize : function() {
            return {
                'name' : this._name,
                'color' : this.color,
                'x' : this.x,
                'y' : this.y
            }
        },
        update : function( x, y ) {

            if ( this.me ) {
                return;
            }

            if ( typeof x !== 'undefined' ) {

                if ( x > this.x ) {
                    this.pos = Config.RIGHT;
                } else if ( x < this.x ) {
                    this.pos = Config.LEFT;
                }

                this.x = x;
            }
            if ( typeof y !== 'undefined' ) {

                if ( y > this.y ) {
                    // this.pos = Config.DOWN;
                } else if ( y < this.y ) {
                    // this.pos = Config.UP;
                }

                this.y = y;
            }

            if( this.spriteFrame < Config.FRAMES ) {
                this.spriteFrame++;
            } else {
                this.spriteFrame = 0;
            }
        },
        moveRight : function() {

            if( this.pos === Config.RIGHT && this.spriteFrame < Config.FRAMES ) {
                this.spriteFrame++;
            } else {
                this.spriteFrame = 0;
            }

            this.x += Config.SPEED;
            this.pos = Config.RIGHT;
        },
        moveLeft : function() {

            if( this.pos === Config.LEFT && this.spriteFrame < Config.FRAMES ) {
                this.spriteFrame++;
            } else {
                this.spriteFrame = 0;
            }

            this.x -= Config.SPEED;
            this.pos = Config.LEFT;
        },
        moveUp : function() {

            if( /* this.pos === Config.UP && */ this.spriteFrame < Config.FRAMES ) {
                this.spriteFrame++;
            } else {
                this.spriteFrame = 0;
            }

            this.y -= Config.SPEED;
            // this.pos = Config.UP;
        },
        moveDown : function() {

            if( /* this.pos === Config.DOWN  && */ this.spriteFrame < Config.FRAMES ) {
                this.spriteFrame++;
            } else {
                this.spriteFrame = 0;
            }

            this.y += Config.SPEED;
            // this.pos = Config.DOWN;  
        },
        render : function( context ) {
            // context.beginPath();
            // context.rect( this.x, this.y, Config.GRID_SIZE, Config.GRID_SIZE);
            // context.closePath();
            // context.fillStyle = this.color;
            // context.fill();
            // context.stroke();
                
            context.drawImage( this.sprite, 
                this.charX * 96 + (this.spriteFrame * Config.FRAME_WIDTH),
                this.charY * 96 + (this.pos * Config.FRAME_HEIGHT),
                Config.FRAME_WIDTH,
                Config.FRAME_HEIGHT, 
                this.x, this.y,
                Config.GRID_SIZE, 
                Config.GRID_SIZE
            );

            context.fillStyle = '#222';
            context.font = 'italic bold 18px sans-serif';
            context.textBaseline = 'bottom';
            context.fillText( this._name, this.x + Config.GRID_SIZE, this.y);

            if ( this.lastUpdate < 1 ) {
                this.lastUpdate++;
            } else {
                this.lastUpdate = 0;

                if( this.spriteFrame < Config.FRAMES ) {
                    this.spriteFrame++;
                } else {
                    this.spriteFrame = 0;
                }
            }
        }
    }

    window.Game = {
        $canvas : null,
        context : null,
        socket : null,
        player : null,
        now : 0,
        last : 0,
        delta : 0,
        rocket : {
            x : -100,
            y : 1000,
            stop : false
        },
        scene : {
            children : [],
            find : function( name ) {
                var l = this.children.length;

                for( var i = 0; i < l; i++ ) {
                    if ( this.children[i]._name === name ) {
                        return this.children[i];
                    }
                }
                return null;
            }
        },
        pilot : function( player ) {
            var self = this;
            this.player = player;

            this.initNetwork();
            this.pilotControls();
        },
        initialize : function( player ) {
            this.$canvas = $('#canvas');
            this.context = this.$canvas[0].getContext('2d');
            this.player = player;
            this.$console = $('#console select');

            this.setupScene();
            this.initNetwork();
            this.setupControls();
        },
        console : function( message ) {
            var val = this.$console.find('option').length;

            this.$console
                .append( $('<option>').val( val ).text( message ) )
                .val( val );
        },
        initNetwork : function() {
            var self = this;

            if ( this.player ) {
                this.socket = io.connect( Config.SERVER_ADDR, {
                    port : '7878',
                    'transports' : ['websocket', 'xhr-polling'],
                    'reconnection delay' : 10000,
                    'reconnection limit': 10,
                    'max reconnection attempts': 11
                } );

                this.socket.on('connect', function ( data ) {
                    self.scene.children = [];

                    self.console( 'Połączony! Grasz jako ' + self.player._name );
                    self.scene.children.push( self.player );
                    self.socket.emit('player.new', self.player.serialize() );
                });

                this.socket.on('disconnect', function ( data ) {
                    
                    self.console( 'Zostałeś rozłączony!' );
                });

                this.socket.on('player.all', function ( data ) {

                    var l = data.length;

                    for ( var i = 0; i < l; i++ ) {
                        if ( !self.scene.find( data[i].name ) ) {
                            var pla = new Player( data[i].x, data[i].y, data[i].name, data[i].color );
                            self.scene.children.push( pla );    
                        }
                    }
                });
                this.socket.on('player.bye', function ( data ) {
                    var pla = self.scene.find( data.name );
                    
                    if ( pla ) {
                        self.console( data.name + ' wyszedł');
                        self.scene.children.splice( self.scene.children.indexOf( pla ), 1);
                    }
                });

                this.socket.on('player.update', function ( data ) {
                    var pla = self.scene.find( data.name );
                    
                    if ( !pla ) {
                        self.console( 'Przychodzi ' + data.name );
                        pla = new Player( data.x, data.y, data.name, data.color );
                        self.scene.children.push( pla );    
                    } else {
                        pla.update( data.x, data.y );
                    }
                });
            }
        },
        setupScene : function() {
            var self = this;

            function resize() {
                self.$canvas.attr('width', Config.PLANE_SIZE * 2 + 'px');
                self.$canvas.attr('height', Config.PLANE_SIZE + 'px');
            }

            $(window).on('resize', resize);
            resize();

            this.loop();
        },
        pilotControls : function() {
            var self = this;

            $('#left').on('touchend',function() {
                self.player.moveLeft();
            });
            $('#right').on('touchend',function() {
                self.player.moveRight();
            });
            $('#up').on('touchend',function() {
                self.player.moveUp();
            });
            $('#down').on('touchend',function() {
                self.player.moveDown();
            });

            $('#controls > div').on('touchend.controls', function() {
                if( self.socket ) {
                    self.socket.emit('player.move', self.player.serialize() );    
                }
            });


            // $('#ui button').on('click.controls', function() {
            //     self.player._name = $.trim( $('#ui .name').val() );
            // });
        },
        setupControls : function() {
            var self = this;

            self.pilotControls();

            $(window).on('keyup', function( event ) {
                switch( event.keyCode ) {
                    case 40:
                        self.player.moveDown();
                    break;
                    case 37:
                        self.player.moveLeft();
                    break;
                    case 38:
                        self.player.moveUp();
                    break;
                    case 39:
                        self.player.moveRight();
                    break;
                    case 32:
                        // self.stop();
                        $('#console').toggle()
                    break;
                }

                if( self.socket ) {
                    self.socket.emit('player.move', self.player.serialize() );    
                }
            });

            $('#console select').on('click.demo', function() {
                $('#console').toggleClass('off');
            });
        },
        stop : function() {
            if( !this.stopped ) {
                this.stopped = true;
                return;
            }

            this.stopped = false;
            
        },
        loop : function( time ) {
            Game.setDelta();
            Game.render();
            window.requestAnimationFrame( Game.loop );
        },
        setDelta : function() {

            if( this.last === 0 ) {
                this.last = Date.now();
            }

            this.now = Date.now();
            this.delta = (this.now - this.last) / 1000; // seconds since last frame
            this.last = this.now;
        },
        generateGradient : function() {
            var gradient = this.context.createLinearGradient(0,0,0,Config.PLANE_SIZE * 0.7);
            gradient.addColorStop(0,"#91c8ef");
            gradient.addColorStop(1,"#e9faff");
            this.context.fillStyle = gradient;
            this.context.fillRect( 0, 0, Config.PLANE_SIZE * 2, Config.PLANE_SIZE );
        },
        generateGrid : function() {
            this.context.save();

            this.context.strokeStyle = 'rgba(250,250,250,0.3)';
            this.context.lineWidth = 1;
            // this.context.globalCompositeOperation = 'source-atop';

            for (var x = Config.GRID_SIZE; x <= Config.PLANE_SIZE * 2; x += Config.GRID_SIZE) {
                this.context.beginPath();
                
                this.context.moveTo( x, 0 ); 
                this.context.lineTo( x, Config.PLANE_SIZE * 2 );
                
                this.context.closePath();
                this.context.stroke();
            }

            for ( var y = Config.GRID_SIZE; y <= Config.PLANE_SIZE; y += Config.GRID_SIZE) {
                this.context.beginPath();
                
                this.context.moveTo( 0, y ); 
                this.context.lineTo( Config.PLANE_SIZE * 2, y );
                
                this.context.closePath();
                this.context.stroke();
            }

            this.context.restore();
        },
        renderClouds : function() {
            this.context.drawImage( Cloud1, 0, 0, 311, 104, 511, 404, 311, 104);
            this.context.drawImage( Cloud3, 0, 0, 192, 64, 192, 64, 192, 64);
            this.context.drawImage( Cloud2, 0, 0, 256, 93, 480, 193, 256, 93);
            this.context.drawImage( Cloud2, 0, 0, 256, 93, 180, 603, 556, 203);
        },
        renderClouds2 : function() {
            this.context.drawImage( Cloud1, 0, 0, 311, 104, 311, 404, 111, 54);
            this.context.drawImage( Cloud3, 0, 0, 192, 64, 292, 64, 242, 64);
            this.context.drawImage( Cloud2, 0, 0, 256, 93, 180, 303, 256, 93);
        },
        renderRocket : function() {
            this.context.drawImage( Rocket,0,0, 321, 654, this.rocket.x, this.rocket.y, 421, 804);
            this.rocket.x += 15 * this.delta;
            this.rocket.y -= 30 * this.delta;

            if ( this.rocket.y < -700 ) {
                this.rocket.stop = true;
            }
        },
        render : function() {

            if ( this.stopped ) {
                return;
            };

            this.context.clearRect( 0, 0, Config.PLANE_SIZE * 2, Config.PLANE_SIZE );
            this.generateGradient();
            this.generateGrid();
            
            if ( !this.rocket.stop ) {
                this.renderRocket();
            }

            this.renderClouds();

            var l = this.scene.children.length;

            for ( var i = 0; i < l; i++ ) {
                if ( this.scene.children[i] ) {
                    this.scene.children[i].render( this.context );    
                }
                
            }
            this.renderClouds2();

            this.context.fillStyle = '#222';
            this.context.font = 'italic bold 18px sans-serif';
            this.context.textBaseline = 'bottom';
            this.context.fillText( 'Grasz jako: ' + this.player._name, 250, 55);

            this.context.drawImage( Logo, 0, 0, 637, 172, 5, 5, 212, 57);
        }
    }

    $(document).ready(function() {
        var _pilot = window._pilot || false;
        
        if( _pilot ) {
            Game.pilot( new Player(Helper.random(1,10) * Config.GRID_SIZE, Helper.random(1,10) * Config.GRID_SIZE, Helper.randomName(), Helper.randomColor(), true) );
        } else {
            Game.initialize( new Player(Helper.random(1,10) * Config.GRID_SIZE, Helper.random(1,10) * Config.GRID_SIZE, Helper.randomName(), Helper.randomColor(), true) );
        }
        
    });
})();
