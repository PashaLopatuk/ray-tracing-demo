import Vector1x4 from '../../models/Vector1x4';
import { ICanvasState } from '../types/ICanvasState';
import Shader from './Shader';

export default class SampleShader extends Shader {
  private frameBuffer: WebGLFramebuffer | null = null;

  constructor(
    {
      gl,
    }: {
      gl: WebGL2RenderingContext | null
    }) {
    super();

    if (gl) {
      this.frameBuffer = gl.createFramebuffer();
      if (this.frameBuffer) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
    }
  }

  draw({
         canvasWd,
         canvasHt,

         cameraFov,
         numBounces,
         shadingMethod,
         renderingPass,

         gl,
         colorTextures,
         randomTexture,
         scene,
       }: ICanvasState) {
    if (this.program && gl && colorTextures && randomTexture && scene?.cameraNode) {
      const origin = new Vector1x4(0.0, 0.0, 0.0); // in view space
      const eyePos = origin.mul(scene.cameraNode.modelMatrix); // in world space

      gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
      gl.useProgram(this.program);
      gl.bindVertexArray(this.va);

      gl.uniform1f(gl.getUniformLocation(this.program, 'u_half_wd'), canvasWd * 0.5);
      gl.uniform1f(gl.getUniformLocation(this.program, 'u_half_ht'), canvasHt * 0.5);
      gl.uniform1i(gl.getUniformLocation(this.program, 'u_num_objects'), scene.objCount);
      gl.uniform1i(gl.getUniformLocation(this.program, 'u_render_pass'), renderingPass);
      gl.uniform1i(gl.getUniformLocation(this.program, 'u_num_bounces'), renderingPass === 1 ? 1 : numBounces);
      gl.uniform1i(gl.getUniformLocation(this.program, 'u_shadingMethod'), shadingMethod);
      gl.uniform1f(
        gl.getUniformLocation(this.program, 'u_eye_to_image'),
        (canvasHt * 0.5) / Math.tan(cameraFov * 0.5 * (Math.PI / 180.0)),
      );
      gl.uniform3f(gl.getUniformLocation(this.program, 'u_eye_position'), eyePos.x, eyePos.y, eyePos.z);
      gl.uniformMatrix4fv(
        gl.getUniformLocation(this.program, 'u_eye_to_world'),
        false,
        scene.cameraNode.modelMatrix.toFloat32Array(),
      );

      scene.bindToSampleShader(gl, this.program);
      colorTextures.bindToSampleShader(gl, this.program);
      randomTexture.bindToSampleShader(gl, this.program);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
  }
}
