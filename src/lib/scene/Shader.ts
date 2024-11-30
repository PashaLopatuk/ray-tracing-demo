export default class Shader {
  vertexShader: WebGLShader | null;
  fragmentShader: WebGLShader | null;
  va: WebGLVertexArrayObject | null;
  program: WebGLProgram | null;

  constructor() {
    this.vertexShader = null;
    this.fragmentShader = null;
    this.va = null;
    this.program = null;
  }

  private async fetchShader(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Unable to GET ${url} status=${response.status}`);
    }
    return response.text();
  }

  async init(
    {
      gl,
      fragmentShaderUrl,
      vertexShaderUrl,
    }: {
      gl: WebGL2RenderingContext,
      vertexShaderUrl: string,
      fragmentShaderUrl: string
    }): Promise<void> {
    this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (this.vertexShader) {
      const vertexShaderSource = await this.fetchShader(vertexShaderUrl);

      gl.shaderSource(this.vertexShader, vertexShaderSource);
      gl.compileShader(this.vertexShader);
      if (!gl.getShaderParameter(this.vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(`Error compiling vertex shader !\n ${gl.getShaderInfoLog(this.vertexShader)}\n`);
      }

      const fragmentShaderSource = await this.fetchShader(fragmentShaderUrl)

      this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      if (this.fragmentShader) {
        gl.shaderSource(this.fragmentShader, fragmentShaderSource);
        gl.compileShader(this.fragmentShader);
        if (!gl.getShaderParameter(this.fragmentShader, gl.COMPILE_STATUS)) {
          throw new Error(`Error compiling fragment !\n ${gl.getShaderInfoLog(this.fragmentShader)}\n`);
        }

        this.program = gl.createProgram();
        if (this.program) {
          gl.attachShader(this.program, this.vertexShader);
          gl.attachShader(this.program, this.fragmentShader);
          gl.linkProgram(this.program);
          if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            const log = gl.getProgramInfoLog(this.program);
            throw new Error(`Error linking shader program!\n ${log}\n`);
          }

          // vertices for clip space rectangle covering entire canvas
          this.va = gl.createVertexArray(); // begin vertex array object
          if (this.va) {
            gl.bindVertexArray(this.va);
            const vtxBuf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vtxBuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, +1, -1, +1, +1, -1, +1]), gl.STATIC_DRAW);
            const desc = {
              length: 2,
              stride: 8,
              offset: 0,
            };
            const loc = gl.getAttribLocation(this.program, 'a_vert_data');
            gl.vertexAttribPointer(loc, desc.length, gl.FLOAT, false, desc.stride, desc.offset);

            gl.enableVertexAttribArray(loc);
            gl.bindVertexArray(null); // end vertex array object
          }
        }
      }
    }
  }
}
