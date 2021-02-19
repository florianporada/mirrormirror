import * as THREE from 'three';

import { Reflector } from 'three/examples/jsm/objects/Reflector';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare';

const textureLoader = new THREE.TextureLoader();

function torusObject({ name, position }) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };

  const torusGeometry = new THREE.TorusKnotBufferGeometry(0.4, 0.15, 150, 20);
  const torusMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.01,
    metalness: 0.2,
  });
  const torus = new THREE.Mesh(torusGeometry, torusMaterial);

  torus.name = name;
  torus.position.set(pos.x, pos.y, pos.z);
  torus.castShadow = true;
  torus.receiveShadow = true;

  return torus;
}

function mirrorObject({ name, rotation, position, size, orbit }) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  const rot = { ...{ x: 0, y: 0, z: 0 }, ...rotation };
  const mirrorSize = { ...{ x: 2.4, y: 4.4 }, ...size };

  const reflector = new Reflector(new THREE.PlaneBufferGeometry(mirrorSize.x, mirrorSize.y), {
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
  });
  reflector.position.z = +0.07;

  const frameGeometry = new THREE.BoxBufferGeometry(mirrorSize.x + 0.2, mirrorSize.y + 0.2, 0.1);
  const frameMaterial = new THREE.MeshPhongMaterial({
    color: 0x2194ce,
    emissive: 0x3d0a0a,
    specular: 0x2b2b2b,
    shininess: 100,
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);

  frame.name = name;
  frame.castShadow = true;
  frame.receiveShadow = true;
  frame.position.set(pos.x, pos.y, pos.z);
  frame.rotation.set(rot.x, rot.y, rot.z);

  frame.add(reflector);

  if (orbit) {
    // parent for mirror + pivot etc...
    const parent = new THREE.Object3D();
    // pivots
    const pivotPoint = new THREE.Object3D();

    parent.name = name;

    // defines point around which the object rotates
    pivotPoint.rotation.z = 0;
    pivotPoint.rotation.x = 0;
    pivotPoint.rotation.y = 0;

    pivotPoint.add(frame);
    parent.add(pivotPoint);

    return parent;
  }

  // set origin to floor level
  // frameGeometry.computeBoundingBox();
  // frameGeometry.translate(0, frameGeometry.boundingBox.max.y, 0);

  return frame;
}

function floorObject({ name, position } = {}) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  const boxGeometry = new THREE.BoxBufferGeometry(15, 0.1, 30);
  const boxMaterial = new THREE.MeshPhongMaterial();
  const box = new THREE.Mesh(boxGeometry, boxMaterial);

  box.name = name;
  box.receiveShadow = true;
  box.castShadow = true;
  box.position.set(pos.x, pos.y, pos.z);
  // box.rotation.set(0, Math.PI / 3, 0);

  return box;
}

function lookAtObject({ name, position }) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  const geometry = new THREE.SphereGeometry(0.02, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const sphere = new THREE.Mesh(geometry, material);

  sphere.name = name;
  sphere.position.set(pos.x, pos.y, pos.z);

  return sphere;
}

function furnitureObject({ name, position, rotation, texture, scale, lookAtAvatar }) {
  let box;
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  const rot = { ...{ x: 0, y: 0, z: 0 }, ...rotation };
  const scl = scale || 1;
  const map = textureLoader.load(texture, (tex) => {
    // eslint-disable-next-line no-param-reassign
    tex.needsUpdate = true;
    box.scale.set(1.0 * scl, (map.image.height / map.image.width) * scl);
  });
  map.anisotropy = 16;

  const geometry = new THREE.PlaneGeometry(1, 1, 1);

  // set origin to floor level
  geometry.computeBoundingBox();
  geometry.translate(0, geometry.boundingBox.max.y, 0);

  const material = new THREE.MeshLambertMaterial({
    transparent: false,
    map,
    side: THREE.DoubleSide,
    alphaTest: 0.5,
  });

  box = new THREE.Mesh(geometry, material);
  box.name = name;
  box.receiveShadow = true;
  box.castShadow = true;
  box.customDepthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    map,
    alphaTest: 0.5,
  });
  box.position.set(pos.x, pos.y, pos.z);
  box.rotation.set(rot.x, rot.y, rot.z);

  if (lookAtAvatar) box.lookAt(0, 0, 0);

  return box;
}

function movingLightObject({ name, position, color, debug = false }) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };

  const light = new THREE.PointLight(color, 10, 10);
  // parent for mirror + pivot etc...
  const parent = new THREE.Object3D();
  // pivots
  const pivotPoint = new THREE.Object3D();

  // "lightbulb"
  const geometry = new THREE.SphereGeometry(0.05, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color });
  const sphere = new THREE.Mesh(geometry, material);
  let helper;

  light.name = name;
  parent.name = `${name}-parent`;
  light.position.set(pos.x, pos.y, pos.z);
  light.castShadow = true;

  // defines point around which the object rotates
  pivotPoint.rotation.z = 0;
  pivotPoint.rotation.x = 0;
  pivotPoint.rotation.y = 0;

  light.add(sphere);
  pivotPoint.add(light);
  parent.add(pivotPoint);

  if (debug) {
    helper = new THREE.CameraHelper(light.shadow.camera);
  }

  return [parent, helper];
}

function lensflareObject() {
  const lensflare = new Lensflare();
  const texture0 = textureLoader.load('assets/textures/lensflare/lensflare0.png');
  const texture3 = textureLoader.load('assets/textures/lensflare/lensflare3.png');

  lensflare.position.set(0, 5, -5);
  lensflare.addElement(new LensflareElement(texture0, 700, 0));
  lensflare.addElement(new LensflareElement(texture3, 60, 0.6));
  lensflare.addElement(new LensflareElement(texture3, 70, 0.7));
  lensflare.addElement(new LensflareElement(texture3, 120, 0.9));
  lensflare.addElement(new LensflareElement(texture3, 70, 1));

  return lensflare;
}

function lightObject({ name, position, color, debug = false }) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  const light = new THREE.DirectionalLight(color);
  let helper;

  light.name = name;
  light.position.set(pos.x, pos.y, pos.z);
  light.castShadow = true;
  // light.shadow.camera.zoom = 2;
  // light.target.position.set(1, 10, -10);

  if (debug) {
    helper = new THREE.CameraHelper(light.shadow.camera);
  }

  return [light, light.target, helper];
}

export {
  mirrorObject,
  floorObject,
  lookAtObject,
  movingLightObject,
  lensflareObject,
  lightObject,
  torusObject,
  furnitureObject,
};
