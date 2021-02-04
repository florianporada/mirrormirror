import '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as posenet from '@tensorflow-models/posenet';

export const VIDEO_HEIGHT = 480;
export const VIDEO_WIDTH = 640;

let net;

async function estimatePoseOnImage(imageElement) {
  const pose = await net.estimateSinglePose(imageElement, {
    flipHorizontal: false,
  });

  return pose;
}

async function initPosenet() {
  // load the posenet model from a checkpoint
  try {
    net = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
      multiplier: 0.75,
    });
  } catch (error) {
    throw new Error(error);
  }
}

export { initPosenet, estimatePoseOnImage };
