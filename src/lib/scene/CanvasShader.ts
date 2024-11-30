import { ICanvasState } from '../types/ICanvasState';
import Shader from './Shader';

export default class CanvasShader extends Shader {
  constructor() {
    super();
  }

  draw({ gl, renderingPass, colorTextures }: ICanvasState) {
    if (this.program && gl && colorTextures) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      gl.useProgram(this.program);
      gl.bindVertexArray(this.va);
      colorTextures.bindToCanvasShader(gl, this.program);

      gl.uniform1f(gl.getUniformLocation(this.program, 'u_inv_render_pass'), 1.0 / renderingPass);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
  }
}
