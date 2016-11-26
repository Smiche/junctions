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
var gravity = 0.005;
var negGravity = -0.005;

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

var spheres, lineGeom;
function setSecondScene() {
  curScene = "second";
  gem.removeFromScene();
  clearScene();

  spheres = [];
  var curPos = {};
  for (var i = 0; i < 300; i++) {
    var geometry = new THREE.SphereGeometry(Math.random() + 0.5, 12, 12);
    var material = new THREE.MeshBasicMaterial({
      color: getRandomColor()
    });
    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = getRandomInt(-200, 200);
    sphere.position.y = getRandomInt(-200, 200);
    sphere.position.z = getRandomInt(-200, 200);
    sphere.vx = 0.5;
    sphere.vy = 0.5;
    sphere.vz = 0.5;
    spheres.push(sphere);
    scene.add(sphere);
  }

  lineGeom = new THREE.Geometry();
  for (var i = 0; i < spheres.length; i++) {
    lineGeom.vertices.push(new THREE.Vector3(spheres[i].position.x, spheres[i].position.y, spheres[i].position.z));
  }

  var lineMat = new THREE.LineBasicMaterial({
    color: 0xfff,
    transparent: true,
    opacity: 0.2,
    linewidth: 0.5
  });
  line = new THREE.Line(lineGeom, lineMat);
  scene.add(line);

  vrDisplay.requestAnimationFrame(animate);
}

updateLines = function () {
  lineGeom.vertices = [];
  for (var i = 0; i < spheres.length; i++) {
    lineGeom.vertices.push(new THREE.Vector3(spheres[i].position.x, spheres[i].position.y, spheres[i].position.z));
  }
  line.geometry.verticesNeedUpdate = true;
}

var nextScene = "first";
function animate() {
  audioController.update();

  G_UNIFORMS.dT.value = clock.getDelta();
  G_UNIFORMS.time.value += G_UNIFORMS.dT.value;

  if (curScene == "first") {
    gem.update();
    console.log('updating gem!');
  } else if (curScene == "second") {
    updateState();
    console.log('should do 2nd scene');
  } else if (curScene == "third") {

  }

  stats.update();
  controls.update();

  effect.render(scene, camera);
  if (nextScene != curScene) {
    if (nextScene == "first")
      ;
    else if (nextScene == "second") {
      setSecondScene();
    }
  } else
    vrDisplay.requestAnimationFrame(animate);
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
    //nextScene = "second";
    vrDisplay.requestPresent([{ source: renderer.domElement }]);
  });

  $('#menubutton').click(function () {
    toggleMenu();
  });

  $('#scbutton1').click(function () {
    console.log("call scene one")
  });


    $('#scbutton2').click(function () {
      console.log("call scene two")
    });


      $('#scbutton3').click(function () {
        console.log("call scene three")
      });
});

  function toggleMenu(){
    $("#menu").toggle(300);

  }
function toCart(r, t, p) {

  var x = r * (Math.sin(t)) * (Math.cos(p));
  var y = r * (Math.sin(t)) * (Math.sin(p));
  var z = r * (Math.cos(t));

  return new THREE.Vector3(x, y, z);

}


function getSign(num) {
  if (num > 0) {
    return 1;
  } else {
    return -1;
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateState() {
  //remove time interval, handle it on animate
  for (var i = 0; i < spheres.length; i++) {
    spheres[i].position.x = add(spheres[i].position.x, spheres[i].vx);
    spheres[i].position.y = add(spheres[i].position.y, spheres[i].vy);
    spheres[i].position.z = add(spheres[i].position.z, spheres[i].vz);
    if (spheres[i].vx > 0) {
      spheres[i].vx = add(spheres[i].vx, negGravity);
    } else if (spheres[i].vx < 0) {
      spheres[i].vx = add(spheres[i].vx, gravity);
    } else if (spheres[i].vx == 0) {
      spheres[i].vx = getRandomInt(-2, 2) / 10;
    }

    if (spheres[i].vy > 0) {
      spheres[i].vy = add(spheres[i].vy, negGravity);
    } else if (spheres[i].vy < 0) {
      spheres[i].vy = add(spheres[i].vy, gravity);
    } else if (spheres[i].vy == 0) {
      spheres[i].vy = getRandomInt(-5, 5) / 10;
    }
    if (spheres[i].vz > 0) {
      spheres[i].vz = add(spheres[i].vz, negGravity);
    } else if (spheres[i].vz < 0) {
      spheres[i].vz = add(spheres[i].vz, gravity);
    } else if (spheres[i].vy == 0) {
      spheres[i].vz = getRandomInt(-5, 5) / 10;
    }
  }
  updateLines();
}

function add(num1, num2) {
  num1 *= 1000;
  num2 *= 1000;
  return (num1 + num2) / 1000;
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
