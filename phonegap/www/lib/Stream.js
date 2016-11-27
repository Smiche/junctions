
STREAMS = [];

var ULTIMATE_STREAM, ULTIMATE_SOURCE , ULTIMATE_GAIN , ULTIMATE_CONTROLLER ;

function Stream( byteArray , controller, looping, onEnded){

  this.byteArray = byteArray;
  this.controller = controller;
  this.ctx = this.controller.ctx;

  if( !ULTIMATE_STREAM ){

    ULTIMATE_STREAM = new Audio();
    var ctx = controller.ctx;

    ULTIMATE_SOURCE = ctx.createBufferSource( ULTIMATE_STREAM );
    ULTIMATE_SOURCE.buffer = byteArray;
    ULTIMATE_GAIN = ctx.createGain();
    
    ULTIMATE_SOURCE.connect( ULTIMATE_GAIN );

    
    ULTIMATE_GAIN.connect( controller.gain );
    //ULTIMATE_SOURCE.connect( controller.gain );

    ULTIMATE_CONTROLLER = controller;
  }

  this.looping = looping;

  this.controller.notes.push( this );

  STREAMS.push( this );
}


Stream.prototype.play = function(){

  this.playing = true;

  ULTIMATE_SOURCE.start(0);
  //ULTIMATE_GAIN.gain.value = 0.5;
  var t = ULTIMATE_CONTROLLER.ctx.currentTime;
  ULTIMATE_GAIN.gain.linearRampToValueAtTime( 1 , ULTIMATE_CONTROLLER.ctx.currentTime + .1 );
}

Stream.prototype.stop = function(){

  this.playing = false;

  var t = ULTIMATE_CONTROLLER.ctx.currentTime;

  console.log('TIME: ' + t);
  ULTIMATE_GAIN.gain.linearRampToValueAtTime( ULTIMATE_GAIN.gain.value , t );

  ULTIMATE_GAIN.gain.linearRampToValueAtTime( 0.0 , t + .1);

  setTimeout(function() {
    ULTIMATE_SOURCE.stop(0); 
  }, 99);

}





/*Stream.prototype.fadeOut = function( time , callback ){
 
  var t = this.controller.ctx.currentTime;
  if( !time ) time = this.params.fadeTime;
  this.gain.gain.linearRampToValueAtTime( this.gain.gain.value , t );
  this.gain.gain.linearRampToValueAtTime( 0.0 , t + time );

  setTimeout( callback.bind( this ) , time * 1000 );

}

ULTIMATE_GAIN.fadeIn = function( time , value ){

  this.gain.gain.linearRampToValueAtTime( 1 , this.controller.ctx.currentTime + time );

}*/

/*Stream.prototype.play = function(){

  var self = this;

  if(!this.source){
    this.createSource();
  }


  setTimeout(function(){



    self.audio.play();
    self.fadeIn( .5 , 1 );
    self.playing = true;

  },10);


}

Stream.prototype.stop = function(){

  this.fadeOut( .4 , function(){ 

    this.audio.pause();
    this.playing = false;
 
    this.audio.currentTime = 0;
    this.audio = undefined;
    //this.audio.currentTime = 0;
    //this.source.currentTime = 0;
   // this.gain.disconnect( this.source );
   
    //this.gain.disconnect( this.source );
    //this.source = undefined;

 });

}*/


Stream.prototype.update = function() {
  
  //this.analyzer.getByteFrequencyData( this.analyzer.array );

}

Stream.prototype.next = function(byteArray) {
  var t = ULTIMATE_CONTROLLER.ctx.currentTime;
  
  var newGain = ULTIMATE_CONTROLLER.ctx.createGain();
  newGain.connect(ULTIMATE_CONTROLLER.gain);
  newGain.gain.linearRampToValueAtTime(0, t + .1);
  var newSource = ULTIMATE_CONTROLLER.ctx.createBufferSource( ULTIMATE_STREAM );
  newSource.buffer = byteArray;
  newSource.connect(newGain);
  newSource.start(0);

  ULTIMATE_GAIN.gain.linearRampToValueAtTime(0, t + 1.5);
  newGain.gain.linearRampToValueAtTime(1, t + 1.5);

  setTimeout(function() {
    ULTIMATE_SOURCE.stop(0);
    delete ULTIMATE_SOURCE;
    delete ULTIMATE_GAIN;

    ULTIMATE_SOURCE = newSource;
    ULTIMATE_GAIN = newGain;
    ULTIMATE_GAIN.disconnect();
    ULTIMATE_GAIN.connect(ULTIMATE_CONTROLLER.gain);
  }, 1500);
    
}
