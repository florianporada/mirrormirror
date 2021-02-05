import * as THREE from 'three';
import dat from 'dat.gui';

import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { getCenterPoint, setThreeContext } from './utils/three_helper';
import { joints, initBodyTracking } from './utils/posenet';
import {
  lensflareObject,
  lightObject,
  lookAtObject,
  mirrorObject,
  movingLightObject,
  platformObject,
} from './utils/three_objects';

// Global config
const gui = new dat.GUI({ width: 300 });
let globalDebug = false;

// Threejs specific config
const mixers = [];
const avatars = [
  {
    object: '/assets/models/rigged_body_1/RiggedFigure.gltf',
    image: '/assets/models/generated_01/swim.png',
    description: 'The rigged buddy',
    playAnimation: false,
  },
  {
    object: '/assets/models/generated_01/result_swim_256.obj',
    image: '/assets/models/generated_01/swim.png',
    description: 'Some guy in a swimsuit',
  },
  {
    object: '/assets/models/generated_02/result_pirate_256.obj',
    image: '/assets/models/generated_02/pirate.png',
    description: 'A pirrrrate',
  },
  {
    object: '/assets/models/generated_03/result_test_256.obj',
    image: '/assets/models/generated_03/test.png',
    description: 'The coffee dude',
  },
  {
    object: '/assets/models/generated_04/result_boi_256.obj',
    image: '/assets/models/generated_04/boi.png',
    description: 'Not a pirrrrate',
  },
  {
    object: '/assets/models/generated_05/result_boi_bg_256.obj',
    image: '/assets/models/generated_05/boi_bg.png',
    description: 'Still noot a pirrrrate',
  },
  {
    object: '/assets/models/generated_06/result_collage_01_256.obj',
    image: '/assets/models/generated_06/collage_01.png',
    description: 'Something combined 01',
  },
  {
    object: '/assets/models/generated_07/result_collage_02_256.obj',
    image: '/assets/models/generated_07/collage_02.png',
    description: 'Something combined 02',
  },
];
const skyboxes = [
  [
    'MilkyWay/dark-s_px.jpg',
    'MilkyWay/dark-s_nx.jpg',
    'MilkyWay/dark-s_py.jpg',
    'MilkyWay/dark-s_ny.jpg',
    'MilkyWay/dark-s_pz.jpg',
    'MilkyWay/dark-s_nz.jpg',
  ],
  ['tree/px.png', 'tree/nx.png', 'tree/py.png', 'tree/ny.png', 'tree/pz.png', 'tree/nz.png'],
  ['map/px.png', 'map/nx.png', 'map/py.png', 'map/ny.png', 'map/pz.png', 'map/nz.png'],
];

let camera;
let sound;
let scene;
let renderer;
let clock;
let controls;

const gltfLoader = new GLTFLoader();
const objLoader = new OBJLoader();
const background = new THREE.CubeTextureLoader()
  .setPath('/assets/textures/cube/')
  .load(skyboxes[0]);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
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

  const mirror = scene.getObjectByName('mirror-parent');
  if (mirror) mirror.rotation.x += 0.005;

  const mirror2 = scene.getObjectByName('mirror2-parent');
  if (mirror2) mirror2.rotation.y += 0.005;

  const mirror3 = scene.getObjectByName('mirror3-parent');
  if (mirror3) mirror3.rotation.z -= 0.005;

  const movienLight = scene.getObjectByName('moving-light-parent');
  if (movienLight) {
    movienLight.rotation.y += 0.01;
    movienLight.rotation.x = -Math.cos(delta) / 2;
  }

  const lookAtPoint = scene.getObjectByName('lookAtPoint');

  const avatar = scene.getObjectByName('avatar');
  if (avatar) {
    avatar.traverse((child) => {
      if (child.isBone) {
        // object.position.set(x,y,z);
        if (child.name === 'neck_joint_1') {
          const { data } = joints;

          lookAtPoint.position.x = 0 + data.head.x;
          lookAtPoint.position.y = 2 + data.head.y;
          lookAtPoint.position.z = 6;

          child.lookAt(getCenterPoint(lookAtPoint));
        }
      }
    });
  }

  renderer.render(scene, camera);
}

function animate() {
  renderer.setAnimationLoop(render);
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

function addBody({ url, name, position, playAnimation }) {
  // defaults
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  const scale = { x: 0.5, y: 0.5, z: 0.5 };
  const loadingDomElement = document.getElementById('Loading');
  const regexExtension = /[^\\]*\.(\w+)$/;
  const extension = url.match(regexExtension)[1];

  let loader;

  switch (extension) {
    case 'obj':
      loader = objLoader;
      break;
    case 'gltf':
    case 'glb':
      loader = gltfLoader;
      break;
    default:
      loader = objLoader;
      console.warn('no valid object deteted (obj, gltf, glb');
  }

  loadingDomElement.classList.add('show');
  loader.load(
    // resource URL
    url,
    // called when resource is loaded
    (object) => {
      const obj = object;

      if (extension === 'gltf') {
        obj.scene.name = name;

        obj.scene.position.set(pos.x, pos.y, pos.z);
        object.scene.scale.set(scale.x, scale.y, scale.z);

        obj.scene.castShadow = true;
        obj.scene.receiveShadow = true;

        if (obj.animations && obj.animations.length > 0 && playAnimation) {
          const mixer = new THREE.AnimationMixer(obj.scene);

          mixers.push(mixer);

          obj.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
        }

        scene.add(obj.scene);
      }

      if (extension === 'obj') {
        obj.name = name;

        scene.add(obj);
      }

      loadingDomElement.classList.remove('show');

      onWindowResize();
    },
    // called when loading is in progresses
    (xhr) => {
      console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
    },
    // called when loading has errors
    (error) => {
      console.log('An error happened', error);
    }
  );
}

// function addLight({ name, position, color, debug = false }) {
//   const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };

//   const light = new THREE.DirectionalLight(color);

//   light.name = name;

//   light.position.set(pos.x, pos.y, pos.z);
//   light.castShadow = true;
//   light.shadow.camera.zoom = 4;

//   scene.add(light);
//   light.target.position.set(0, 0, -2);

//   scene.add(light.target);

//   if (debug) {
//     const helper = new THREE.CameraHelper(light.shadow.camera);
//     scene.add(helper);
//   }
// }

function addCamera({ name, position, debug = false }) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

  camera.name = name;
  camera.position.set(pos.x, pos.y, pos.z);
  camera.lookAt(0, 0, 0);

  if (debug) {
    const helper = new THREE.CameraHelper(camera);
    scene.add(helper);
  }
}

function addAmbientSound() {
  const listener = new THREE.AudioListener();

  // create a global audio source
  sound = new THREE.Audio(listener);

  // load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('assets/sounds/ambient01.mp3', (buffer) => {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.1);
  });
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

function activateFlightMode() {
  controls = new OrbitControls(camera, renderer.domElement);

  camera.position.set(0, 20, 0);
  camera.lookAt(0, 0, 0);

  controls.update();
}

function loadNextAvatar(index) {
  while (scene.getObjectByName('avatar')) {
    const avatar = scene.getObjectByName('avatar');

    scene.remove(avatar);
  }

  console.log(`Load avatar ${index}: ${avatars[index].description}`);

  addBody({
    url: avatars[index].object,
    name: 'avatar',
    playAnimation: avatars[index].playAnimation,
    position: {
      y: 0.75,
      z: 0,
    },
  });
}

function toggleVideoSphere() {
  if (scene.getObjectByName('videosphere')) {
    scene.remove(scene.getObjectByName('videosphere'));
  } else {
    const video = document.createElement('video');

    video.src = 'assets/textures/video/background_video.mp4';
    video.load();
    video.play();

    const videoTexture = new THREE.VideoTexture(video);
    const geometry = new THREE.SphereGeometry(25, 32, 32);
    const videoMaterial = new THREE.MeshBasicMaterial({
      map: videoTexture,
      side: THREE.DoubleSide,
      toneMapped: false,
    });

    const sphere = new THREE.Mesh(geometry, videoMaterial);

    sphere.name = 'videosphere';
    scene.add(sphere);
  }
}

function switchSkyBox(idx) {
  const bg = new THREE.CubeTextureLoader().setPath('assets/textures/cube/').load(skyboxes[idx]);

  scene.background = bg;
}

function displayAxisHelper() {
  // axis helper
  const axesHelper = new THREE.AxesHelper(20);
  scene.add(axesHelper);
}

window.debug = function debug(state) {
  displayAxisHelper();

  globalDebug = state;
};

function initRoom() {
  // Moving light source
  const [movinglight] = movingLightObject({
    name: 'moving-light',
    position: { x: -8, y: 0, z: -1 },
    color: 0xffbb72, // #ffbb72
  });
  scene.add(movinglight);

  // Lensflare
  scene.add(lensflareObject());

  // Mirrors;
  scene.add(
    mirrorObject({
      name: 'mirror',
      position: { x: 0.25, y: 0.5, z: -5 },
      // rotation: { y: -Matpwh.PI / 6 },
    })
  );
  scene.add(
    mirrorObject({
      name: 'mirror2',
      position: { x: -3, y: 2, z: -3 },
      rotation: { y: 0.6, x: 0.8 },
    })
  );
  scene.add(
    mirrorObject({
      name: 'mirror3',
      position: { x: 3, y: 1, z: -2 },
      rotation: { y: -0.7, x: 0.8 },
    })
  );

  // Stage
  scene.add(
    platformObject({
      name: 'stage1',
      position: {
        y: -1.1,
        z: -0,
      },
    })
  );
}

function init() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  scene.background = background;
  scene.fog = new THREE.Fog(0x424874, 100, 200);

  // Debug View
  // debug();

  // Lights
  const [light1] = lightObject({
    name: 'light1',
    position: { x: -1, y: 1.5, z: -1.5 },
    color: 0x8800ff, // #8800ff
  });
  const [light2] = lightObject({
    name: 'light2',
    position: { x: 1, y: 1.5, z: -2.5 },
    color: 0xff0000, // #ff0000
  });

  scene.add(light1, light2);

  // Sound
  addAmbientSound();

  // Camera
  addCamera({
    name: 'camera1',
    position: { x: 1, y: 2.2, z: 1 },
    debug: globalDebug,
  });

  // Avatar
  addBody({
    url: avatars[0].object,
    name: 'avatar',
    playAnimation: avatars[0].playAnimation,
    type: 'obj',
    position: {
      y: 0.75,
      z: 0,
    },
  });

  scene.add(lookAtObject({ name: 'lookAtPoint', position: new THREE.Vector3(1, 1, 1) }));

  initRoom();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.autoClear = false;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth - 15, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.xr.enabled = true;

  document.body.appendChild(renderer.domElement);
  document.body.appendChild(VRButton.createButton(renderer));

  activateFlightMode();
  setThreeContext({
    sound,
    camera,
    scene,
    gui,
  });

  //
  window.addEventListener('resize', onWindowResize, false);
}

function addThreeControls() {
  const guiState = {
    threeControls: {
      sound: false,
      view: '3rdPerson',
      avatarIndex: 0,
      roomIndex: 0,
      videoRoom: false,
    },
  };

  const appControl = gui.addFolder('Three Controls');
  const appControlSound = appControl.add(guiState.threeControls, 'sound');
  const appControlView = appControl.add(guiState.threeControls, 'view', [
    'firstPerson',
    '3rdPerson',
  ]);
  const appControlVideoRoom = appControl.add(guiState.threeControls, 'videoRoom');
  const appControlAvatarIndex = appControl.add(
    guiState.threeControls,
    'avatarIndex',
    avatars.map((value, index) => index)
  );
  const appControlRoomIndex = appControl.add(
    guiState.threeControls,
    'roomIndex',
    skyboxes.map((value, index) => index)
  );

  appControl.open();
  appControlAvatarIndex.onChange((value) => {
    loadNextAvatar(value);
  });
  appControlRoomIndex.onChange((value) => {
    switchSkyBox(value);
  });
  appControlSound.onChange((value) => {
    if (!value) {
      sound.pause();
    } else {
      sound.play();
    }
  });
  appControlView.onChange((value) => {
    if (value === '3rdPerson') {
      activateFlightMode();
    } else if (value === 'firstPerson') {
      activateEgoView();
    }
  });
  appControlVideoRoom.onChange(() => {
    toggleVideoSphere(scene);
  });
}

init();
animate();
initBodyTracking();
addThreeControls();
