
WebVRConfig = {
  // Flag to disabled the UI in VR Mode.
  CARDBOARD_UI_DISABLED: false, // Default: false
  PREDICTION_TIME_S: 0.070,
  // Forces availability of VR mode, even for non-mobile devices.
  FORCE_ENABLE_VR: true
}
var container , camera, scene, renderer , stats, effect;
    var vrDisplay = null;  

  var gem , gui;

  var tv1 = new THREE.Vector3();
  var tv2 = new THREE.Vector3();
  var repelerMeshes = [];
  var repelersHidden = true;


  var REPELERS = [];



  // TODO: make into loader
  var loaded = 0;
  var neededToLoad = 1;


  var loader = new Loader();
  loader.liftCurtain();

  var clock = new THREE.Clock();

  var audioController = new AudioController();
  //audioController.mute.gain.value = 0;
  
  var stream = new Stream(  'audio/centerYourLove.mp3',audioController  );
  //stream.onStreamCreated = function(){
   /// onLoad();
 // }
/* var userAudio = new UserAudio( audioController );
  userAudio.onStreamCreated = function(){

    console.log('asds');
    onLoad();

  }*/
  var shaders = new ShaderLoader('shaders');

  shaders.load( 'ss-fire' , 'fire' , 'simulation' );
  shaders.load( 'ss-weird1' , 'weird1' , 'simulation' );
  shaders.load( 'vs-fire' , 'fire' , 'vertex' );
  shaders.load( 'fs-weird1' , 'weird1' , 'fragment' );
  shaders.load( 'fs-fire' , 'fire' , 'fragment' );

  shaders.shaderSetLoaded = function(){
   onLoad();
  }

  var G_UNIFORMS = {

    dT      : { type:"f" , value:0                            },
    time    : { type:"f" , value:0                            },
    t_audio : { type:"t" , value: audioController.texture     },

  }





 function init(){


    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera( 
      75 ,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );

    // placing our camera position so it can see everything
    camera.position.z = 0 ;
    camera.lookAt( new THREE.Vector3( 1, 1, 0 ));


    // Getting the container in the right location
    container     = document.createElement( 'div' );
    container.id  = 'container';
    
    document.body.appendChild( container );

    // Getting the stats in the right position
   stats = new Stats();
   stats.domElement.id = 'stats';
    document.body.appendChild( stats.domElement );


    // Setting up our Renderer
    renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false });
    renderer.setClearColor( 0x505050 );
		renderer.setPixelRatio( window.devicePixelRatio );
    renderer.sortObjects = false;
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    renderer.domElement.style.background="#000";
  
    /* //RIP CONTROLS */
    /*
    controls = new THREE.TrackballControls( camera , renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 3000;
    */
    
    controls = new THREE.VRControls( camera );
		effect = new THREE.VREffect( renderer );
    effect.setSize(window.innerHeight, window.innerWidth);

    // Making sure our renderer is always the right size
    window.addEventListener( 'resize', onWindowResize , false );
    //window.addEventListener( 'mousemove', onMouseMove , false );
   
    var g = new THREE.Mesh( //new THREE.IcosahedronGeometry( 400 , 7 ) 
   new THREE.SphereGeometry( 300, 64, 64)
    );
    gem = new CurlMesh( 'Space Puppy' , g , {

      soul:{
  
        noiseSize:{ type:"f" , value: .003 , constraints:[.0001 , .01] },
        noiseVariation:     { type:"f" , value: .8   , constraints:[.01 , 1.] },
        dampening:          { type:"f" , value: 1. , constraints:[.8 , .999] },
        noisePower:         { type:"f" , value: 100   , constraints:[0 , 200.] },
        returnPower:        { type:"f" , value: 1.   , constraints:[ .0 ,2. ] },
        audioVelMultiplier: { type:"f" , value: .8   , constraints:[ 0 , 1 ] },
    
      },
      
      body:{
      
        audioDisplacement:{ type:"f" , value : 30.0 ,  constraints:[ 0 , 100 ]},

        tmp_color1:{ type:"color" , value: 0xff0000 },
        tmp_color2:{ type:"color" , value: 0x00ffe1 },
        tmp_color3:{ type:"color" , value: 0x5500ff },

        color1:{ type:"c" , value : new THREE.Color( 0xff0000 ) },
        color2:{ type:"c" , value : new THREE.Color( 0x00ffe1 ) },
        color3:{ type:"c" , value : new THREE.Color( 0x5500ff ) },
      }

      
    }); 

    gem.toggle();
      
    if ( navigator.getVRDisplays ) {
					navigator.getVRDisplays()
						.then( function ( displays ) {
              console.log(displays);
							vrDisplay =  displays[0];
							//controls.setVRDisplay( displays[ 0 ] );
              //vrDisplay.requestPresent([{source: renderer.domElement}]);
              controls.setVRDisplay( displays[ 0 ] );
              vrDisplay.requestAnimationFrame(animate);
						} )
						.catch( function () {
							// no displays
              console.log('NO DISPLAYS!');
						} );
				//	document.body.appendChild( WEBVR.getButton( effect ) );
				}

  }

  function animate(){
    audioController.update();

    G_UNIFORMS.dT.value = clock.getDelta();
    G_UNIFORMS.time.value += G_UNIFORMS.dT.value;

    gem.update();

    stats.update();

    controls.update();

    effect.render( scene , camera );
    vrDisplay.requestAnimationFrame( animate );
    }


/*
  function onMouseMove(e ){
  }
*/
  // Resets the renderer to be the proper size
  function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    effect.setSize( window.innerWidth, window.innerHeight );
    renderer.setSize( window.innerWidth, window.innerHeight );
   
    var dpr = devicePixelRatio || 1;

    //camUniforms.SS.value.x = window.innerWidth * dpr;
    //camUniforms.SS.value.y = window.innerHeight * dpr;


  }


  function onLoad(){


    loaded ++;

    console.log(loaded );
    if( loaded === neededToLoad ){

      if( stream ){
         // stream = window.URL.createObjectURL(stream);
        stream.play();
      }

      init();
      //goOn();
    }

  }
$( document ).ready(function() {
$('#vrbutton').click(function() {
  vrDisplay.requestPresent([{source: renderer.domElement}]);
});
});
window.activateVR = function(){
  vrDisplay.requestPresent([{source: renderer.domElement}]);
}
  function toCart( r , t , p ){

    var x = r *(Math.sin(t))*(Math.cos(p));
    var y = r *(Math.sin(t))*(Math.sin(p));
    var z = r * (Math.cos(t));

    return new THREE.Vector3(x,y,z);

  }
