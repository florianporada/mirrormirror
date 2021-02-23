import * as THREE from 'three';

/**
 * Returns the controller with the matching property name
 *
 * @export
 * @param {string} name
 * @param {dat.GUI} gui
 * @returns {dat.GUIController | undefined}
 */
export function getControllerByPropName(name, gui) {
  if (!name || !gui) return undefined;

  // eslint-disable-next-line no-underscore-dangle
  const [result] = gui.__folders.AppControl.__controllers.filter(
    (controller) => controller.property === name
  );

  return result;
}

export function dummy() {
  return 1;
}

/**
 * Toggles between the loading UI and the main canvas UI.
 */
export function setLoadingState(showLoadingUI, message = '') {
  const loading = document.getElementById('loading');
  const loadingMessage = loading.getElementsByClassName('loading-message');
  const main = document.getElementById('main');

  if (showLoadingUI) {
    loadingMessage[0].textContent = message;
    loading.style.display = 'flex';
    main.style.display = 'none';
  } else {
    loadingMessage[0].textContent = '';
    loading.style.display = 'none';
    main.style.display = 'block';
  }
}

/**
 * Gets rotation coords from headset (camera)
 *
 * @export
 * @param {THREE.Camera} camera
 * @returns {THREE.Euler}
 */
export function getVrHeadCoords(camera) {
  if (!camera) return new THREE.Euler(0, 0, 0);
  // const position = new THREE.Vector3();
  // position.setFromMatrixPosition(camera.matrixWorld);

  return camera.rotation;
}

export function createID() {
  return (
    Array(16)
      .fill(0)
      .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
      .join('') + Date.now().toString(24)
  );
}

export function addPosenetButton(cb) {
  const elementExists = document.getElementById('posenetbutton');

  if (!elementExists) {
    const usercontrols = document.getElementById('usercontrols');
    const posenet = document.createElement('a');
    const posenetImage1 = document.createElement('img');
    const posenetImage2 = document.createElement('img');
    const posenetImage3 = document.createElement('img');

    posenet.href = '#';
    posenet.id = 'posenetbutton';
    posenet.alt = 'next button';

    posenetImage1.src = '/assets/textures/words/connect.png';
    posenetImage2.src = '/assets/textures/words/to.png';
    posenetImage3.src = '/assets/textures/words/body.png';

    posenet.onclick = (e) => {
      e.preventDefault();

      cb();
    };

    posenet.appendChild(posenetImage1);
    posenet.appendChild(posenetImage2);
    posenet.appendChild(posenetImage3);
    usercontrols.appendChild(posenet);
  }
}
