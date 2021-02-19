import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import cannonDebugger from 'cannon-es-debugger';
import dat from 'dat.gui';
import TWEEN from '@tweenjs/tween.js';

import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

import { setLoadingState } from './utils/helper';
import { getCenterPoint, setThreeContext } from './utils/three_helper';
import { skyboxes, avatars } from './utils/three_data';
import { joints, initPoseNet } from './utils/posenet';
import {
  lensflareObject,
  lightObject,
  lookAtObject,
  mirrorObject,
  movingLightObject,
  furnitureObject,
  floorObject,
} from './utils/three_objects';

// Global config
let globalDebug = false;
const gui = new dat.GUI({ width: 300 });
const guiState = {
  appControl: {
    posenetActive: false,
  },
  threeControls: {
    step: 1,
    sound: false,
    view: '3rdPerson',
    avatarIndex: 1,
    roomIndex: 0,
    videoRoom: false,
  },
};

// Threejs specific config
const mixers = [];

const scenes = [
  { cameraPosition: new THREE.Vector3(2, 2, 2) },
  { cameraPosition: new THREE.Vector3(2, 3, 3) },
  { cameraPosition: new THREE.Vector3(2, 3, 3) },
  { cameraPosition: new THREE.Vector3(1, 3, 3) },
  { cameraPosition: new THREE.Vector3(5, 4, 3) },
];

const sceneIterator = scenes.values();

const roomObjects = {
  movingLight: {
    disable: false,
    obj: movingLightObject({
      name: 'moving-light',
      position: { x: -8, y: 0, z: -1 },
      color: 0xffbb72, // #ffbb72
    }),
  },
  lensflare: { disable: true, obj: lensflareObject() },
  floor: {
    disable: false,
    physics: true,
    obj: floorObject({
      name: 'floor',
      position: {
        y: -0.1,
        z: -0,
      },
    }),
  },
  mirror: {
    disable: false,
    physics: true,
    obj: mirrorObject({
      name: 'mirror',
      position: { x: 0.25, y: 4, z: 2 },
      rotation: { y: Math.PI, x: 0.02 },
      size: { x: 3, y: 2 },
    }),
  },
  plant: {
    disable: false,
    physics: true,
    obj: furnitureObject({
      name: 'plant',
      position: { x: 4, y: 3, z: 2.7 },
      texture: '/assets/textures/room_assets/plant1.png',
      scale: 2,
      rotation: { y: Math.PI / 6 },
    }),
  },
  lowboy: {
    disable: true,
    obj: furnitureObject({
      name: 'lowboy',
      position: { x: -3, y: 0, z: 1.7 },
      texture: '/assets/textures/room_assets/lowboy.png',
      scale: 2,
      lookAtAvatar: true,
    }),
  },
};

// Three
let camera;
let sound;
let scene;
let renderer;
let clock;
let controls;
// let cameraLookAt;

// Cannon
let world;

const lookAtDirection = new THREE.Vector3();
const gltfLoader = new GLTFLoader();
const objLoader = new OBJLoader();
const textureLoader = new THREE.TextureLoader();
// const background = new THREE.CubeTextureLoader()
//   .setPath('/assets/textures/cube/')
//   .load(skyboxes[0]);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
  // const time = performance.now() * 0.0002;
  const delta = clock.getDelta();

  // if (controls) {
  //   controls.update(delta);
  // }

  mixers.forEach((mxr) => {
    if (mxr) mxr.update(delta);
  });

  // const mirror = scene.getObjectByName('mirror-parent');
  // if (mirror) mirror.rotation.x += 0.005;

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
    const head = scene.getObjectByName(avatars[guiState.threeControls.avatarIndex].headAnchor);

    if (controls?.isPointerLockControls) {
      camera.getWorldDirection(lookAtDirection);

      head.lookAt(lookAtDirection);
    }

    if (guiState.appControl.posenetActive) {
      const { data } = joints;

      const leftShoulder = scene.getObjectByName('upper_armL');
      const leftArm = scene.getObjectByName('forearmL');
      const rightShoulder = scene.getObjectByName('upper_armR');
      const rightArm = scene.getObjectByName('forearmR');

      lookAtPoint.position.x = 0 + data.head.x;
      lookAtPoint.position.y = 2 + data.head.y;
      lookAtPoint.position.z = 10;

      // const startPosition = new THREE.Vector3().copy(lookAtPoint.position);
      // const endPosition = new THREE.Euler().copy(head.rotation);
      // new TWEEN.Tween(lookAtPoint).to({ position: endPosition }, 200).start();

      head.lookAt(getCenterPoint(lookAtPoint));

      leftShoulder.rotation.z = -1.4677821795587749 + -data.leftShoulder;
      leftArm.rotation.z = 6.795543826994568 + -data.leftElbow;
      rightShoulder.rotation.z = 2.0155040367442623 + data.rightShoulder;
      rightArm.rotation.z = 0.795543826994568 + data.rightElbow;
    }

    if (renderer.xr.isPresenting) {
      // head.rotation.y += 0.01;
      camera.getWorldDirection(lookAtDirection);

      head.lookAt(lookAtDirection);
    }
  }

  // Physics loop
  if (world) world.step(1 / 60);

  const mirror = scene.getObjectByName('mirror');
  const mirrorPhysics = world.bodies.find((el) => el.name === `${mirror.name}-physics`);

  // // Copy coordinates from Cannon.js to Three.js
  mirror.position.copy(mirrorPhysics.position);
  mirror.quaternion.copy(mirrorPhysics.quaternion);

  const plant = scene.getObjectByName('plant');
  const plantPhysics = world.bodies.find((el) => el.name === `${plant.name}-physics`);

  plant.position.copy(plantPhysics.position);
  plant.quaternion.copy(plantPhysics.quaternion);

  // Tween loop
  TWEEN.update();

  // Three loop
  renderer.render(scene, camera);
}

function animate() {
  renderer.setAnimationLoop(render);
}

function addBody({ url, name, position, scale, playAnimation, texture }) {
  // defaults
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  const scl = { ...{ x: 1, y: 1, z: 1 }, ...scale };
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

  setLoadingState(true);
  loader.load(
    // resource URL
    url,
    // called when resource is loaded
    (object) => {
      const obj = object;

      if (extension === 'gltf') {
        obj.scene.name = name;

        obj.scene.traverse((node) => {
          // eslint-disable-next-line no-param-reassign
          if (node.isMesh || node.isLight) {
            /* eslint-disable no-param-reassign */
            node.receiveShadow = true;
            node.material.flatShading = false;
            node.castShadow = true;
            if (node.isMesh)
              if (node instanceof THREE.Mesh) {
                // cameraLookAt = getCenterPoint(node);
                node.geometry.normalizeNormals();
                const map = textureLoader.load(texture);
                if (texture) {
                  node.skinning = false;
                  node.material.map = map;
                  node.material.needsUpdate = true;
                }
              }
          }
        });

        obj.scene.castShadow = true;
        obj.scene.receiveShadow = true;
        obj.scene.position.set(pos.x, pos.y, pos.z);
        obj.scene.scale.set(scl.x, scl.y, scl.z);
        // obj.scene.rotation.y = THREE.MathUtils.degToRad(180);

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
        obj.castShadow = true;
        obj.receiveShadow = true;

        scene.add(obj);
      }

      setLoadingState(false);
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

function addCamera({ name, position, debug = false }) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);

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

function thirdPerson() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  camera.position.set(-3.609879835590135, 2.572977063101824, -4.954594089199559);
  camera.lookAt(0, 0, 0);
}

function firstPerson() {
  const mirror = scene.getObjectByName('mirror');
  controls = new PointerLockControls(camera, document.body);

  controls.isPointerLockControls = true;
  controls.lock();

  camera.position.set(0, 1.600000023841858, 0.1);
  camera.lookAt(getCenterPoint(mirror));

  controls.addEventListener('lock', () => {
    console.log('locked');
  });

  controls.addEventListener('unlock', () => {
    console.log('unlocked');
    thirdPerson();
  });
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
    texture: avatars[index].image,
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

function toggleAxesHelper() {
  if (scene.getObjectByName('axishelper')) {
    scene.remove(scene.getObjectByName('axishelper'));
  } else {
    // axis helper
    const axishelper = new THREE.AxesHelper(20);
    axishelper.name = 'axishelper';
    scene.add(axishelper);
  }
}

window.debug = function debug(state) {
  toggleAxesHelper();

  globalDebug = state;
};

function initCannon() {
  world = new CANNON.World();
  world.gravity.set(0, -19.82, 0); // m/s²
  world.broadphase = new CANNON.NaiveBroadphase();

  // Tweak contact properties.
  // Contact stiffness - use to make softer/harder contacts
  world.defaultContactMaterial.contactEquationStiffness = 1e9;

  // Stabilization time in number of timesteps
  world.defaultContactMaterial.contactEquationRelaxation = 4;

  const solver = new CANNON.GSSolver();
  solver.iterations = 20;
  solver.tolerance = 0.1;
  world.solver = new CANNON.SplitSolver(solver);
  // use this to test non-split solver
  // world.solver = solver

  cannonDebugger(scene, world.bodies);
}

function initObjects(list) {
  Object.keys(list).forEach((key) => {
    const objects = !Array.isArray(list[key].obj) ? [list[key].obj] : list[key].obj;

    for (let index = 0; index < objects.length; index += 1) {
      const element = objects[index];

      if (list[key].physics && !list[key].disable) {
        const { position, quaternion } = element;
        const { width, height, depth } = element.geometry.parameters;

        console.log(element.name, depth);

        const physicBodySize = new CANNON.Vec3(width, height, depth || 0.1).scale(0.5);
        const physicBodyPosition = new CANNON.Vec3(position.x, position.y, position.z);
        const physicBodyQuat = new CANNON.Quaternion(
          quaternion.x,
          quaternion.y,
          quaternion.z,
          quaternion.w
        );

        const physicBody = new CANNON.Body({
          mass: element.name === 'floor' ? 0 : 5,
          position: physicBodyPosition, // m
          shape: new CANNON.Box(physicBodySize),
          quaternion: physicBodyQuat,
        });
        physicBody.name = `${element.name}-physics`;
        physicBody.linearDamping = 0.9;

        world.addBody(physicBody);
      }

      if (element && !list[key].disable) {
        scene.add(element);
      }
    }
  });
}

function init() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfbf1e6);
  scene.fog = new THREE.Fog(0xffffff, 5, 30);

  // Debug View
  // debug();

  // Camera
  addCamera({
    name: 'camera1',
    position: { x: -3.609879835590135, y: 2.572977063101824, z: -4.954594089199559 },
    debug: globalDebug,
  });

  // Sound
  addAmbientSound();

  // Lights
  const [light1] = lightObject({
    name: 'light1',
    position: { x: 1, y: 5.5, z: -0.5 },
    color: 0xfbf1e6, // #fbf1e6
  });
  // const [light2] = lightObject({
  //   name: 'light2',
  //   position: { x: 1, y: 5.5, z: -4.5 },
  //   color: 0xfbf116, // #fbf116
  // });
  const light = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(light);

  scene.add(light1);

  // Avatar
  addBody({
    url: avatars[guiState.threeControls.avatarIndex].object,
    name: 'avatar',
    texture: avatars[guiState.threeControls.avatarIndex].image,
    playAnimation: avatars[guiState.threeControls.avatarIndex].playAnimation,
    type: 'obj',
    position: {
      y: 0,
      z: 0,
    },
  });

  scene.add(lookAtObject({ name: 'lookAtPoint', position: new THREE.Vector3(1, 1, 1) }));
  initCannon();

  initObjects(roomObjects);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.autoClear = false;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth - 15, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.xr.enabled = true;

  document.body.appendChild(renderer.domElement);
  document.body.appendChild(VRButton.createButton(renderer));

  // ThirdPerson Controls
  thirdPerson();

  // Context
  setThreeContext({
    sound,
    camera,
    scene,
    gui,
  });

  // Resize
  window.addEventListener('resize', onWindowResize, false);
}

function sceneHandler() {
  const { value, done } = sceneIterator.next();

  if (done) return;

  const from = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  };

  const to = {
    x: value.cameraPosition.x,
    y: value.cameraPosition.y,
    z: value.cameraPosition.z,
  };

  new TWEEN.Tween(from)
    .to(to, 600)
    .easing(TWEEN.Easing.Linear.None)
    .onUpdate((d) => {
      camera.position.set(d.x, d.y, d.z);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    })
    .onComplete(() => {
      controls.target.copy(scene.position);
    })
    .start();
}

function addThreeControls() {
  const appControl = gui.addFolder('App Control');
  const appControlPosenet = appControl.add(guiState.appControl, 'posenetActive');
  appControlPosenet.onChange((value) => {
    if (value) initPoseNet();
  });

  const threeControl = gui.addFolder('Three Controls');
  threeControl.open();
  threeControl.add(
    {
      next: sceneHandler,
    },
    'next'
  );
  threeControl.add(
    {
      lock: () => {
        if (typeof controls.lock === 'function') controls.lock();
      },
    },
    'lock'
  );
  threeControl.add(
    {
      axes: toggleAxesHelper,
    },
    'axes'
  );
  const threeControlSound = threeControl.add(guiState.threeControls, 'sound');
  const threeControlView = threeControl.add(guiState.threeControls, 'view', [
    'firstPerson',
    '3rdPerson',
  ]);
  const threeControlVideoRoom = threeControl.add(guiState.threeControls, 'videoRoom');
  const threeControlAvatarIndex = threeControl.add(
    guiState.threeControls,
    'avatarIndex',
    avatars.map((value, index) => index)
  );
  const threeControlRoomIndex = threeControl.add(
    guiState.threeControls,
    'roomIndex',
    skyboxes.map((value, index) => index)
  );

  threeControlAvatarIndex.onChange((value) => {
    loadNextAvatar(value);
  });
  threeControlRoomIndex.onChange((value) => {
    switchSkyBox(value);
  });
  threeControlSound.onChange((value) => {
    if (!value) {
      sound.pause();
    } else {
      sound.play();
    }
  });
  threeControlView.onChange((value) => {
    if (value === '3rdPerson') {
      thirdPerson();
    } else if (value === 'firstPerson') {
      firstPerson();
    }
  });
  threeControlVideoRoom.onChange(() => {
    toggleVideoSphere(scene);
  });
}

init();
animate();
addThreeControls();

if (guiState.appControl.posenetActive) {
  initPoseNet();
}
