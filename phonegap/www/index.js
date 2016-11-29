//config
WebVRConfig = {
  CARDBOARD_UI_DISABLED: false,
  BUFFER_SCALE: 0.6,
  FORCE_ENABLE_VR: true
}

curScene = "first";

var isMusicLoaded = false;
var areShadersLoaded = false;
var currentTrack = 0;

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

initMusic(function () {
  stream = new Stream(musicArray[0], audioController)

  var playUntilItDies = function () {
    setTimeout(function () {
      currentTrack++;
      if (currentTrack >= musicArray.length) {
        currentTrack = 0;
      }
      stream.next(musicArray[currentTrack])

      playUntilItDies();

    }, (musicArray[currentTrack].duration - 2) * 1000);
  }
  playUntilItDies();

  checkLoad(true, false)
});


var shaders = new ShaderLoader('shaders');

shaders.load('ss-fire', 'fire', 'simulation');
shaders.load('ss-weird1', 'weird1', 'simulation');
shaders.load('vs-fire', 'fire', 'vertex');
shaders.load('fs-weird1', 'weird1', 'fragment');
shaders.load('fs-fire', 'fire', 'fragment');

shaders.shaderSetLoaded = function () {
  checkLoad(false, true);
}

var G_UNIFORMS = {
  dT: { type: "f", value: 0 },
  time: { type: "f", value: 0 },
  t_audio: { type: "t", value: audioController.texture },
}

function checkLoad(isMusic, areShaders) {
  isMusicLoaded = isMusicLoaded || isMusic;
  areShadersLoaded = areShadersLoaded || areShaders;

  console.log(isMusicLoaded, areShadersLoaded);

  if (isMusicLoaded && areShadersLoaded) {
    onLoad();
  }
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

  var COLOR_PROFILES = {
      profile_1: {
        color1: { type: "c", value: new THREE.Color(0xff0000) },
        color2: { type: "c", value: new THREE.Color(0x00ffe1) },
        color3: { type: "c", value: new THREE.Color(0x5500ff) }
  },
      profile_2:{
        color1: { type: "c", value: new THREE.Color(0x039dd9) },
        color2: { type: "c", value: new THREE.Color(0xfedf71) },
        color3: { type: "c", value: new THREE.Color(0x028c65) }
      }

  }

  var activeColorProfile = COLOR_PROFILES.profile_2;

  var g = new THREE.Mesh(new THREE.SphereGeometry(1200, 90, 90));
  gem = new CurlMesh('Space Puppy', g, {
    soul: {
      noiseSize: { type: "f", value: .008, constraints: [.0001, .01] },
      noiseVariation: { type: "f", value: .4, constraints: [.01, 1.] },
      dampening: { type: "f", value: .9, constraints: [.8, .999] },
      noisePower: { type: "f", value: 60, constraints: [0, 200.] },
      returnPower: { type: "f", value: 0.8, constraints: [.0, 2.] },
      audioVelMultiplier: { type: "f", value: .7, constraints: [0, 1] },
    },
    body: {
      audioDisplacement: { type: "f", value: 30.00, constraints: [0, 100] },
      tmp_color1: { type: "color", value: 0xff0000 },
      tmp_color2: { type: "color", value: 0x00ffe1 },
      tmp_color3: { type: "color", value: 0x5500ff },
      color1: activeColorProfile.color1,
      color2: activeColorProfile.color2,
      color3: activeColorProfile.color3,
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

  renderer.setClearColor(0x000);
  spheres = [];
  var curPos = {};
  for (var i = 0; i < 230; i++) {
    var geometry = new THREE.SphereGeometry(Math.random() + 0.5, 12, 12);
    var material = new THREE.MeshBasicMaterial({
      color: getRandomColor()
    });
    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = getRandomInt(-60, 60);
    sphere.position.y = getRandomInt(-60, 60);
    sphere.position.z = getRandomInt(-60, 60);
    sphere.vx = 0.05;
    sphere.vy = 0.05;
    sphere.vz = 0.05;
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

  animate();
}

updateLines = function () {

  //lineGeom.vertices = [];
  for (var i = 0; i < spheres.length; i++) {
    lineGeom.vertices[i].x = spheres[i].position.x;
    lineGeom.vertices[i].y = spheres[i].position.y;
    lineGeom.vertices[i].z = spheres[i].position.z;
  }

  lineGeom.verticesNeedUpdate = true;
  lineGeom.elementsNeedUpdate = true;
  lineGeom.morphTargetsNeedUpdate = true;
  lineGeom.uvsNeedUpdate = true;
  lineGeom.normalsNeedUpdate = true;
  lineGeom.colorsNeedUpdate = true;
  lineGeom.tangentsNeedUpdate = true;
}


function setFirstScene() {
  curScene = "first";
  clearScene();
  gem.addToScene();
}

var nextScene = "first";
function animate() {
  //console.log(gem.uniforms.dT.value);
  audioController.update();

  G_UNIFORMS.dT.value = clock.getDelta();
  G_UNIFORMS.time.value += G_UNIFORMS.dT.value;

  if (curScene == "first") {
    gem.update();
  } else if (curScene == "second") {
    updateState();
  } else if (curScene == "third") {

  }

  stats.update();
  controls.update();

  if (nextScene != curScene) {
    if (nextScene == "first")
      setFirstScene();
    else if (nextScene == "second") {
      setSecondScene();
    }
  } else {
    vrDisplay.requestAnimationFrame(animate);
    effect.render(scene, camera);
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
    //nextScene = "second";
    vrDisplay.requestPresent([{ source: renderer.domElement }]);
  });

  $('#menubutton').click(function () {
    toggleMenu();
  });

  $('#scbutton1').click(function () {
    nextScene = "first";
    toggleMenu();
  });


  $('#scbutton2').click(function () {
    nextScene = "second";
    toggleMenu();
  });

  $('#scbutton3').click(function () {
    console.log("call scene three");
    toggleMenu();
  });
});

function toggleMenu() {
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
  var curdT = gem.uniforms.dT.value;
  var dTint = Math.round(curdT * 1000);
  dTint = dTint - 10;
  if (dTint < 0) {
    dTint = 0;
  }
  //console.log(curdT);

  //remove time interval, handle it on animate
  for (var i = 0; i < spheres.length; i++) {

    //console.log("1: "+spheres[i].vx +"  2: "+spheres[i].vy + "  3."+spheres[i].vz);
    spheres[i].position.x = add(spheres[i].position.x, spheres[i].vx);
    spheres[i].position.y = add(spheres[i].position.y, spheres[i].vy);
    spheres[i].position.z = add(spheres[i].position.z, spheres[i].vz);
    if (spheres[i].vx > 0) {
      spheres[i].vx = add(spheres[i].vx, negGravity);
    } else if (spheres[i].vx < 0) {
      spheres[i].vx = add(spheres[i].vx, gravity);
    } else if (parseFloat(spheres[i].vx).toPrecision(5) == 0.00000) {
      spheres[i].vx = strip(getRandomInt(-2, 2) / 100 * dTint);
      spheres[i].material.color = new THREE.Color(rainbow(curdT));
    }

    if (spheres[i].vy > 0) {
      spheres[i].vy = add(spheres[i].vy, negGravity);
    } else if (spheres[i].vy < 0) {
      spheres[i].vy = add(spheres[i].vy, gravity);
    } else if (parseFloat(spheres[i].vy).toPrecision(5) == 0.00000) {
      spheres[i].vy = strip(getRandomInt(-2, 2) / 100 * dTint);
      spheres[i].material.color = new THREE.Color(rainbow(curdT));
    }
    if (spheres[i].vz > 0) {
      spheres[i].vz = add(spheres[i].vz, negGravity);
    } else if (spheres[i].vz < 0) {
      spheres[i].vz = add(spheres[i].vz, gravity);
    } else if (parseFloat(spheres[i].vy).toPrecision(5) == 0.00000) {
      spheres[i].vz = strip(getRandomInt(-2, 2) / 100 * dTint);
      spheres[i].material.color = new THREE.Color(rainbow(curdT));
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

function strip(number) {
  return (parseFloat(number).toPrecision(6));
}

function rainbow(length, maxLength) {
  maxLength = 0.070;
  var i = (length * 255 / maxLength);
  var r = Math.round(Math.sin(0.024 * i + 0) * 127 + 128);
  var g = Math.round(Math.sin(0.024 * i + 2) * 127 + 128);
  var b = Math.round(Math.sin(0.024 * i + 4) * 127 + 128);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}