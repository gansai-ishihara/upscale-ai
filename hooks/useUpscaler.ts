import { useCallback, useEffect } from 'react';
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { useAppStore, UpscaleOptions } from '@/stores/appStore';

// Native Module bridge - will be available after EAS Build
const UpscalerNative = NativeModules.UpscalerModule;
const emitter = UpscalerNative ? new NativeEventEmitter(UpscalerNative) : null;

export function useUpscaler() {
  const { setProcessing, resetProcessing, setOutputVideoUri, addHistoryItem } = useAppStore();

  useEffect(() => {
    if (!emitter) return;

    const progressSub = emitter.addListener('onProgress', (event) => {
      setProcessing({
        currentFrame: event.currentFrame,
        totalFrames: event.totalFrames,
        estimatedTimeRemaining: event.estimatedTimeRemaining,
      });
    });

    const errorSub = emitter.addListener('onError', (event) => {
      console.error('Upscaler error:', event.code, event.message);
      resetProcessing();
    });

    return () => {
      progressSub.remove();
      errorSub.remove();
    };
  }, []);

  const startUpscale = useCallback(async (videoUri: string, options: UpscaleOptions) => {
    if (!UpscalerNative) {
      // Fallback for development (Expo Go / web)
      console.warn('UpscalerModule not available - running in dev mode');
      setProcessing({ isProcessing: true, currentFrame: 0, totalFrames: 100 });

      // Simulate processing
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 200));
        setProcessing({ currentFrame: i, estimatedTimeRemaining: (100 - i) * 0.2 });
      }

      setProcessing({ isProcessing: false });
      setOutputVideoUri(videoUri); // In dev, just use input
      return videoUri;
    }

    setProcessing({ isProcessing: true, currentFrame: 0, totalFrames: 0 });

    const startTime = Date.now();
    const outputPath: string = await UpscalerNative.upscaleVideo(videoUri, options.scale, {
      denoise: options.denoise,
      sharpen: options.sharpen,
      colorEnhance: options.colorEnhance,
    });

    const processingTime = (Date.now() - startTime) / 1000;

    setOutputVideoUri(outputPath);
    resetProcessing();

    // Add to history
    addHistoryItem({
      id: Date.now().toString(),
      inputUri: videoUri,
      outputUri: outputPath,
      thumbnailUri: outputPath, // TODO: generate thumbnail
      scale: options.scale,
      inputResolution: '720p',
      outputResolution: options.scale === 2 ? '1080p' : '2160p',
      processingTime,
      fileSize: 0, // TODO: get actual file size
      createdAt: new Date().toISOString(),
    });

    return outputPath;
  }, []);

  const cancelUpscale = useCallback(async () => {
    if (UpscalerNative) {
      await UpscalerNative.cancelProcessing();
    }
    resetProcessing();
  }, []);

  return { startUpscale, cancelUpscale };
}
