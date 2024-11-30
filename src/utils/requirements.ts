export function GPU_MeetsRequirements(GL: WebGL2RenderingContext) {
  if (!GL.getExtension('EXT_color_buffer_float')) {
    console.log('EXT_color_buffer_float not supported');
    return false;
  }

  const MAX_ARRAY_TEXTURE_LAYERS = GL.getParameter(GL.MAX_ARRAY_TEXTURE_LAYERS);
  const MAX_TEXTURE_IMAGE_UNITS = GL.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS);
  const MAX_RENDERBUFFER_SIZE = GL.getParameter(GL.MAX_RENDERBUFFER_SIZE);
  const MAX_TEXTURE_SIZE = GL.getParameter(GL.MAX_TEXTURE_SIZE);

  console.log(`MAX_ARRAY_TEXTURE_LAYERS = ${MAX_ARRAY_TEXTURE_LAYERS}`);
  console.log(`MAX_TEXTURE_IMAGE_UNITS = ${MAX_TEXTURE_IMAGE_UNITS}`);
  console.log(`MAX_RENDERBUFFER_SIZE = ${MAX_RENDERBUFFER_SIZE}`);
  console.log(`MAX_TEXTURE_SIZE = ${MAX_TEXTURE_SIZE}`);

  return !(MAX_ARRAY_TEXTURE_LAYERS < 2048 ||
    MAX_TEXTURE_IMAGE_UNITS < 16 ||
    MAX_RENDERBUFFER_SIZE < 16384 ||
    MAX_TEXTURE_SIZE < 16384);
}