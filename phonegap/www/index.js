//config
WebVRConfig = {
  CARDBOARD_UI_DISABLED: false,
  BUFFER_SCALE: 0.5,
  FORCE_ENABLE_VR: true
}

curScene = "first";
var container, camera, scene, renderer, stats, effect;
var vrDisplay = null;
var camX = 0, camY = 0, camZ = 0;
var paused = false;

var gem, gui;

var tv1 = new THREE.Vector3();
var tv2 = new THREE.Vector3();
var repelerMeshes = [];
var repelersHidden = true;

var REPELERS = [];

var loaded = 0;
var neededToLoad = 1;

var loader = new Loader();
setTimeout(function () {
  loader.liftCurtain();
}, 3000);

var clock = new THREE.Clock();
var audioController = new AudioController();
var stream = new Stream('audio/Nostrand.mp3', audioController);
var shaders = new ShaderLoader('shaders');

shaders.load('ss-fire', 'fire', 'simulation');
shaders.load('ss-weird1', 'weird1', 'simulation');
shaders.load('vs-fire', 'fire', 'vertex');
shaders.load('fs-weird1', 'weird1', 'fragment');
shaders.load('fs-fire', 'fire', 'fragment');

shaders.shaderSetLoaded = function () {
  onLoad();
}

var G_UNIFORMS = {
  dT: { type: "f", value: 0 },
  time: { type: "f", value: 0 },
  t_audio: { type: "t", value: audioController.texture },
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 7000);
  camera.position.z = 0;

  // Getting the container in the right location
  container = document.createElement('div');
  container.id = 'container';
  document.body.appendChild(container);

  // Getting the stats in the right position
  stats = new Stats();
  stats.domElement.id = 'stats';
  document.body.appendChild(stats.domElement);

  // Setting up our Renderer
  renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false });
  renderer.setClearColor(0x505050);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.sortObjects = false;
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  renderer.domElement.style.background = "#000";

  controls = new THREE.DeviceOrientationControls(camera);
  effect = new THREE.VREffect(renderer);
  window.addEventListener('resize', onWindowResize, false);

  var g = new THREE.Mesh(new THREE.SphereGeometry(1200, 90, 90));
  gem = new CurlMesh('Space Puppy', g, {
    soul: {
      noiseSize: { type: "f", value: .001, constraints: [.0001, .01] },
      noiseVariation: { type: "f", value: .8, constraints: [.01, 1.] },
      dampening: { type: "f", value: .85, constraints: [.8, .999] },
      noisePower: { type: "f", value: 60, constraints: [0, 200.] },
      returnPower: { type: "f", value: 1.2, constraints: [.0, 2.] },
      audioVelMultiplier: { type: "f", value: .7, constraints: [0, 1] },
    },
    body: {
      audioDisplacement: { type: "f", value: 30.0, constraints: [0, 100] },
      tmp_color1: { type: "color", value: 0xff0000 },
      tmp_color2: { type: "color", value: 0x00ffe1 },
      tmp_color3: { type: "color", value: 0x5500ff },
      color1: { type: "c", value: new THREE.Color(0xff0000) },
      color2: { type: "c", value: new THREE.Color(0x00ffe1) },
      color3: { type: "c", value: new THREE.Color(0x5500ff) },
    }
  });

  gem.toggle();

  if (navigator.getVRDisplays) {
    navigator.getVRDisplays().then(function (displays) {
      vrDisplay = displays[0];
      vrDisplay.requestPresent([{ source: renderer.domElement }]);
      vrDisplay.requestAnimationFrame(animate);
    }).catch(function () {
      console.log('NO DISPLAYS!');
    });
  }
}

function clearScene() {
  for (var i = scene.children.length - 1; i >= 0; i--) {
    scene.remove(i);
  }
}

function setSecondScene() {
  paused = true;
  curScene = "second";
  clearScene();
  gem.removeFromScene();
  var shadowGeo = new THREE.PlaneBufferGeometry(300, 300, 1, 1);
  var myMesh = new THREE.Mesh(shadowGeo);
  myMesh.position.x = 0;
  myMesh.position.y = 0;
  myMesh.position.z = 1;
  scene.add(myMesh);
  var light = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(light);

  paused = false;
  vrDisplay.requestPresent([{ source: renderer.domElement }]);
  vrDisplay.requestAnimationFrame(animate);
}

function animate() {
  if (!paused) {
    audioController.update();

    G_UNIFORMS.dT.value = clock.getDelta();
    G_UNIFORMS.time.value += G_UNIFORMS.dT.value;

    if (curScene == "first") {
      gem.update();
      console.log('updating gem!');
    } else if (curScene == "second") {
      console.log('should do 2nd scene');
    } else if (curScene == "third") {

    }

    stats.update();
    controls.update();

    effect.render(scene, camera);
    vrDisplay.requestAnimationFrame(animate);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  var dpr = devicePixelRatio || 1;
}


function onLoad() {
  loaded++;
  if (loaded === neededToLoad) {

    if (stream) {
      stream.play();
    }

    init();
  }
}

$(document).ready(function () {
  $('#vrbutton').click(function () {
    vrDisplay.requestPresent([{ source: renderer.domElement }]);
    setSecondScene();
  });
});

function toCart(r, t, p) {

  var x = r * (Math.sin(t)) * (Math.cos(p));
  var y = r * (Math.sin(t)) * (Math.sin(p));
  var z = r * (Math.cos(t));

  return new THREE.Vector3(x, y, z);

}