/**
 * Returns the controller with the matching property name
 *
 * @export
 * @param {string} name
 * @param {dat.GUI} gui
 * @returns {dat.GUIController | undefined}
 */
export function getControllerByPropName(name, gui) {
  // eslint-disable-next-line no-underscore-dangle
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
