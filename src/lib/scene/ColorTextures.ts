export default class ColorTextures {
  private source: WebGLTexture | null = null;
  private target: WebGLTexture | null = null;

  constructor(
    {
      width, height, gl,
    }: {
      gl: WebGL2RenderingContext,
      width: number,
      height: number
    }) {
    gl.activeTexture(gl.TEXTURE0);
    this.source = gl.createTexture();
    this.target = gl.createTexture();

    if (this.source && this.target) {
      gl.bindTexture(gl.TEXTURE_2D, this.source);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, width, height);

      gl.bindTexture(gl.TEXTURE_2D, this.target);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, width, height);
    }
  }

  bindToSampleShader(GL: WebGL2RenderingContext, program: WebGLProgram): void {
    const textureSwap = this.source;
    this.source = this.target;
    this.target = textureSwap;

    // using texture unit 0
    GL.activeTexture(GL.TEXTURE0);
    GL.bindTexture(GL.TEXTURE_2D, this.target);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.target, 0);

    // using texture unit 1
    GL.activeTexture(GL.TEXTURE1);
    GL.bindTexture(GL.TEXTURE_2D, this.source);
    GL.uniform1i(GL.getUniformLocation(program, 'u_color_sampler'), 1);
  }

  bindToCanvasShader(GL: WebGL2RenderingContext, program: WebGLProgram): void {
    // using texture unit 0
    GL.activeTexture(GL.TEXTURE0);
    GL.bindTexture(GL.TEXTURE_2D, this.target);
    GL.uniform1i(GL.getUniformLocation(program, 'u_color_sampler'), 0);
  }
}
