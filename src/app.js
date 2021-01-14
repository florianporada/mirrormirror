import * as THREE from 'three';

import './style.scss';

import {
  Lensflare,
  LensflareElement,
} from 'three/examples/jsm/objects/Lensflare';
import { Reflector } from 'three/examples/jsm/objects/Reflector';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';

// import { getCenterPoint } from './utils';

const mixers = [];

let camera, scene, renderer, clock, controls;
let debug = false;

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const spaceTexture = [
  'MilkyWay/dark-s_px.jpg',
  'MilkyWay/dark-s_nx.jpg',
  'MilkyWay/dark-s_py.jpg',
  'MilkyWay/dark-s_ny.jpg',
  'MilkyWay/dark-s_pz.jpg',
  'MilkyWay/dark-s_nz.jpg',
];
// const mapTexture = [
//   'map/px.png',
//   'map/nx.png',
//   'map/py.png',
//   'map/ny.png',
//   'map/pz.png',
//   'map/nz.png',
// ];

const background = new THREE.CubeTextureLoader()
  .setPath('assets/textures/cube/')
  .load(spaceTexture);

init();
animate();

function init() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  scene.background = background;
  scene.fog = new THREE.Fog(0x424874, 100, 200);

  // Debug View
  // debug();

  // Camera
  addCamera({
    name: 'camera1',
    position: { x: 0, y: 20, z: 0 },
    debug: debug,
  });

  // Sound
  addAmbientSound();

  // Body
  addBody({
    url: '/assets/models/Spotted-Jelly/Spotted-Jelly.gltf',
    name: 'jelly',
    isAnimated: true,
    position: {
      y: 0.75,
      z: 0,
    },
  });

  // Stage
  addStage({
    name: 'stage1',
    position: {
      y: -1.1,
      z: -0,
    },
  });

  // Lights
  addLight({
    name: 'light1',
    position: { x: -1, y: 1.5, z: -1.5 },
    color: 0x8800ff,
  });
  addLight({
    name: 'light2',
    position: { x: 1, y: 1.5, z: -2.5 },
    color: 0xff0000,
  });

  // Lensflare
  addLensflare();

  // Mirrors
  addMirror({
    name: 'mirror',
    position: { x: 0.25, y: 0.5, z: -5 },
    // rotation: { y: -Math.PI / 6 },
  });
  addMirror({
    name: 'mirror2',
    position: { x: -3, y: 2, z: -3 },
    rotation: { y: 0.6, x: 0.8 },
  });
  addMirror({
    name: 'mirror3',
    position: { x: 3, y: 1, z: -2 },
    rotation: { y: -0.7, x: 0.8 },
  });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.autoClear = false;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth - 15, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.xr.enabled = true;

  document.body.appendChild(renderer.domElement);
  document.body.appendChild(VRButton.createButton(renderer));

  activateKeyboardControls();
  //
  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  // const time = performance.now() * 0.0002;
  const delta = clock.getDelta();

  if (controls) {
    controls.update();
  }

  mixers.forEach((mxr) => {
    if (mxr) mxr.update(delta);
  });

  // const mirror = scene.getObjectByName('mirror');
  // const mirror2 = scene.getObjectByName('mirror2');

  // mirror.rotation.z = -Math.sin(time) / 3;
  // mirror2.rotation.y = -Math.cos(time) / 2;

  // console.log(mirror2.rotation.y);

  renderer.render(scene, camera);
}

// Objects & Assets

function addMirror({ name, rotation, position, size }) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  const rot = { ...{ x: 0, y: 0, z: 0 }, ...rotation };
  const mirrorSize = { ...{ x: 2.4, y: 4.4 }, ...size };

  const reflector = new Reflector(
    new THREE.PlaneBufferGeometry(mirrorSize.x, mirrorSize.y),
    {
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
    },
  );

  reflector.name = name;

  reflector.position.set(pos.x, pos.y, pos.z);
  reflector.rotation.set(rot.x, rot.y, rot.z);

  scene.add(reflector);

  const frameGeometry = new THREE.BoxBufferGeometry(
    mirrorSize.x + 0.2,
    mirrorSize.y + 0.2,
    0.1,
  );
  const frameMaterial = new THREE.MeshPhongMaterial();
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);

  frame.position.z = -0.07;
  frame.castShadow = true;
  frame.receiveShadow = true;

  reflector.add(frame);
}

function addStage({ name, position } = {}) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  const boxGeometry = new THREE.BoxBufferGeometry(1.5, 0.1, 1.5);
  const boxMaterial = new THREE.MeshPhongMaterial();
  const box = new THREE.Mesh(boxGeometry, boxMaterial);

  box.name = name;

  box.position.set(pos.x, pos.y, pos.z);

  box.castShadow = true;
  box.receiveShadow = true;

  scene.add(box);
}

// function addGeometry() {
//   const torusGeometry = new THREE.TorusKnotBufferGeometry(0.4, 0.15, 150, 20);
//   const torusMaterial = new THREE.MeshStandardMaterial({
//     roughness: 0.01,
//     metalness: 0.2,
//     envMap: background,
//   });
//   const torus = new THREE.Mesh(torusGeometry, torusMaterial);

//   torus.position.y = 0.75;
//   torus.position.z = -2;
//   torus.castShadow = true;
//   torus.receiveShadow = true;

//   scene.add(torus);
// }

function addBody({ url, name, position, isAnimated }) {
  // defaults
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  const scale = { x: 0.5, y: 0.5, z: 0.5 };

  gltfLoader.load(
    // resource URL
    url,
    // called when the resource is loaded
    function (gltf) {
      gltf.scene.name = name;

      gltf.scene.position.set(pos.x, pos.y, pos.z);
      gltf.scene.scale.set(scale.x, scale.y, scale.z);

      gltf.scene.castShadow = true;
      gltf.scene.receiveShadow = true;

      if (isAnimated) {
        const mixer = new THREE.AnimationMixer(gltf.scene);

        mixers.push(mixer);

        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });
      }

      scene.add(gltf.scene);
      onWindowResize();
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.log('An error happened', error);
    },
  );
}

function addLight({ name, position, color, debug = false }) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };

  const light = new THREE.DirectionalLight(color);

  light.name = name;

  light.position.set(pos.x, pos.y, pos.z);
  light.castShadow = true;
  light.shadow.camera.zoom = 4;

  scene.add(light);
  light.target.position.set(0, 0, -2);

  scene.add(light.target);

  if (debug) {
    const helper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(helper);
  }
}

function addCamera({ name, position, debug }) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };

  console.log(position);
  console.log(pos);

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  camera.name = name;
  camera.position.set(pos.x, pos.y, pos.z);
  camera.lookAt(0, 0, 0);

  if (debug) {
    const helper = new THREE.CameraHelper(camera);
    scene.add(helper);
  }
}

function addLensflare() {
  const lensflare = new Lensflare();
  const texture0 = textureLoader.load(
    'assets/textures/lensflare/lensflare0.png',
  );
  const texture3 = textureLoader.load(
    'assets/textures/lensflare/lensflare3.png',
  );

  lensflare.position.set(0, 5, -5);
  lensflare.addElement(new LensflareElement(texture0, 700, 0));
  lensflare.addElement(new LensflareElement(texture3, 60, 0.6));
  lensflare.addElement(new LensflareElement(texture3, 70, 0.7));
  lensflare.addElement(new LensflareElement(texture3, 120, 0.9));
  lensflare.addElement(new LensflareElement(texture3, 70, 1));

  scene.add(lensflare);
}

function addAmbientSound() {
  const listener = new THREE.AudioListener();

  // create a global audio source
  const sound = new THREE.Audio(listener);

  // load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('assets/sounds/ambient01.mp3', function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.1);
  });

  var btn = document.createElement('BUTTON');
  btn.innerHTML = 'sound on';
  btn.classList.add('control');
  btn.onclick = function () {
    if (sound.isPlaying) {
      btn.innerHTML = 'sound on';
      sound.pause();
    } else {
      btn.innerHTML = 'sound off';
      sound.play();
    }
  };

  document.body.appendChild(btn);
}

function activateEgoView() {
  controls = new OrbitControls(camera, renderer.domElement);

  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableKeys = true;
  // controls.autoRotate = true;

  camera.position.set(0, 0, 0.01);
  camera.lookAt(0, 0, 0.01);

  controls.update();
}

function activateFirstPersonControls() {
  controls = new FirstPersonControls(camera, renderer.domElement);

  controls.lookSpeed = 0.4;
  controls.movementSpeed = 20;
  controls.noFly = true;
  controls.lookVertical = true;
  controls.constrainVertical = true;
  controls.verticalMin = 1.0;
  controls.verticalMax = 2.0;
  controls.lon = -150;
  controls.lat = 120;
}

function activateKeyboardControls() {
  document.addEventListener('keydown', onDocumentKeyDown, false);

  function onDocumentKeyDown(event) {
    const keyCode = event.which;

    if (keyCode == 79) {
      // 'o'
      console.log('orbit controls');

      activateEgoView();
    } else if (keyCode == 80) {
      // 'p'
      console.log('first person controls');

      activateFirstPersonControls();
    }
  }
}

function displayAxisHelper() {
  // axis helper
  const axesHelper = new THREE.AxesHelper(20);
  scene.add(axesHelper);
}

window.debug = function (state) {
  displayAxisHelper();

  debug = state;
};
