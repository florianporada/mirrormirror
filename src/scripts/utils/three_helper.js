import * as THREE from 'three';

const width = window.innerWidth;
const height = window.innerHeight;

let threeContext = {};

export function setThreeContext(ctx) {
  threeContext = ctx;
}

export function getThreeContext() {
  return threeContext;
}

/**
 * Returns the center point of a mesh
 *
 * @export
 * @param {THREE.Mesh} mesh
 * @returns {THREE.Vector3}
 */
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

/**
 * Transforms 2d canvas coordinates (from posenet keypoint tracking) to threejs world coordinates
 *
 * @export
 * @param {number} x
 * @param {number} y
 * @param {THREE.Camera} camera
 * @returns {THREE.Vector3}
 */
export const canvasDomToWorld = (x, y, camera) => {
  const newPosition = new THREE.Vector3();
  const normalizedX = (x / width) * 2 - 1;
  const normalizedY = ((y - height) / height) * 2 + 1;

  if (camera) {
    newPosition.set(normalizedX, -normalizedY, 0);
    newPosition.unproject(camera);

    const dir = newPosition.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));

    return pos;
  }

  return new THREE.Vector3(0, 0, 0);
};

export function toggleAxesHelper() {
  const { scene } = threeContext;
  if (scene.getObjectByName('axishelper')) {
    scene.remove(scene.getObjectByName('axishelper'));
  } else {
    // axis helper
    const axishelper = new THREE.AxesHelper(20);
    axishelper.name = 'axishelper';
    scene.add(axishelper);
  }
}
