import { MonkeyTeapotScene } from '@/scene/monkey-teapot-scene/Scene';
import { createGL } from '@/utils/gl';
import { SceneRenderer } from '@/lib/scene/render-scene';
import { ICanvasState } from '@/lib/types/ICanvasState';
import { MonkeyHeadMtlModelPath, MonkeyHeadObjModelPath } from '@/lib/models';
import {
  CanvasFragmentShaderPath,
  CanvasVertexShaderPath,
  SampleFragmentShaderPath,
  SampleVertexShaderPath,
} from '@/lib/shaders';

export async function initMonkeyAndTeapotScene(
  {
    canvas,
    canvasState,
    onRenderReset,
    onLoaded,
    onLoading,
    onRenderUpdate,
    onLoadingError
  }: {
    canvas: HTMLCanvasElement
    canvasState: ICanvasState

    onRenderUpdate?: Function
    onLoading?: Function
    onLoadingError?: Function
    onLoaded?: Function
    onRenderReset?: Function
  }) {

  const gl = createGL(canvas);

  const scene = new MonkeyTeapotScene({
    gl: gl,
    objUrl: MonkeyHeadObjModelPath,
    mtlUrl: MonkeyHeadMtlModelPath,

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


  // requestAnimationFrame(() => {
  //   console.log(1243)
  //   sceneRenderer.render({
  //     onRenderReset: onRenderReset
  //   })
  // })

  sceneRenderer.render({
    onRenderReset: onRenderReset
  })
}