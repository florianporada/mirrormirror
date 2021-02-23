import * as THREE from 'three';

import { Reflector } from 'three/examples/jsm/objects/Reflector';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare';
import { createID } from './helper';

const textureLoader = new THREE.TextureLoader();

function torusObject({ name, position } = {}) {
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

function mirrorObject({ name, rotation, position, size, orbit } = {}) {
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

function floorObject({ name, position, size } = {}) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  const boxGeometry = new THREE.BoxBufferGeometry(size, 0.1, size);
  const boxMaterial = new THREE.MeshPhongMaterial();
  const box = new THREE.Mesh(boxGeometry, boxMaterial);

  box.name = name;
  box.receiveShadow = true;
  // box.castShadow = true;
  box.position.set(pos.x, pos.y, pos.z);
  // box.rotation.set(0, Math.PI / 3, 0);

  return box;
}

function lookAtObject({ name, position } = {}) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  const geometry = new THREE.SphereGeometry(0.02, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const sphere = new THREE.Mesh(geometry, material);

  sphere.name = name;
  sphere.position.set(pos.x, pos.y, pos.z);

  return sphere;
}

function furnitureObject({ name, position, rotation, texture, scale, lookAtAvatar } = {}) {
  return new Promise((resolve) => {
    const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
    const rot = { ...{ x: 0, y: 0, z: 0 }, ...rotation };
    const scl = scale || 1;
    textureLoader.load(texture, (tex) => {
      // eslint-disable-next-line no-param-reassign
      tex.needsUpdate = true;

      const geometry = new THREE.PlaneGeometry(
        1.0 * scl,
        (tex.image.height / tex.image.width) * scl,
        1
      );
      const material = new THREE.MeshLambertMaterial({
        transparent: false,
        map: tex,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
      });
      const plane = new THREE.Mesh(geometry, material);
      plane.name = name;
      plane.receiveShadow = true;
      plane.castShadow = true;
      plane.customDepthMaterial = new THREE.MeshDepthMaterial({
        depthPacking: THREE.RGBADepthPacking,
        map: tex,
        alphaTest: 0.5,
      });
      plane.position.set(pos.x, pos.y, pos.z);
      plane.rotation.set(rot.x, rot.y, rot.z);

      if (lookAtAvatar) plane.lookAt(0, 0, 0);

      resolve(plane);
    });
    // map.anisotropy = 16;
  });
}

function movingLightObject({ name, position, color, debug = false } = {}) {
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
  light.shadow.bias = -0.001;

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

function lensflareObject({ position, name } = {}) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };

  const lensflare = new Lensflare();
  const texture0 = textureLoader.load('assets/textures/lensflare/lensflare0.png');
  const texture3 = textureLoader.load('assets/textures/lensflare/lensflare3.png');

  lensflare.position.set(pos.x, pos.y, pos.z);
  lensflare.name = name;
  lensflare.addElement(new LensflareElement(texture0, 700, 0));
  lensflare.addElement(new LensflareElement(texture3, 60, 0.6));
  lensflare.addElement(new LensflareElement(texture3, 70, 0.7));
  lensflare.addElement(new LensflareElement(texture3, 120, 0.9));
  lensflare.addElement(new LensflareElement(texture3, 70, 1));

  return lensflare;
}

function lightObject({ name, position, color, type, intensity } = {}) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  let light = new THREE.DirectionalLight(color, intensity);

  if (type === 'PointLight') {
    light = new THREE.PointLight(color, intensity, 20);
  }

  light.name = name;
  light.position.set(pos.x, pos.y, pos.z);
  light.castShadow = true;
  light.shadow.bias = -0.001;
  // light.shadow.camera.zoom = 2;

  if (type === 'PointLight') {
    return [light, new THREE.CameraHelper(light.shadow.camera)];
  }

  light.target.position.set(0, 0, 0);

  return [light, light.target, new THREE.CameraHelper(light.shadow.camera)];
}

function sphereObject({ position, name, isVideo, texture, size } = {}) {
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  let map;

  if (isVideo) {
    const video = document.createElement('video');

    video.src = texture;
    video.load();
    video.play();

    map = new THREE.VideoTexture(video);
  } else {
    map = textureLoader.load(texture);
  }

  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    map,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const sphere = new THREE.Mesh(geometry, material);

  sphere.position.set(pos.x, pos.y, pos.z);
  sphere.name = name;

  return sphere;
}

async function textObject({ position, text, rotation, name, scale, addLight }) {
  const textArray = text.split(' ');
  const pos = { ...{ x: 0, y: 0, z: 0 }, ...position };
  const rot = { ...{ x: 0, y: 0, z: 0 }, ...rotation };
  const scl = scale || 1;
  const parent = new THREE.Object3D();

  parent.name = name || createID();
  parent.position.set(pos.x, pos.y, pos.z);
  parent.rotation.set(rot.x, rot.y + THREE.MathUtils.degToRad(180), rot.z);

  if (addLight) {
    const light = new THREE.PointLight(0xfbf1e6, 1);

    light.position.set(0, 2, -2);
    parent.add(light);
  }

  let offsetX = 0;
  let offsetY = 0;

  function loadObject(texture, word, index) {
    return new Promise((resolve) => {
      textureLoader.load(texture, (tex) => {
        // eslint-disable-next-line no-param-reassign
        tex.needsUpdate = true;

        const width = (tex.image.width / tex.image.height) * scl;
        const height = 1.0 * scl;
        const planeGeometry = new THREE.PlaneGeometry(width, height, 1);
        const planeMaterial = new THREE.MeshLambertMaterial({
          transparent: false,
          map: tex,
          side: THREE.DoubleSide,
          alphaTest: 0.5,
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);

        plane.position.setZ(-0.055);
        plane.rotateY(THREE.MathUtils.degToRad(180));

        const frameGeometry = new THREE.BoxBufferGeometry(width, height, 0.1);
        const frameMaterial = new THREE.MeshBasicMaterial({ color: 0xf1f1f1 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);

        frame.name = word;
        frame.receiveShadow = true;
        frame.castShadow = true;
        frame.position.set(-offsetX, -offsetY, 0);
        frame.add(plane);

        offsetX += width + 0.05;

        if (index % 3 === 3 - 1) {
          offsetY += height + 0.05;
          offsetX = 0;
        }

        resolve(frame);
      });
    });
  }

  for (let index = 0; index < textArray.length; index += 1) {
    const word = textArray[index];
    const textureUrl = `/assets/textures/words/${word.trim()}.png`;

    // eslint-disable-next-line no-await-in-loop
    const txt = await loadObject(textureUrl, word, index);

    parent.add(txt);
  }

  return parent;
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
  sphereObject,
  textObject,
};
