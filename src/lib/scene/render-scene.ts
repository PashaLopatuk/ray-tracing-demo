import { appActions, LoadingSpinner } from '@/lib/redux/appSlice'
import Vector1x4 from '@/models/Vector1x4'
import ColorTextures from '@/lib/scene/ColorTextures'
import RandomTexture from '@/lib/scene/RandomTexture'
import SampleShader from '@/lib/scene/SampleShader'
import CanvasShader from '@/lib/scene/CanvasShader'
import {MonkeyTeapotScene} from '@/scene/monkey-teapot-scene/Scene'
import { ICanvasState } from '@/lib/types/ICanvasState'
import { GPU_MeetsRequirements } from '@/utils/requirements'
import { degreesToRadians } from '@/utils/math'
import { Scene } from '@/models/scene';

export class SceneRenderer {
  htmlCanvasElement!: HTMLCanvasElement
  canvasState!: ICanvasState

  sampleVertexShaderSource!: string
  sampleFragmentShaderSource!: string

  canvasVertexShaderSource!: string
  canvasFragmentShaderSource!: string
  gl!: WebGL2RenderingContext

  onRenderReset?: Function

  constructor(params: {
    htmlCanvasElement: HTMLCanvasElement,
    canvasState: ICanvasState
    scene: Scene

    sampleVertexShaderSource: string
    sampleFragmentShaderSource: string

    canvasVertexShaderSource: string
    canvasFragmentShaderSource: string

    gl: WebGLRenderingContext
  }) {
    Object.assign(this, params)
    this.canvasState.scene = params.scene
  }

  render({onRenderReset, disableReRender}: {
    onRenderReset?: Function
    disableReRender?: boolean
  }) {
    if (!disableReRender) {
      this.onRenderReset = onRenderReset
    }
    requestAnimationFrame(() => {

      this.render({
        onRenderReset: onRenderReset
      })
    })

    if (this.canvasState.renderingPass < this.canvasState.numSamples) {
      if (this.canvasState.renderingPass === 0 || (!this.canvasState.lButtonDown && !this.canvasState.rButtonDown)) {
        ++this.canvasState.renderingPass // always render pass 0 even if left or right mouse buttton is down

        if (this.canvasState.sampleShader && this.canvasState.canvasShader) {
          this.canvasState.sampleShader.draw(this.canvasState)
          this.canvasState.canvasShader.draw(this.canvasState)
        }

        const elapsed = Date.now() - this.canvasState.restartRenderTimestamp
        const average = elapsed / this.canvasState.renderingPass
        const eta = (this.canvasState.numSamples - this.canvasState.renderingPass) * average

        return ({
          renderingPass: this.canvasState.renderingPass,
          elapsedTime: new Date(elapsed),
          average: average,
          eta: new Date(eta),
        })

      }
    }
  }

  renderReset() {
    this.canvasState.renderingPass = 0
    this.canvasState.restartRenderTimestamp = Date.now()

    this.onRenderReset?.()
  }

  onMouseMove(event: MouseEvent) {
    if (this.canvasState.scene?.cameraNode && this.canvasState.scene?.parentNode) {
      const x = event.clientX
      const y = event.clientY

      if ((this.canvasState.lButtonDownOnCanvas && this.canvasState.rButtonDownOnCanvas) || (this.canvasState.lButtonDownOnCanvas && event.shiftKey)) {
        // dolly
        if (y !== this.canvasState.y && this.canvasState.scene.cameraNode) {
          this.canvasState.scene.cameraNode.translate(new Vector1x4(0, (this.canvasState.y - y) * this.canvasState.TXYZ_SCALAR, 0))
          this.renderReset()
        }
      } else if ((this.canvasState.lButtonDownOnCanvas && event.ctrlKey) || this.canvasState.rButtonDownOnCanvas) {
        // move
        if (x !== this.canvasState.x || y !== this.canvasState.y) {
          const dx = (this.canvasState.x - x) * this.canvasState.TXYZ_SCALAR
          const dz = (y - this.canvasState.y) * this.canvasState.TXYZ_SCALAR
          const dv = this.canvasState.scene.cameraNode.mapPos(new Vector1x4(dx, 0, dz, 0), this.canvasState.scene.parentNode)
          this.canvasState.scene.parentNode.translate(dv) // move parent in camera space
          this.renderReset()
        }
      } else if (this.canvasState.lButtonDownOnCanvas) {
        // rotate
        if (x !== this.canvasState.x || y !== this.canvasState.y) {
          this.canvasState.scene.parentNode.rotateZ(
            degreesToRadians(this.canvasState.x - x) * this.canvasState.RXYZ_SCALAR,
          )
          // yaw camera target around it's own z-axis
          this.canvasState.scene.cameraNode.rotateX(
            degreesToRadians(this.canvasState.y - y) * this.canvasState.RXYZ_SCALAR, this.canvasState.scene.parentNode,
          ) // pitch around camera's parent x-axis
          this.renderReset()
        }
      }
      this.canvasState.x = x
      this.canvasState.y = y
    }
  }

  onMouseDown(event: MouseEvent) {
    const rect = this.htmlCanvasElement.getBoundingClientRect()
    this.canvasState.x = event.clientX
    this.canvasState.y = event.clientY

    switch (event.button) {
      case 0:
        this.canvasState.lButtonDown = true
        this.canvasState.lButtonDownOnCanvas = (
          this.canvasState.x > rect.left
          && this.canvasState.x < rect.right
          && this.canvasState.y > rect.top
          && this.canvasState.y < rect.bottom
        )
        break
      case 2:
        this.canvasState.rButtonDown = true
        this.canvasState.rButtonDownOnCanvas = (
          this.canvasState.x > rect.left
          && this.canvasState.x < rect.right
          && this.canvasState.y > rect.top
          && this.canvasState.y < rect.bottom
        )
        break
      default:
        break
    }
  }

  onMouseUp(event: MouseEvent) {
    switch (event.button) {
      case 0:
        this.canvasState.lButtonDown = false
        this.canvasState.lButtonDownOnCanvas = false
        break
      case 2:
        this.canvasState.rButtonDown = false
        this.canvasState.rButtonDownOnCanvas = false
        break
      default:
        break
    }
  }

  async init() {
    if (!this.canvasState.gl) {
      this.canvasState.gl = this.gl

      if (this.canvasState.gl && GPU_MeetsRequirements(this.canvasState.gl)) {
        window.oncontextmenu = (e: MouseEvent) => e.preventDefault();
        // window.onmousemove = this.onMouseMove;
        // window.onmousedown = this.onMouseDown;
        // window.onmouseup = this.onMouseUp;

        window.addEventListener('onmousemove', e => this.onMouseMove(e as any))
        window.addEventListener('onmousedown', e => this.onMouseDown(e as any))
        window.addEventListener('onmouseup', e => this.onMouseUp(e as any))

        this.canvasState.colorTextures = new ColorTextures({
          gl: this.canvasState.gl,
          width: this.canvasState.canvasWd,
          height: this.canvasState.canvasHt
        });
        this.canvasState.randomTexture = new RandomTexture(this.canvasState.gl, this.canvasState.canvasWd, this.canvasState.canvasHt);
        this.canvasState.sampleShader = new SampleShader({
          gl: this.canvasState.gl
        });
        this.canvasState.canvasShader = new CanvasShader();

        await this.canvasState.sampleShader.init(
          {
            gl: this.canvasState.gl,
            vertexShaderUrl: this.sampleVertexShaderSource,
            fragmentShaderUrl: this.sampleFragmentShaderSource,
          }
          // '/sample-vs.glsl', '/sample-fs.glsl'
        )
        await this.canvasState.canvasShader.init({
            gl: this.canvasState.gl,
            fragmentShaderUrl: this.canvasFragmentShaderSource,
            vertexShaderUrl: this.canvasVertexShaderSource,
          },
          // '/canvas-vs.glsl', '/canvas-fs.glsl'
        )

        const scene = this.canvasState.scene!.init()

        return scene
          // .then(() => {
          //   dispatch(appActions.setLoadingSpinner(LoadingSpinner.show));
          //   // this.canvasState.scene = new Scene(this.canvasState.GL, '/suzanne.obj', '/suzanne.mtl');
          //   return this.canvasState.scene.init();
          // })
          // .then(() => {
          //   dispatch(appActions.setLoadingSpinner(LoadingSpinner.hide));
          //   requestAnimationFrame(render);
          // })
          // .catch(() => {
          //   dispatch(appActions.setLoadingSpinner(LoadingSpinner.fail));
          // });
      }
    }
  }
}