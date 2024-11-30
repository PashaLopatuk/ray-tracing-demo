import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum LoadingSpinner {
  show,
  hide,
  fail,
}
export enum ShadingMethod {
  flat,
  phong,
}

interface AppState {
  loadingSpinner: LoadingSpinner;
  shadingMethod: ShadingMethod;
  renderingPass: number;
  numSamples: number;
  numBounces: number;
  cameraFov: number;
  elapsedTime: string;
  etaTime: string;
  avgTime: string;

  canvasWidth: number,
  canvasHeight: number,

  canvasScale: number
}


export const initialAppState: AppState = {
  loadingSpinner: LoadingSpinner.hide,
  shadingMethod: ShadingMethod.flat,
  renderingPass: 0,
  numSamples: 10,
  numBounces: 6,
  cameraFov: 45,
  elapsedTime: '',
  etaTime: '',
  avgTime: '',

  canvasWidth: 100,
  canvasHeight: 100,
  canvasScale: 100
};

export const appSlice = createSlice({
  name: 'appSlice',
  initialState: initialAppState,
  reducers: {
    setLoadingSpinner(state, action: PayloadAction<LoadingSpinner>) {
      state.loadingSpinner = action.payload;
    },

    setShadingMethod(state, action: PayloadAction<ShadingMethod>) {
      state.shadingMethod = action.payload;
    },

    setRenderingPass(state, action: PayloadAction<number>) {
      state.renderingPass = action.payload;
    },

    setNumSamples(state, action: PayloadAction<number>) {
      state.numSamples = action.payload;
    },

    setNumBounces(state, action: PayloadAction<number>) {
      state.numBounces = action.payload;
    },

    setCameraFov(state, action: PayloadAction<number>) {
      state.cameraFov = action.payload;
    },

    setElapsedTime(state, action: PayloadAction<string>) {
      state.elapsedTime = action.payload;
    },

    setEtaTime(state, action: PayloadAction<string>) {
      state.etaTime = action.payload;
    },

    setAvgTime(state, action: PayloadAction<string>) {
      state.avgTime = action.payload;
    },

    setCanvasWidth(state, action: PayloadAction<number>) {
      state.canvasWidth = action.payload;
    },
    setCanvasHeight(state, action: PayloadAction<number>) {
      state.canvasHeight = action.payload;
    },
    setCanvasScale(state, action: PayloadAction<number>) {
      state.canvasScale = action.payload;
    }
  },
});

export const appReducer = appSlice.reducer;
export const appActions = appSlice.actions;
