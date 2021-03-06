/* globals gcursor, THREE, Stats */

(function () {

var camera;
var container;
var originalColors = {};
var previousPresses = {};
var raycaster;
var renderer;
var scene;
var stats;

var INTERSECTED;
var mouse = new THREE.Vector2();
var radius = 100;
var theta = 0;

init();
animate();

function init() {

  container = document.createElement('div');
  document.body.appendChild(container);

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setClearColor(0xf0f0f0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.sortObjects = false;
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);

  scene = new THREE.Scene();

  var light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  var geometry = new THREE.BoxGeometry(20, 20, 20);

  for (var i = 0; i < 2000; i++) {

    var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff}));

    object.position.x = Math.random() * 800 - 400;
    object.position.y = Math.random() * 800 - 400;
    object.position.z = Math.random() * 800 - 400;

    object.rotation.x = Math.random() * 2 * Math.PI;
    object.rotation.y = Math.random() * 2 * Math.PI;
    object.rotation.z = Math.random() * 2 * Math.PI;

    object.scale.x = Math.random() + 0.5;
    object.scale.y = Math.random() + 0.5;
    object.scale.z = Math.random() + 0.5;

    scene.add(object);

  }

  raycaster = new THREE.Raycaster();

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0';
  container.appendChild(stats.domElement);

  document.addEventListener('mousemove', onDocumentMouseMove, false);

  //

  window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function onDocumentMouseMove(event) {

  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

}

//

function animate() {

  requestAnimationFrame(animate);

  render();
  stats.update();

}

function render() {

  // theta += 0.1;

  camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta));
  camera.position.y = radius * Math.sin(THREE.Math.degToRad(theta));
  camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta));
  camera.lookAt(scene.position);

  camera.updateMatrixWorld();

  // find intersections

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {

    if (INTERSECTED != intersects[0].object) {

      if (INTERSECTED) {
        INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
      }

      INTERSECTED = intersects[0].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex(0x0000ff);

    }

  } else {

    if (INTERSECTED) {
      INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
    }

    INTERSECTED = null;

  }

  if (INTERSECTED) {
    if (!originalColors[INTERSECTED.id]) {
      originalColors[INTERSECTED.id] = INTERSECTED.currentHex;
    }

    if (gcursor.pressed || previousPresses[INTERSECTED.id] !== gcursor.pressed) {
      previousPresses[INTERSECTED.id] = gcursor.pressed;
      INTERSECTED.material.emissive.setHex(gcursor.pressed ? 0xff0000 : originalColors[INTERSECTED.id]);
    }
  }

  renderer.render(scene, camera);

}


gcursor.init({
  mouse: mouse
});

window.addEventListener('gamepadaxismove', function (e) {
  gcursor.onGamepadAxisMove(e);
});

window.addEventListener('gamepadbuttondown', function (e) {
  gcursor.onGamepadButtonDown(e);
});

window.addEventListener('gamepadbuttonup', function (e) {
  gcursor.onGamepadButtonUp(e);
});

})();
