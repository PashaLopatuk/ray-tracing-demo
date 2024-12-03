import { MonkeyTeapotScene } from '@/scene/monkey-teapot-scene/Scene';
import { createGL } from '@/utils/gl';
import { SceneRenderer } from '@/lib/scene/render-scene';
import { ICanvasState } from '@/lib/types/ICanvasState';
import {
  CornellBoxMtlModelPath,
  CornellBoxObjModelPath,
  MonkeyHeadMtlModelPath,
  MonkeyHeadObjModelPath,
} from '@/lib/models';
import {
  CanvasFragmentShaderPath,
  CanvasVertexShaderPath,
  SampleFragmentShaderPath,
  SampleVertexShaderPath,
} from '@/lib/shaders';
import { CornelBoxScene } from '@/scene/cornel-box/Scene';

interface IInitSceneProps {
  canvas: HTMLCanvasElement
  canvasState: ICanvasState
  onRenderUpdate?: Function
  onLoading?: Function
  onLoadingError?: Function
  onLoaded?: Function
  onRenderReset?: Function
}

export async function initCornelBoxScene({ canvas, canvasState, onRenderReset, onLoaded, onLoading, onRenderUpdate, onLoadingError }: IInitSceneProps) {
  const gl = createGL(canvas);

  const scene = new CornelBoxScene({
    gl: gl,
    objUrl: CornellBoxObjModelPath,
    mtlUrl: CornellBoxMtlModelPath,
  });

  const sceneRenderer = new SceneRenderer({
    scene: scene,
    canvasState: canvasState,
    canvasFragmentShaderSource: CanvasFragmentShaderPath,
    canvasVertexShaderSource: CanvasVertexShaderPath,
    sampleFragmentShaderSource: SampleFragmentShaderPath,
    sampleVertexShaderSource: SampleVertexShaderPath,
    htmlCanvasElement: canvas,
    gl: gl,
  });

  onLoading?.()
  await sceneRenderer.init()

  onLoaded?.()
  onRenderUpdate?.(sceneRenderer.render({
    onRenderReset: onRenderReset
  }))

  requestAnimationFrame(() => {
    sceneRenderer.render({
      onRenderReset: onRenderReset
    })
  })

  sceneRenderer.render({
    onRenderReset: onRenderReset
  })
}