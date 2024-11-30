import Material from '@/lib/scene/Material';
import RefFrame from '@/models/RefFrame';
import { ParsedObj } from '@/models/objects';

export abstract class Scene {
  objUrl!: string;
  mtlUrl!: string;
  objCount!: number;
  mtlCount!: number;
  parsedObjs!: ParsedObj[];
  parsedMtls!: Material[];
  rootNode: RefFrame | null = null;
  parentNode: RefFrame | null = null;
  cameraNode: RefFrame | null = null;
  GL!: WebGL2RenderingContext | null;
  facesTexture: WebGLTexture | null = null;
  AABBsTexture: WebGLTexture | null = null;
  mtlsTexture: WebGLTexture | null = null;

  abstract bindToSampleShader(GL: WebGL2RenderingContext, program: WebGLProgram): void
  abstract initTextures(GL: WebGL2RenderingContext): void
  abstract init(): Promise<void>;
  protected constructor(GL: WebGL2RenderingContext | null, objUrl: string, mtlUrl: string) {}

}