/* eslint-disable dot-notation */

/** Maps from one linear interpolation into another one */
function map(original, inMin, inMax, outMin, outMax) {
  return ((original - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Returns angle in radians given three points p1, p2, p3
 * @param {integer} p1
 * @param {integer} p2
 * @param {integer} p3
 * @returns {float}
 */
function findAngle(p1, p2, p3) {
  const p12 = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  const p13 = Math.sqrt((p1.x - p3.x) ** 2 + (p1.y - p3.y) ** 2);
  const p23 = Math.sqrt((p2.x - p3.x) ** 2 + (p2.y - p3.y) ** 2);
  const resultRadian = Math.acos((p12 ** 2 + p13 ** 2 - p23 ** 2) / (2 * p12 * p13));

  return resultRadian;
}

/**
 * Transform class for mapping
 * joints data from video stream space
 * into Babylon 3D space
 */
export default class Transform {
  /**
   * the class constructor
   * @param {Joints} _joints
   */
  constructor(_joints) {
    this.joints = _joints;
  }

  /**
   * Updates joints data
   * @param {array} _keypoints raw joints data from posenet
   * @param {float} treshHoldScore for determining whether to update or no
   */
  updateKeypoints(_keypoints, treshHoldScore) {
    this.keypoints = {};
    _keypoints.forEach(({ score, part, position }) => {
      if (score > treshHoldScore) this.keypoints[part] = position;
    });
    this.distance = null;
    this.headCenter = null;
    this.shoulderCenter = null;
    this.calibrate();
  }

  /**
   * Makes the system invariant to scale and translations,
   * given joints data
   */
  calibrate() {
    if (this.keypoints['leftEye'] && this.keypoints['rightEye']) {
      const leftX = this.keypoints['leftEye'].x;
      const leftY = this.keypoints['leftEye'].y;
      const rightX = this.keypoints['rightEye'].x;
      const rightY = this.keypoints['rightEye'].y;

      this.distance = Math.sqrt((leftX - rightX) ** 2 + (leftY - rightY) ** 2);
      this.headCenter = {
        x: (leftX + rightX) / 2.0,
        y: (leftY + rightY) / 2.0,
      };
    }
    if (this.keypoints['leftShoulder'] && this.keypoints['rightShoulder']) {
      const leftX = this.keypoints['leftShoulder'].x;
      const leftY = this.keypoints['leftShoulder'].y;
      const rightX = this.keypoints['rightShoulder'].x;
      const rightY = this.keypoints['rightShoulder'].y;

      this.shoulderCenter = {
        x: (leftX + rightX) / 2.0,
        y: (leftY + rightY) / 2.0,
      };
    }
  }

  /** Updates head joint data */
  head() {
    if (this.keypoints['nose'] && this.headCenter && this.shoulderCenter) {
      let { x, y } = this.keypoints['nose'];
      // get nose relative points from origin
      x = (this.headCenter.x - x) / (this.distance / 15);
      y = this.shoulderCenter.y - y;
      // normalize (i.e. scale it)
      y = map(y, this.distance * 1.5, this.distance * 2.8, -2, 2);
      // console.log(140/this.distance,260/this.distance);
      this.joints.update('head', { x, y });
      return { x, y };
    }

    return { x: 0, y: 0 };
  }

  /**
   * Updates joints data and returns angle between three joints
   * @param {integer} jointA index of a joint
   * @param {intger} jointB index of a joint
   * @param {intger} jointC index of a joint
   * @returns {float} angle
   */
  rotateJoint(jointA, jointB, jointC) {
    if (this.keypoints[jointA] && this.keypoints[jointB] && this.keypoints[jointC]) {
      const angle = findAngle(
        this.keypoints[jointA],
        this.keypoints[jointB],
        this.keypoints[jointC]
      );
      const sign = this.keypoints[jointC].y > this.keypoints[jointB].y ? 1 : -1;
      this.joints.update(jointB, sign * angle);

      return angle;
    }

    return 0;
  }
}
