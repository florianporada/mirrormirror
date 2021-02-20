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

const scenes = [
  {
    cameraPosition: new THREE.Vector3(2, 2, 2),
    title: 'First',
    text: 'Commodo vivamus penatibus sociis senectus vel auctor',
  },
  {
    cameraPosition: new THREE.Vector3(2, 3, 3),
    title: 'First',
    text: 'Commodo vivamus penatibus sociis senectus vel auctor',
  },
  {
    cameraPosition: new THREE.Vector3(2, 3, 3),
    title: 'First',
    text: 'Commodo vivamus penatibus sociis senectus vel auctor',
  },
  {
    cameraPosition: new THREE.Vector3(1, 3, 3),
    title: 'First',
    text: 'Commodo vivamus penatibus sociis senectus vel auctor',
  },
  {
    cameraPosition: new THREE.Vector3(5, 4, 3),
    title: 'First',
    text: 'Commodo vivamus penatibus sociis senectus vel auctor',
  },
];

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
      position: { x: 0.25, y: 2, z: 2 },
      rotation: { y: THREE.MathUtils.degToRad(180), x: 0.02 },
      size: { x: 3, y: 2 },
    }),
  },
  plant: {
    disable: false,
    physics: true,
    obj: furnitureObject({
      name: 'plant',
      position: { x: 4, y: 2, z: 2.7 },
      texture: '/assets/textures/room_assets/plant1.png',
      scale: 2,
      rotation: { y: THREE.MathUtils.degToRad(30) },
    }),
  },
  lowboy: {
    disable: false,
    physics: true,
    obj: furnitureObject({
      name: 'lowboy',
      position: { x: -3, y: 2, z: 1.7 },
      rotation: { y: THREE.MathUtils.degToRad(-30), x: 0.01 },
      texture: '/assets/textures/room_assets/lowboy.png',
      scale: 2,
      lookAtAvatar: false,
    }),
  },
};

export { avatars, skyboxes, scenes, roomObjects };
