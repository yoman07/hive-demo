(function() {
	"use strict";

    window.requestAnimFrame = (function(){
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame;
    })();

    if ( !window.requestAnimFrame ) {
        window.requestAnimFrame = function( callback ) {
            window.setTimeout(callback, 1000 / 30);
        };
    }

    var Config = {
        SERVER_ADDR : 'http://144.76.114.228',
        PLANE_SIZE : 1600,
        GRID_SIZE : 30,
        SPEED : 30,
        FRAME_WIDTH : 64,
        FRAME_HEIGHT : 64,
        LEFT : 0,
        RIGHT : 1,
        UP : 3,
        DOWN : 0,
        SCALE : 1,
        FRAMES : 9
    };

    // var Grass = new Image();
    // Grass.src = 'https://sites.google.com/site/jayjay09/grass1.jpg';

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
        this.sprite.src = "asset/qqq2.png";
        this.charX = 0;
        this.charY = 0; //Helper.random(0,1);
        this.spriteFrame = 0;
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
            context.font = 'italic bold 15px sans-serif';
            context.textBaseline = 'bottom';
            context.fillText( this._name, this.x + Config.GRID_SIZE, this.y);
        }
    }

    window.Game = {
        $canvas : null,
        context : null,
        socket : null,
        player : null,
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

            this.setupScene();
            this.initNetwork();
            this.setupControls();
        },
        initNetwork : function() {
            var self = this;

            if ( this.player ) {
                this.socket = io.connect( Config.SERVER_ADDR, {
                    port : '7878',
                    'transports' : ['websocket'],
                    'reconnection delay' : 10000,
                    'reconnection limit': 10,
                    'max reconnection attempts': 11
                } );

                this.socket.on('connect', function ( data ) {
                    self.scene.children = [];

                    self.socket.emit('player.new', self.player.serialize() );
                    
                });
                self.scene.children.push( self.player );

                this.socket.on('disconnect', function ( data ) {
                    
                    alert('disconnected!');
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
                        // pla = null;

                        self.scene.children.splice( self.scene.children.indexOf( pla ), 1);
                    }
                });

                this.socket.on('player.update', function ( data ) {
                    var pla = self.scene.find( data.name );
                    
                    if ( !pla ) {
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
                self.$canvas.css('width', Config.PLANE_SIZE + 'px');
                self.$canvas.css('height', Config.PLANE_SIZE + 'px');
            }

            // $(window).on('resize', resize);
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
                }

                if( self.socket ) {
                    self.socket.emit('player.move', self.player.serialize() );    
                }
            });
        },
        loop : function() {
            window.requestAnimFrame( Game.loop );
            Game.render();
        },
        generateGrid : function() {
            this.context.save();

            this.context.strokeStyle = 'rgba(240,240,240,0.6)';
            this.context.lineWidth = 1;
            // this.context.globalCompositeOperation = 'source-atop';

            for (var x = Config.GRID_SIZE; x <= Config.PLANE_SIZE; x += Config.GRID_SIZE) {
                this.context.beginPath();
                
                this.context.moveTo( x, 0 ); 
                this.context.lineTo( x, Config.PLANE_SIZE );
                
                this.context.closePath();
                this.context.stroke();
            }

            for ( var y = Config.GRID_SIZE; y <= Config.PLANE_SIZE; y += Config.GRID_SIZE) {
                this.context.beginPath();
                
                this.context.moveTo( 0, y ); 
                this.context.lineTo( Config.PLANE_SIZE, y );
                
                this.context.closePath();
                this.context.stroke();
            }

            this.context.restore();
        },
        render : function() {

            this.context.clearRect( 0, 0, Config.PLANE_SIZE, Config.PLANE_SIZE );
            // this.context.drawImage( Grass,0,0 );

            this.generateGrid();

            var l = this.scene.children.length;

            for ( var i = 0; i < l; i++ ) {
                if ( this.scene.children[i] ) {
                    this.scene.children[i].render( this.context );    
                } 
                
            }
        }
    }

    $(document).ready(function() {
        var _pilot = window._pilot || false;
        
        if( _pilot ) {
            Game.pilot( new Player(Helper.random(1,15) * Config.GRID_SIZE, Helper.random(1,15) * Config.GRID_SIZE, Helper.randomName(), Helper.randomColor(), true) );
        } else {
            Game.initialize( new Player(Helper.random(1,15) * Config.GRID_SIZE, Helper.random(1,15) * Config.GRID_SIZE, Helper.randomName(), Helper.randomColor(), true) );
        }
        
    });
})();