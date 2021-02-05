import * as THREE from 'three';

import { Reflector } from 'three/examples/jsm/objects/Reflector';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare';

const textureLoader = new THREE.TextureLoader();

function mirrorObject({ name, rotation, position, size }) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  const rot = { ...{ x: 0, y: 0, z: 0 }, ...rotation };
  const mirrorSize = { ...{ x: 2.4, y: 4.4 }, ...size };

  // parent for mirror + pivot etc...
  const parent = new THREE.Object3D();
  // pivots
  const pivotPoint = new THREE.Object3D();

  const reflector = new Reflector(new THREE.PlaneBufferGeometry(mirrorSize.x, mirrorSize.y), {
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
  });

  reflector.name = name;
  parent.name = `${name}-parent`;

  reflector.position.set(pos.x, pos.y, pos.z);
  reflector.rotation.set(rot.x, rot.y, rot.z);

  const frameGeometry = new THREE.BoxBufferGeometry(mirrorSize.x + 0.2, mirrorSize.y + 0.2, 0.1);
  const frameMaterial = new THREE.MeshPhongMaterial({
    color: 0x2194ce,
    emissive: 0x3d0a0a,
    specular: 0x2b2b2b,
    shininess: 100,
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);

  frame.position.z = -0.07;
  frame.castShadow = true;
  frame.receiveShadow = true;

  // defines point around which the object rotates
  pivotPoint.rotation.z = 0;
  pivotPoint.rotation.x = 0;
  pivotPoint.rotation.y = 0;

  reflector.add(frame);
  pivotPoint.add(reflector);
  parent.add(pivotPoint);

  return parent;
}

function platformObject({ name, position } = {}) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  const boxGeometry = new THREE.BoxBufferGeometry(1.5, 0.1, 1.5);
  const boxMaterial = new THREE.MeshPhongMaterial();
  const box = new THREE.Mesh(boxGeometry, boxMaterial);

  box.name = name;
  box.castShadow = true;
  box.receiveShadow = true;
  box.position.set(pos.x, pos.y, pos.z);

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
  light.shadow.camera.zoom = 4;
  light.target.position.set(0, 0, -2);

  if (debug) {
    helper = new THREE.CameraHelper(light.shadow.camera);
  }

  return [light, light.target, helper];
}

export {
  mirrorObject,
  platformObject,
  lookAtObject,
  movingLightObject,
  lensflareObject,
  lightObject,
};
