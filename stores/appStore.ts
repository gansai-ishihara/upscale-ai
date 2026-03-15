import { create } from 'zustand';

export interface UpscaleOptions {
  outputHeight: 720 | 1080 | 2160;
  denoise: boolean;
  sharpen: boolean;
  colorEnhance: boolean;
}

export interface ProcessingState {
  isProcessing: boolean;
  currentFrame: number;
  totalFrames: number;
  estimatedTimeRemaining: number;
}

export interface HistoryItem {
  id: string;
  inputUri: string;
  outputUri: string;
  thumbnailUri: string;
  outputHeight: 720 | 1080 | 2160;
  inputResolution: string;
  outputResolution: string;
  processingTime: number; // seconds
  fileSize: number; // bytes
  createdAt: string; // ISO date
}

interface AppState {
  // Tracking
  trackingAllowed: boolean;
  setTrackingAllowed: (allowed: boolean) => void;

  // Subscription
  isPro: boolean;
  setIsPro: (isPro: boolean) => void;

  // Processing
  processing: ProcessingState;
  setProcessing: (state: Partial<ProcessingState>) => void;
  resetProcessing: () => void;

  // Options
  options: UpscaleOptions;
  setOptions: (options: Partial<UpscaleOptions>) => void;

  // Selected video
  selectedVideoUri: string | null;
  setSelectedVideoUri: (uri: string | null) => void;
  inputWidth: number;
  inputHeight: number;
  setInputResolution: (width: number, height: number) => void;

  // Output
  outputVideoUri: string | null;
  setOutputVideoUri: (uri: string | null) => void;

  // Daily limit
  dailyCount: number;
  dailyDate: string;
  setDailyCount: (count: number, date: string) => void;

  // History
  history: HistoryItem[];
  addHistoryItem: (item: HistoryItem) => void;
  clearHistory: () => void;
}

const initialProcessing: ProcessingState = {
  isProcessing: false,
  currentFrame: 0,
  totalFrames: 0,
  estimatedTimeRemaining: 0,
};

const initialOptions: UpscaleOptions = {
  outputHeight: 1080,
  denoise: false,
  sharpen: false,
  colorEnhance: false,
};

export const useAppStore = create<AppState>((set) => ({
  trackingAllowed: false,
  setTrackingAllowed: (allowed) => set({ trackingAllowed: allowed }),

  isPro: false,
  setIsPro: (isPro) => set({ isPro }),

  processing: initialProcessing,
  setProcessing: (state) =>
    set((prev) => ({ processing: { ...prev.processing, ...state } })),
  resetProcessing: () => set({ processing: initialProcessing }),

  options: initialOptions,
  setOptions: (options) =>
    set((prev) => ({ options: { ...prev.options, ...options } })),

  selectedVideoUri: null,
  setSelectedVideoUri: (uri) => set({ selectedVideoUri: uri }),
  inputWidth: 0,
  inputHeight: 0,
  setInputResolution: (width, height) => set({ inputWidth: width, inputHeight: height }),

  outputVideoUri: null,
  setOutputVideoUri: (uri) => set({ outputVideoUri: uri }),

  dailyCount: 0,
  dailyDate: '',
  setDailyCount: (count, date) => set({ dailyCount: count, dailyDate: date }),

  history: [],
  addHistoryItem: (item) =>
    set((prev) => ({ history: [item, ...prev.history].slice(0, 50) })),
  clearHistory: () => set({ history: [] }),
}));
