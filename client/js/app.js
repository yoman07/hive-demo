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
        GRID_SIZE : 25
    }

    var Helper = {
        random : function( min, max ) {
            return Math.floor( min + Math.random() * max );
        },
        randomColor : function() {
            return "#" + ( ( 1<<24 ) * Math.random() | 0 ).toString( 16 );
        }
    }

    function Player( x, y, name, color ) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.color = color || Helper.randomColor();
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
                this.x = x;
            }
            if ( typeof y !== 'undefined' ) {
                this.y = y;
            }
        },
        render : function( context ) {
            context.beginPath();
            context.rect( this.x, this.y, Config.GRID_SIZE, Config.GRID_SIZE);
            context.closePath();
            context.fillStyle = this.color;
            context.fill();
            context.stroke();
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
                self.player.x -=Config.GRID_SIZE;
            });
            $('#right').on('click',function() {
                self.player.x +=Config.GRID_SIZE;
            });
            $('#up').on('click',function() {
                self.player.y -=Config.GRID_SIZE;
            });
            $('#down').on('click',function() {
                self.player.y +=Config.GRID_SIZE;
            });

            $(window).on('keyup', function( event ) {
                switch( event.keyCode ) {
                    case 40:
                        self.player.y +=Config.GRID_SIZE;
                    break;
                    case 37:
                    
                        self.player.x -=Config.GRID_SIZE;    
                    break;
                    case 38:
                    self.player.y -=Config.GRID_SIZE;
                        
                    
                    
                        
                    break;
                    case 39:
                    self.player.x +=Config.GRID_SIZE;
                    
                        
                    break;
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
            this.generateGrid();

            var l = this.scene.children.length;

            for ( var i = 0; i < l; i++ ) {
                this.scene.children[i].render( this.context );
            }
        }
    }

    $(document).ready(function() {
        $('.run').off().on('click', function() {
            var name = $('.name').val();
            Game.initialize( new Player(50, 50, name, Helper.randomColor()) );
            $('.init').remove();
        });
    });
})();