import * as THREE from 'three';
import {
  floorObject,
  furnitureObject,
  lensflareObject,
  mirrorObject,
  movingLightObject,
} from './three_objects';

const avatars = [
  {
    object: '/assets/models/rigged_body_1/RiggedFigure.gltf',
    image: '/assets/models/generated_01/swim.png',
    description: 'The rigged buddy',
    playAnimation: false,
    headAnchor: 'neck_joint_1',
  },
  {
    object: '/assets/models/collage_03_rigged_tex/collage_03_rigged.gltf',
    image: '/assets/models/collage_03_rigged/collage_03.png',
    description: 'The rigged buddy',
    playAnimation: false,
    headAnchor: 'spine006',
  },
  {
    object: '/assets/models/collage_03_rigged/collage_03_rigged.gltf',
    image: '/assets/models/collage_03_rigged/collage_03.png',
    description: 'The rigged buddy',
    playAnimation: false,
    headAnchor: 'spine006',
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

const storyboard = [
  {
    cameraPosition: new THREE.Vector3(37.87368421052629, 17.957894736842107, 24.126315789473665),
    title: '#1',
    text: 'welcome to your self exclamationmark',
    textRotation: {
      x: THREE.MathUtils.degToRad(0),
      y: THREE.MathUtils.degToRad(40),
      z: THREE.MathUtils.degToRad(0),
    },
    textPosition: new THREE.Vector3(29.2, 15.65, 20.95),
    options: {
      rotate: false,
    },
  },
  {
    cameraPosition: new THREE.Vector3(-12.420529948766315, 7.484953274651715, -20.427522578353276),
    title: '#2',
    text: 'why do you want to identify with your avatar questionmark',
    textRotation: {
      x: THREE.MathUtils.degToRad(0),
      y: THREE.MathUtils.degToRad(200),
      z: THREE.MathUtils.degToRad(0),
    },
    textPosition: new THREE.Vector3(-4.787694544476471, 7.905273090393734, -12.75900177034477),
    options: {
      rotate: false,
    },
  },
  {
    cameraPosition: new THREE.Vector3(22.52617722790273, 8.739174305664427, -8.609860688049904),
    title: '#3',
    text: 'how do you identify with your digital body questionmark',
    textRotation: {
      x: THREE.MathUtils.degToRad(0),
      y: THREE.MathUtils.degToRad(92),
      z: THREE.MathUtils.degToRad(0),
    },
    textPosition: new THREE.Vector3(13.535922616169895, 8.5732032536984, -1.1491414168321328),
    options: {
      rotate: false,
    },
  },
  {
    cameraPosition: new THREE.Vector3(-23.180640855215692, 8.474568483694275, 17.060714634760334),
    title: '#4',
    text: 'what connects you with your digital self questionmark',
    textRotation: {
      x: THREE.MathUtils.degToRad(0),
      y: THREE.MathUtils.degToRad(-70),
      z: THREE.MathUtils.degToRad(0),
    },
    textPosition: new THREE.Vector3(-15.883553229171277, 8.12530281282566, 7.788460114443904),
    options: {
      rotate: false,
    },
  },
];

const dropHeight = 3;
const roomObjects = {
  movingLight: {
    disable: true,
    obj: movingLightObject({
      name: 'moving-light',
      position: { x: -8, y: 0, z: -1 },
      color: 0xffbb72, // #fff1cf
    }),
  },
  lensflare: {
    disable: true,
    obj: lensflareObject({ name: 'lensflare', position: { x: 8, y: 9, z: 9 } }),
  },
  floor: {
    disable: false,
    physics: true,
    obj: floorObject({
      name: 'floor',
      size: 15,
      position: {
        y: -0.1,
        z: -0,
      },
    }),
  },
  mirror: {
    disable: false,
    physics: true,
    gravity: true,
    obj: mirrorObject({
      name: 'mirror',
      position: { x: 0.25, y: dropHeight + 2, z: 2 },
      rotation: { y: THREE.MathUtils.degToRad(180), x: 0.0 },
      size: { x: 3, y: 2 },
    }),
  },
  plant: {
    disable: false,
    physics: true,
    gravity: true,
    obj: furnitureObject({
      name: 'plant',
      position: { x: 4, y: dropHeight, z: 2.7 },
      texture: '/assets/textures/room_assets/plant1.png',
      scale: 2,
      rotation: { y: THREE.MathUtils.degToRad(30) },
    }),
  },
  lowboy: {
    disable: false,
    physics: true,
    gravity: true,
    obj: furnitureObject({
      name: 'lowboy',
      position: { x: 0.6, y: dropHeight + 2, z: -5.7 },
      rotation: { y: THREE.MathUtils.degToRad(-30), x: 0.01 },
      texture: '/assets/textures/room_assets/lowboy.png',
      scale: 2,
      lookAtAvatar: false,
    }),
  },
  music: {
    disable: false,
    physics: true,
    gravity: true,
    audioSource: true,
    obj: furnitureObject({
      name: 'music',
      position: { x: -3, y: dropHeight + 2, z: 1.7 },
      rotation: { y: THREE.MathUtils.degToRad(-50), x: 0.01 },
      texture: '/assets/textures/room_assets/music.png',
      scale: 3,
      lookAtAvatar: false,
    }),
  },
  bed: {
    disable: false,
    physics: true,
    gravity: false,
    obj: furnitureObject({
      name: 'bed',
      position: { x: 3, y: 1.8, z: -3 },
      rotation: { y: THREE.MathUtils.degToRad(150), x: 0.01 },
      texture: '/assets/textures/room_assets/bed.png',
      scale: 4,
      lookAtAvatar: false,
    }),
  },
  carpet: {
    disable: false,
    physics: false,
    obj: furnitureObject({
      name: 'carpet',
      position: { x: 0, y: -0.01, z: 0 },
      rotation: {
        y: THREE.MathUtils.degToRad(180),
        x: THREE.MathUtils.degToRad(90),
        z: THREE.MathUtils.degToRad(66),
      },
      texture: '/assets/textures/room_assets/carpet.png',
      scale: 10,
      lookAtAvatar: false,
    }),
  },
  chair: {
    disable: false,
    physics: true,
    gravity: true,
    obj: furnitureObject({
      name: 'chair',
      position: { x: -3.5, y: dropHeight, z: 0.2 },
      rotation: {
        y: THREE.MathUtils.degToRad(-60),
      },
      texture: '/assets/textures/room_assets/chair.png',
      scale: 1,
      lookAtAvatar: false,
    }),
  },
  clothesHorse: {
    disable: false,
    physics: true,
    gravity: true,
    obj: furnitureObject({
      name: 'clothesHorse',
      position: { x: -5, y: dropHeight + 0, z: -1.96 },
      rotation: { y: THREE.MathUtils.degToRad(79), x: 0.01 },
      texture: '/assets/textures/room_assets/clotheshorse.png',
      scale: 2,
      lookAtAvatar: false,
    }),
  },
  window: {
    disable: false,
    physics: true,
    obj: furnitureObject({
      name: 'window',
      position: { x: -6, y: 1.8, z: -2.3 },
      rotation: { y: THREE.MathUtils.degToRad(73), x: 0.01 },
      texture: '/assets/textures/room_assets/window.png',
      scale: 3,
    }),
  },
  painting: {
    disable: false,
    physics: true,
    obj: furnitureObject({
      name: 'painting',
      position: { x: 4, y: 1.3, z: 0.64 },
      texture: '/assets/textures/room_assets/painting.png',
      scale: 1.7,
      rotation: { y: THREE.MathUtils.degToRad(63), x: THREE.MathUtils.degToRad(11) },
    }),
  },
  mactop: {
    disable: false,
    physics: true,
    gravity: true,
    obj: furnitureObject({
      name: 'mactop',
      position: { x: 0.75, y: dropHeight, z: 0.7 },
      rotation: { x: THREE.MathUtils.degToRad(26), y: THREE.MathUtils.degToRad(62) },
      texture: '/assets/textures/room_assets/mactop.png',
      scale: 1,
      lookAtAvatar: false,
    }),
  },
  plant2: {
    disable: false,
    physics: true,
    gravity: true,
    obj: furnitureObject({
      name: 'plant2',
      position: { x: 0.6, y: dropHeight, z: -2.9 },
      rotation: { y: THREE.MathUtils.degToRad(-188) },
      texture: '/assets/textures/room_assets/plant2.png',
      scale: 2,
      lookAtAvatar: false,
    }),
  },
  rug: {
    disable: false,
    physics: false,
    obj: furnitureObject({
      name: 'rug',
      position: { x: -3, y: 0.01, z: 0.7 },
      rotation: {
        y: THREE.MathUtils.degToRad(180),
        x: THREE.MathUtils.degToRad(90),
        z: THREE.MathUtils.degToRad(26),
      },
      texture: '/assets/textures/room_assets/rug.png',
      scale: 3,
      lookAtAvatar: false,
    }),
  },
  tv: {
    disable: false,
    physics: true,
    gravity: true,
    obj: furnitureObject({
      name: 'tv',
      position: { x: -4.2, y: dropHeight - 1, z: 5.1 },
      rotation: { y: THREE.MathUtils.degToRad(-20) },
      texture: '/assets/textures/room_assets/tv.png',
      scale: 2,
      lookAtAvatar: false,
    }),
  },
  uff: {
    disable: false,
    physics: true,
    gravity: false,
    obj: furnitureObject({
      name: 'uff',
      position: { x: -1.8, y: 1, z: -4.1 },
      rotation: { y: THREE.MathUtils.degToRad(23) },
      texture: '/assets/textures/room_assets/uff.png',
      scale: 2.6,
      lookAtAvatar: false,
    }),
  },
};

export { avatars, skyboxes, storyboard, roomObjects };
