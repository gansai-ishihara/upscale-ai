import { useCallback, useEffect } from 'react';
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
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

      // Add to history in dev mode too
      addHistoryItem({
        id: Date.now().toString(),
        inputUri: videoUri,
        outputUri: videoUri,
        thumbnailUri: videoUri,
        outputHeight: options.outputHeight,
        inputResolution: 'dev',
        outputResolution: `${options.outputHeight}p`,
        processingTime: 2,
        fileSize: 0,
        createdAt: new Date().toISOString(),
      });

      return videoUri;
    }

    setProcessing({ isProcessing: true, currentFrame: 0, totalFrames: 0 });

    const startTime = Date.now();
    const outputPath: string = await UpscalerNative.upscaleVideo(videoUri, options.outputHeight, {
      denoise: options.denoise,
      sharpen: options.sharpen,
      colorEnhance: options.colorEnhance,
    });

    const processingTime = (Date.now() - startTime) / 1000;

    setOutputVideoUri(outputPath);
    resetProcessing();

    // Get actual file size
    const fileInfo = await FileSystem.getInfoAsync(outputPath, { size: true });
    const fileSize = fileInfo.exists && 'size' in fileInfo ? (fileInfo.size ?? 0) : 0;

    // Add to history
    addHistoryItem({
      id: Date.now().toString(),
      inputUri: videoUri,
      outputUri: outputPath,
      thumbnailUri: outputPath,
      outputHeight: options.outputHeight,
      inputResolution: '720p',
      outputResolution: `${options.outputHeight}p`,
      processingTime,
      fileSize,
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
