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
export function setLoadingState(showLoadingUI, loadingDivId = 'loading', mainDivId = 'main') {
  if (showLoadingUI) {
    document.getElementById(loadingDivId).style.display = 'block';
    document.getElementById(mainDivId).style.display = 'none';
  } else {
    document.getElementById(loadingDivId).style.display = 'none';
    document.getElementById(mainDivId).style.display = 'block';
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
