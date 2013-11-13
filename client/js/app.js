(function() {
	"use strict";

    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

    var Config = {
        SERVER_ADDR : 'http://144.76.114.228:7878',
        GRID_SIZE : 50,
        SPEED : 50,
        FRAME_WIDTH : 32,
        FRAME_HEIGHT : 32,
        LEFT : 1,
        RIGHT : 2,
        UP : 3,
        DOWN : 0,
        SCALE : 1,
        FRAMES : 2
    }

    var Grass = new Image();
    Grass.src = 'https://sites.google.com/site/jayjay09/grass1.jpg';

    var Helper = {
        random : function( min, max ) {
            return Math.floor( min + Math.random() * max );
        },
        randomColor : function() {
            return "#" + ( ( 1<<24 ) * Math.random() | 0 ).toString( 16 );
        },
        randomName : function() {
            return 'Gracz - ' + this.random(1,9999);
        }
    }

    function Player( x, y, name, color, ctrl ) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.color = color || Helper.randomColor();
        this.me = ctrl || false;

        this.pos = Config.DOWN;

        this.sprite = new Image();
        this.sprite.src = "asset/aaa.png";
        this.charX = Helper.random(0,3);
        this.charY = Helper.random(0,1);
        this.spriteFrame = 0;
    }

    Player.prototype = {
        serialize : function() {
            return {
                'name' : this.name,
                'color' : this.color,
                'x' : this.x,
                'y' : this.y
            }
        },
        update : function( x, y ) {
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
                    this.pos = Config.DOWN;
                } else if ( y < this.y ) {
                    this.pos = Config.UP;
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

            if( this.pos === Config.UP && this.spriteFrame < Config.FRAMES ) {
                this.spriteFrame++;
            } else {
                this.spriteFrame = 0;
            }

            this.y -= Config.SPEED;
            this.pos = Config.UP;
        },
        moveDown : function() {

            if( this.pos === Config.DOWN && this.spriteFrame < Config.FRAMES ) {
                this.spriteFrame++;
            } else {
                this.spriteFrame = 0;
            }

            this.y += Config.SPEED;
            this.pos = Config.DOWN;
        },
        render : function( context ) {
            context.beginPath();
            context.rect( this.x, this.y, Config.GRID_SIZE, Config.GRID_SIZE);
            context.closePath();
            context.fillStyle = this.color;
            context.fill();
            context.stroke();
                
                context.drawImage( this.sprite, 
                    this.charX * 96 + (this.spriteFrame * Config.FRAME_WIDTH),
                    this.charY * 96 + this.pos * Config.FRAME_HEIGHT,
                    Config.FRAME_WIDTH,
                    Config.FRAME_HEIGHT, 
                    this.x, this.y,
                    Config.GRID_SIZE * Config.SCALE, 
                    Config.GRID_SIZE
                );

            context.fillStyle = '#eee';
            context.font = 'italic bold 15px sans-serif';
            context.textBaseline = 'bottom';
            context.fillText( this.name, this.x + Config.GRID_SIZE, this.y);
            
        }
    }

    var Game = {
        $canvas : null,
        context : null,
        socket : null,
        player : null,
        scene : {
            children : [],
            find : function( name ) {
                var l = this.children.length;

                for( var i = 0; i < l; i++ ) {
                    if ( this.children[i].name === name ) {
                        return this.children[i];
                    }
                }
                return null;
            }
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

                this.socket = io.connect( Config.SERVER_ADDR );
                
                this.socket.on('connect', function ( data ) {
                    self.scene.children = [];

                    self.socket.emit('player.new', self.player.serialize() );
                    self.scene.children.push( self.player );
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
                self.$canvas.css('width', window.innerWidth + 'px');
                self.$canvas.css('height', window.innerHeight + 'px');
            }

            $(window).on('resize', resize);
            resize();

            this.loop();
        },
        setupControls : function() {
            var self = this;

            $('#left').on('click',function() {
                self.player.moveLeft();
            });
            $('#right').on('click',function() {
                self.player.moveRight();
            });
            $('#up').on('click',function() {
                self.player.moveUp();
            });
            $('#down').on('click',function() {
                self.player.moveDown();
            });

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

            $('#controls > div').on('click.controls', function() {
                if( self.socket ) {
                    self.socket.emit('player.move', self.player.serialize() );    
                }
            })
        },
        loop : function() {
            window.requestAnimFrame( Game.loop );
            Game.render();
        },
        generateGrid : function() {
            this.context.save();

            this.context.strokeStyle = '#adaada';
            this.context.lineWidth = 1;
            // this.context.globalCompositeOperation = 'source-atop';

            var position = {
                x: 0,
                y: 0
            }, x = 0, y = 0;

            for (x = 0; x <= window.innerWidth + Config.GRID_SIZE; x += Config.GRID_SIZE) {
                this.context.beginPath();
                
                this.context.moveTo(position.x + x, position.y ); 
                this.context.lineTo(position.x + x, position.y + window.innerHeight );
                
                this.context.closePath();
                this.context.stroke();
            }

            for (y = 0; y <= window.innerHeight + Config.GRID_SIZE; y += Config.GRID_SIZE) {
                this.context.beginPath();
                
                this.context.moveTo(position.x, position.y + y ); 
                this.context.lineTo(position.x + window.innerWidth, position.y + y );
                
                this.context.closePath();
                this.context.stroke();
            }

            this.context.restore();
        },
        render : function() {

            this.context.clearRect( 0, 0, window.innerWidth, window.innerHeight );
            this.context.drawImage( Grass,0,0 );

            this.generateGrid();

            var l = this.scene.children.length;

            for ( var i = 0; i < l; i++ ) {
                this.scene.children[i].render( this.context );
            }
        }
    }

    $(document).ready(function() {
        Game.initialize( new Player(50, 50, Helper.randomName(), Helper.randomColor(), true) );
        $('.run').off().on('click', function() {
            var name = $('.name').val();
            
            $('.init').remove();
        });
    });
})();