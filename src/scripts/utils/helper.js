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

/**
 * Creates random id
 *
 * @export
 * @returns {String} id
 */
export function createID() {
  return (
    Array(16)
      .fill(0)
      .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
      .join('') + Date.now().toString(24)
  );
}

/**
 * Creates image elements based on input text
 *
 * @export
 * @param {String} text
 * @param {String} id
 * @param {Function} onClickFunc
 * @returns
 */
export function imageTextElement(text, id, onClickFunc) {
  const words = text.split(' ');
  const wrapper = document.createElement('a');

  wrapper.href = '#';
  wrapper.id = id;
  wrapper.onclick = (e) => {
    e.preventDefault();

    if (onClickFunc) onClickFunc();
  };

  words.forEach((word) => {
    const wordImage = document.createElement('img');

    wordImage.src = `/assets/textures/words/${word.trim()}.png`;
    wordImage.alt = word;

    wrapper.appendChild(wordImage);
  });

  return wrapper;
}

/**
 * Adds child to user control element
 *
 * @export
 * @param {Element} element
 */
export function addControlButton(element) {
  const elementExists = document.getElementById(element.id);

  if (!elementExists) {
    const usercontrols = document.getElementById('usercontrols');

    usercontrols.appendChild(element);
  }
}

/**
 * Toggles between the loading UI and the main canvas UI.
 */
export function setLoadingState(showLoadingUI, message = 'loading') {
  const loading = document.getElementById('loading');
  const loadingMessage = loading.getElementsByClassName('loading-message');
  const main = document.getElementById('main');
  const text = imageTextElement(message, createID());

  if (showLoadingUI) {
    loadingMessage[0].appendChild(text);
    loading.style.display = 'flex';
    main.style.display = 'none';
  } else {
    loadingMessage[0].innerHTML = '';
    loading.style.display = 'none';
    main.style.display = 'block';
  }
}
