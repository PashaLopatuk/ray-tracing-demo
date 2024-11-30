import { initialAppState } from '../redux/appSlice';
import CanvasShader from '../scene/CanvasShader';
import ColorTextures from '../scene/ColorTextures';
import RandomTexture from '../scene/RandomTexture';
import SampleShader from '../scene/SampleShader';
import { Scene } from '@/models/scene';

export interface ICanvasState {
  canvasWd: number;
  canvasHt: number;

  canvasScale: number

  cameraFov: number;
  numSamples: number;
  numBounces: number;
  shadingMethod: number;

  renderingPass: number;
  restartRenderTimestamp: number;

  x: number;
  y: number;
  lButtonDown: boolean;
  rButtonDown: boolean;
  lButtonDownOnCanvas: boolean;
  rButtonDownOnCanvas: boolean;
  TXYZ_SCALAR: number;
  RXYZ_SCALAR: number;

  gl: WebGL2RenderingContext | null;
  colorTextures: ColorTextures | null;
  randomTexture: RandomTexture | null;
  sampleShader: SampleShader | null;
  canvasShader: CanvasShader | null;
  scene: Scene | null;
}

export const defaultCanvasState: Readonly<ICanvasState> = {
  canvasWd: 200,
  canvasHt: 200,

  canvasScale: 100,

  cameraFov: initialAppState.cameraFov,
  numSamples: initialAppState.numSamples,
  numBounces: initialAppState.numBounces,
  shadingMethod: initialAppState.shadingMethod,

  renderingPass: 0,
  restartRenderTimestamp: Date.now(),

  x: 0,
  y: 0,
  lButtonDown: false,
  rButtonDown: false,
  lButtonDownOnCanvas: false,
  rButtonDownOnCanvas: false,
  TXYZ_SCALAR: 0.01,
  RXYZ_SCALAR: 0.25,

  gl: null,
  colorTextures: null,
  randomTexture: null,
  sampleShader: null,
  canvasShader: null,
  scene: null,
};
