import * as THREE from 'three';

const width = window.innerWidth;
const height = window.innerHeight;

let threeContext = {};

export function setThreeContext(ctx) {
  console.log(ctx);
  threeContext = ctx;
}

export function getCenterPoint(mesh) {
  const middle = new THREE.Vector3();
  const { geometry } = mesh;

  geometry.computeBoundingBox();

  middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
  middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
  middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

  mesh.localToWorld(middle);
  return middle;
}

export function addButton(name, func) {
  const btn = document.createElement('button');
  btn.innerHTML = name;
  btn.classList.add('control');
  btn.onclick = function click() {
    func();
  };

  document.getElementById('Controlinfo').appendChild(btn);
}

export const domToWorld = (x, y) => {
  const newPosition = new THREE.Vector3();
  const normalizedX = (x / width) * 2 - 1;
  const normalizedY = ((y - height) / height) * 2 + 1;

  if (threeContext.camera) {
    newPosition.set(normalizedX, -normalizedY, 0);
    newPosition.unproject(threeContext.camera);

    const dir = newPosition.sub(threeContext.camera.position).normalize();
    const distance = -threeContext.camera.position.z / dir.z;
    const pos = threeContext.camera.position.clone().add(dir.multiplyScalar(distance));

    return pos;
  }

  return new THREE.Vector3(0, 0, 0);
};

export const rightWrist = new THREE.Vector3();

export const rightWristController = (x, y) => {
  const pos = domToWorld(x, y);

  rightWrist.set(pos.x, pos.y, 0);
};

export const leftWrist = new THREE.Vector3();

export const leftWristController = (x, y) => {
  const pos = domToWorld(x, y);

  leftWrist.set(pos.x, pos.y, 0);
};
