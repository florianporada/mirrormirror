import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import cannonDebugger from 'cannon-es-debugger';
import dat from 'dat.gui';
import TWEEN from '@tweenjs/tween.js';

import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

import { addControlButton, imageTextElement, setLoadingState } from './utils/helper';
import { getCenterPoint, setThreeContext, toggleAxesHelper } from './utils/three_helper';
import { skyboxes, avatars, storyboard, roomObjects } from './utils/three_data';
import { joints, initPoseNet, disposePoseNet } from './utils/posenet';
import {
  lightObject,
  lookAtObject,
  sphereObject,
  textObject,
  bodyObject,
} from './utils/three_objects';
import { isMobile } from './utils/demo_util';

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

// Three
const mixers = [];
const storyboardIterator = storyboard.values();

let camera;
let sound;
let scene;
let renderer;
let clock;
let controls;
let currentStory = storyboardIterator.next();

// Cannon
let world;

const lookAtDirection = new THREE.Vector3();

// const textureLoader = new THREE.TextureLoader();
// const background = new THREE.CubeTextureLoader()
//   .setPath('/assets/textures/cube/')
//   .load(skyboxes[0]);

function handlePosenetButtons() {
  const connectPosenetBtn = imageTextElement('connect body', 'connectposenetbtn', () => {
    guiState.appControl.posenetActive = true;
    initPoseNet();
    const activeButton = document.getElementById('connectposenetbtn');
    if (activeButton) activeButton.remove();
  });
  const disconnectPosenetBtn = imageTextElement('disconnect body', 'disconnectposenetbtn', () => {
    guiState.appControl.posenetActive = false;
    disposePoseNet();
    const activeButton = document.getElementById('disconnectposenetbtn');
    if (activeButton) activeButton.remove();
  });

  if (guiState.appControl.posenetActive) {
    const activeButton = document.getElementById('connectposenetbtn');

    if (activeButton) activeButton.remove();
    addControlButton(disconnectPosenetBtn);
  } else {
    const activeButton = document.getElementById('disconnectposenetbtn');

    if (activeButton) activeButton.remove();
    addControlButton(connectPosenetBtn);
  }
}

function thirdPerson() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  camera.position.set(-3.609879835590135, 2.572977063101824, -4.954594089199559);
  controls.target = new THREE.Vector3(0, 1.5, 0);
}

function firstPerson() {
  const mirror = scene.getObjectByName('mirror');

  controls = new PointerLockControls(camera, document.body);
  controls.isPointerLockControls = true;
  controls.lock();

  camera.position.set(0, 1.65, 0.1);
  camera.lookAt(getCenterPoint(mirror));

  handlePosenetButtons();

  // triggers when going in pointer mode
  controls.addEventListener('lock', () => {
    const pressEscBtn = imageTextElement('press esc', 'pressesc');
    const goInsideBtn = document.getElementById('goinside');

    if (goInsideBtn) goInsideBtn.remove();

    handlePosenetButtons();
    addControlButton(pressEscBtn);
  });

  // triggers when going out of pointer mode
  controls.addEventListener('unlock', () => {
    const pressEscBtn = document.getElementById('pressesc');
    const goInsideBtn = imageTextElement('go inside', 'goinside', () => {
      firstPerson();
    });

    if (pressEscBtn) pressEscBtn.remove();

    thirdPerson();
    addControlButton(goInsideBtn);
    handlePosenetButtons();
  });
}

function moveCamera(start, end, time, cb) {
  new TWEEN.Tween(start)
    .to(end, time || 3000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate((d) => {
      camera.position.set(d.x, d.y, d.z);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    })
    .onComplete(() => {
      if (typeof cb === 'function') cb();
    })
    .start();
}

function storyboardHandler(iter) {
  if (iter.done) {
    // controls.enablePan = true;
    controls.enableZoom = true;

    if (isMobile()) {
      addControlButton(VRButton.createButton(renderer));
    } else {
      const nextBtn = document.getElementById('next');
      const pressEscBtn = imageTextElement('press esc', 'pressesc', () => {
        if (typeof controls.lock === 'function') controls.lock();
      });

      if (nextBtn) nextBtn.remove();

      handlePosenetButtons();
      addControlButton(pressEscBtn);
    }

    const from = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };

    const to = {
      x: 0,
      y: 1.6,
      z: 0,
    };

    moveCamera(from, to, 1000, () => {
      firstPerson();
    });

    return;
  }

  currentStory = iter.value;

  if (currentStory.title === '#2') {
    sound.play();
  }

  controls.enablePan = false;
  // controls.enableZoom = false;

  textObject({
    position: currentStory.textPosition,
    rotation: currentStory.textRotation,
    text: currentStory.text,
    name: currentStory.title,
    scale: 1,
    addLight: true,
  }).then((data) => {
    scene.add(data);

    const from = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };

    const to = {
      x: currentStory.cameraPosition.x,
      y: currentStory.cameraPosition.y,
      z: currentStory.cameraPosition.z,
    };

    setTimeout(() => {
      moveCamera(from, to, 3000, () => {
        controls.target.copy(scene.position);
        if (typeof currentStory.cb === 'function') currentStory.cb();
      });
    }, 1000);
  });
}

function userControls() {
  // const usercontrols = document.getElementById('usercontrols');
  const nextButton = imageTextElement('next', 'next', () => {
    const current = storyboardIterator.next();
    storyboardHandler(current);
  });

  addControlButton(nextButton);
}

function physicsHandler(list, cannonWorld) {
  if (cannonWorld) cannonWorld.step(1 / 60);

  Object.values(list).forEach(async (object) => {
    if (object.physics) {
      const obj = await object.obj;
      const objPhysics = cannonWorld.bodies.find((el) => el.name === `${obj.name}-physics`);

      obj.position.copy(objPhysics.position);
      obj.quaternion.copy(objPhysics.quaternion);
    }
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

async function render() {
  // const time = performance.now() * 0.0002;
  const delta = clock.getDelta();

  if (typeof controls.update === 'function') {
    controls.update(delta);
  }

  mixers.forEach((mxr) => {
    if (mxr) mxr.update(delta);
  });

  // Scene Config
  if (currentStory.options.rotate) {
    controls.autoRotate = true;
  } else {
    controls.autoRotate = false;
  }

  if (roomObjects.movingLight?.obj[0].name) {
    const movingLight = roomObjects.movingLight.obj[0];

    movingLight.rotation.y += 0.01;
    movingLight.rotation.x = -Math.cos(delta) / 2;
  }

  const lookAtPoint = scene.getObjectByName('lookAtPoint');

  const avatar = scene.getObjectByName('avatar');
  if (avatar) {
    const head = scene.getObjectByName(avatars[guiState.threeControls.avatarIndex].headAnchor);

    if (
      (renderer.xr.isPresenting && !guiState.appControl.posenetActive) ||
      (controls?.isPointerLockControls && !guiState.appControl.posenetActive)
    ) {
      camera.getWorldDirection(lookAtDirection);

      lookAtDirection.setY(lookAtDirection.y + 1.15);

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

      head.lookAt(getCenterPoint(lookAtPoint));

      leftShoulder.rotation.z = -1.4677821795587749 + -data.leftShoulder;
      leftArm.rotation.z = 6.795543826994568 + -data.leftElbow;
      rightShoulder.rotation.z = 2.0155040367442623 + data.rightShoulder;
      rightArm.rotation.z = 0.795543826994568 + data.rightElbow;
    }
  }

  // Physics loop
  physicsHandler(roomObjects, world);

  // Tween loop
  TWEEN.update();

  // Three loop
  renderer.render(scene, camera);
}

function animate() {
  renderer.setAnimationLoop(render);
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

function addSound() {
  const listener = new THREE.AudioListener();
  camera.add(listener);

  // create a global audio source
  // sound = new THREE.Audio(listener);
  sound = new THREE.PositionalAudio(listener);

  // load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('assets/sounds/Potential Lover - A V2.mp3', (buffer) => {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.4);
  });
}

function loadAvatar(index = 1) {
  const avatar = scene.getObjectByName('avatar');
  if (avatar) scene.remove(avatar);

  console.log(`Load avatar ${index}: ${avatars[index].description}`);

  bodyObject({
    url: avatars[index].object,
    name: 'avatar',
    texture: avatars[index].image,
    playAnimation: avatars[index].playAnimation,
    position: {
      y: 0,
      z: 0,
    },
  }).then(([body, mxr]) => {
    setLoadingState(false);
    onWindowResize();
    mxr.forEach((m) => mixers.push(m));
    scene.add(body);
  });
}

function toggleSphere() {
  const name = 'worldsphere';
  if (scene.getObjectByName(name)) {
    scene.remove(scene.getObjectByName(name));
  } else {
    scene.add(sphereObject({ name, size: 15, texture: 'assets/textures/fisheye_sphere.jpg' }));
  }
}

function switchSkyBox(idx) {
  const bg = new THREE.CubeTextureLoader().setPath('assets/textures/cube/').load(skyboxes[idx]);

  scene.background = bg;
}

function debugView(state) {
  toggleAxesHelper();
  cannonDebugger(scene, world.bodies);

  globalDebug = state;
}

function initCannon() {
  world = new CANNON.World();
  world.gravity.set(0, -9.82, 0); // m/s²
  world.broadphase = new CANNON.NaiveBroadphase();

  // Tweak contact properties.
  // Contact stiffness - use to make softer/harder contacts
  world.defaultContactMaterial.contactEquationStiffness = 1e9;

  // Stabilization time in number of timesteps
  world.defaultContactMaterial.contactEquationRelaxation = 4;

  const solver = new CANNON.GSSolver();
  solver.iterations = 10;
  solver.tolerance = 0.1;
  world.solver = new CANNON.SplitSolver(solver);
  // use this to test non-split solver
  // world.solver = solver
}

async function initObjects(list) {
  Object.values(list).forEach(async (value) => {
    if (value.disable) return;
    const objects = !Array.isArray(value.obj) ? [value.obj] : value.obj;

    for (let index = 0; index < objects.length; index += 1) {
      // eslint-disable-next-line no-await-in-loop
      const element = await objects[index];

      if (value.physics && !value.disable) {
        const { position, quaternion } = element;
        const { width, height, depth } = element.geometry.parameters;
        const physicBodySize = new CANNON.Vec3(width, height, depth || 0.1).scale(0.5);
        const physicBodyPosition = new CANNON.Vec3(position.x, position.y, position.z);
        const physicBodyQuat = new CANNON.Quaternion(
          quaternion.x,
          quaternion.y,
          quaternion.z,
          quaternion.w
        );

        const physicBody = new CANNON.Body({
          mass: value.gravity ? 5 : 0,
          position: physicBodyPosition, // m
          shape: new CANNON.Box(physicBodySize),
          quaternion: physicBodyQuat,
        });
        physicBody.name = `${element.name}-physics`;
        physicBody.linearDamping = 0.9;

        world.addBody(physicBody);
      }

      if (value.audioSource && sound) {
        element.add(sound);
      }

      if (element) {
        scene.add(element);
      }
    }
  });
}

function init() {
  setLoadingState(true);

  clock = new THREE.Clock();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfbf1e6);
  scene.fog = new THREE.Fog(0xffffff, 5, 60);

  // Debug View
  // debug();

  // Camera
  addCamera({
    name: 'camera1',
    position: { x: -3.609879835590135, y: 2.572977063101824, z: -4.954594089199559 },
    debug: globalDebug,
  });

  // Sound
  addSound();

  // Lights
  const [light1, lightTarget] = lightObject({
    name: 'light1',
    position: { x: 15.5, y: 17.8, z: 1.7 },
    color: 0xfbf1e6, // #fbf1e6
    intensity: 1.1,
  });

  scene.add(light1);
  scene.add(lightTarget);

  const [light2] = lightObject({
    name: 'light2',
    position: { x: 1, y: 2, z: 1 },
    color: 0xfbf1e6, // #fff186
    type: 'PointLight',
    intensity: 0.3,
  });
  scene.add(light2);

  const light = new THREE.AmbientLight(0x404040); // soft white light

  scene.add(light);

  // Avatar
  loadAvatar(guiState.threeControls.avatarIndex);

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

  // ThirdPerson Controls
  thirdPerson();

  // Context
  setThreeContext({
    sound,
    camera,
    scene,
    gui,
  });

  // Init first scene
  storyboardHandler(currentStory);

  // Init user controls
  userControls();

  // Add console debug
  window.debugView = debugView;

  // Resize
  window.addEventListener('resize', onWindowResize, false);
}

function addThreeControls() {
  const appControl = gui.addFolder('App Control');
  const appControlPosenet = appControl.add(guiState.appControl, 'posenetActive');
  appControlPosenet.onChange((value) => {
    if (value) {
      initPoseNet();
    } else {
      disposePoseNet();
    }
  });

  const threeControl = gui.addFolder('Three Controls');
  threeControl.open();
  threeControl.add(
    {
      next: () => {
        const current = storyboardIterator.next();
        storyboardHandler(current);
      },
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
      'Look at text': () => {
        controls.target = new THREE.Vector3(0, 2, 1);
      },
    },
    'Look at text'
  );
  threeControl.add(
    {
      debugView,
    },
    'debugView'
  );
  threeControl.add(
    {
      'World Sphere': toggleSphere,
    },
    'World Sphere'
  );
  threeControl.add(
    {
      'Camera Position': () => console.log(camera.position.x, camera.position.y, camera.position.z),
    },
    'Camera Position'
  );
  const threeControlSound = threeControl.add(guiState.threeControls, 'sound');
  const threeControlView = threeControl.add(guiState.threeControls, 'view', [
    'firstPerson',
    '3rdPerson',
  ]);
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
    loadAvatar(value);
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

  gui.close();
}

init();
animate();
addThreeControls();

if (guiState.appControl.posenetActive) {
  initPoseNet();
}
