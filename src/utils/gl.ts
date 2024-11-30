import { WebGLVersion } from '@/lib/const';

export function createGL(canvas: HTMLCanvasElement) {
  return WebGL2RequirementHandler(
    canvas.getContext(WebGLVersion),
  );
}

export function WebGL2RequirementHandler<T extends any>(value: T | null): T {
  if (!value) {
    throw new Error('WebGL2 support is required!');
  }
  return value;
}
