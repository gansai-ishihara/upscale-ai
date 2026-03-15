import { NativeModules, NativeEventEmitter } from 'react-native';

const { UpscalerModule } = NativeModules;

export interface UpscaleOptions {
  outputHeight: 720 | 1080 | 2160;
  denoise: boolean;
  sharpen: boolean;
  colorEnhance: boolean;
}

export interface ProgressEvent {
  currentFrame: number;
  totalFrames: number;
  estimatedTimeRemaining: number;
}

export interface FrameCompleteEvent {
  frameIndex: number;
  processingTime: number;
}

export interface ErrorEvent {
  code: string;
  message: string;
}

export interface DeviceCapability {
  chipset: string;
  hasANE: boolean;
  recommendedTileSize: number;
  recommendedBatchSize: number;
  totalMemoryMB: number;
}

// Event emitter for progress updates
const emitter = UpscalerModule ? new NativeEventEmitter(UpscalerModule) : null;

export async function upscaleVideo(
  videoUri: string,
  options: UpscaleOptions
): Promise<string> {
  if (!UpscalerModule) {
    throw new Error('UpscalerModule is not available. Use EAS Build for native modules.');
  }
  return UpscalerModule.upscaleVideo(videoUri, options.outputHeight, {
    denoise: options.denoise,
    sharpen: options.sharpen,
    colorEnhance: options.colorEnhance,
  });
}

export async function cancelProcessing(): Promise<void> {
  if (!UpscalerModule) return;
  return UpscalerModule.cancelProcessing();
}

export async function getDeviceCapability(): Promise<DeviceCapability> {
  if (!UpscalerModule) {
    return {
      chipset: 'unknown',
      hasANE: false,
      recommendedTileSize: 256,
      recommendedBatchSize: 4,
      totalMemoryMB: 0,
    };
  }
  return UpscalerModule.getDeviceCapability();
}

export function onProgress(callback: (event: ProgressEvent) => void) {
  return emitter?.addListener('onProgress', callback);
}

export function onFrameComplete(callback: (event: FrameCompleteEvent) => void) {
  return emitter?.addListener('onFrameComplete', callback);
}

export function onError(callback: (event: ErrorEvent) => void) {
  return emitter?.addListener('onError', callback);
}
