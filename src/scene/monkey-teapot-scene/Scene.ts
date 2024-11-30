import wavefrontMtlParser from 'mtl-file-parser';
import wavefrontObjParser from 'obj-file-parser';
import RefFrame from '../../models/RefFrame';
import Vector1x4 from '../../models/Vector1x4';
import Material, { DIELECTRIC_MATERIAL, EMISSIVE_MATERIAL } from '../../lib/scene/Material';
import { bvMinDelta, Face, Model, Mtl, ParsedObj } from '@/models/objects';
import { BV } from '@/models/bv';


export class MonkeyTeapotScene {
  objUrl: string;
  mtlUrl: string;
  objCount: number;
  mtlCount: number;
  parsedObjs: ParsedObj[];
  parsedMtls: Material[];
  rootNode: RefFrame | null = null;
  parentNode: RefFrame | null = null;
  cameraNode: RefFrame | null = null;
  GL: WebGL2RenderingContext | null;
  facesTexture: WebGLTexture | null = null;
  AABBsTexture: WebGLTexture | null = null;
  mtlsTexture: WebGLTexture | null = null;

  constructor(
    {
      gl, mtlUrl, objUrl,
    }: {
      gl: WebGL2RenderingContext | null,
      objUrl: string,
      mtlUrl: string,
    },
  ) {
    this.objUrl = objUrl;
    this.mtlUrl = mtlUrl;
    this.objCount = 0;
    this.mtlCount = 0;
    this.parsedObjs = [];
    this.parsedMtls = [];
    this.GL = gl;

    if (gl) {
      this.facesTexture = gl.createTexture();
      this.AABBsTexture = gl.createTexture();
      this.mtlsTexture = gl.createTexture();

      this.rootNode = new RefFrame();
      this.parentNode = new RefFrame(this.rootNode);
      this.cameraNode = new RefFrame(this.parentNode);
      this.cameraNode.translate(new Vector1x4(0.0, -10.0, 2.0));
    }
  }

  async fetchTextFile(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Cannot GET ${url} status=${response.status}`);
    }
    return response.text();
  }

  async init() {
    if (this.GL) {
      const _wavefrontObjParser = new wavefrontObjParser(
        await this.fetchTextFile(this.objUrl),
      );
      const _wavefrontMtlParser = new wavefrontMtlParser(
        await this.fetchTextFile(this.mtlUrl),
      );
      const wavefrontObj = _wavefrontObjParser.parse();
      const wavefrontMtl = _wavefrontMtlParser.parse();

      let posArray: { x: number; y: number; z: number }[] = [];
      let nrmArray: { x: number; y: number; z: number }[] = [];

      this.parsedObjs = wavefrontObj.models.map(({ vertices, vertexNormals, faces }: Model) => {
        const outFaces: Face[] = [];
        posArray = posArray.concat(vertices);
        nrmArray = nrmArray.concat(vertexNormals);

        faces.forEach((f) => {
          const i0 = f.vertices[0].vertexIndex - 1;
          const i1 = f.vertices[1].vertexIndex - 1;
          const i2 = f.vertices[2].vertexIndex - 1;
          const p0 = new Vector1x4(posArray[i0].x, posArray[i0].y, posArray[i0].z);
          const p1 = new Vector1x4(posArray[i1].x, posArray[i1].y, posArray[i1].z);
          const p2 = new Vector1x4(posArray[i2].x, posArray[i2].y, posArray[i2].z);

          const j0 = f.vertices[0].vertexNormalIndex - 1;
          const j1 = f.vertices[1].vertexNormalIndex - 1;
          const j2 = f.vertices[2].vertexNormalIndex - 1;
          const n0 = new Vector1x4(nrmArray[j0].x, nrmArray[j0].y, nrmArray[j0].z);
          const n1 = new Vector1x4(nrmArray[j1].x, nrmArray[j1].y, nrmArray[j1].z);
          const n2 = new Vector1x4(nrmArray[j2].x, nrmArray[j2].y, nrmArray[j2].z);

          const fn = p1.sub(p0).cross(p2.sub(p0)).normalize(); // face normal
          const mi = wavefrontMtl.findIndex((m: Mtl) => m.name === f.material); // material index
          const fi = outFaces.length; // face index

          outFaces.push({
            p0,
            p1,
            p2,
            n0,
            n1,
            n2,
            fn,
            mi,
            fi,
          });
        });
        const outAABBs = [];
        const min = new Vector1x4(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        const max = new Vector1x4(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
        outFaces.forEach((f) => {
          // calculate min/max for root AABB bounding volume
          min.x = Math.min(min.x, f.p0.x, f.p1.x, f.p2.x);
          min.y = Math.min(min.y, f.p0.y, f.p1.y, f.p2.y);
          min.z = Math.min(min.z, f.p0.z, f.p1.z, f.p2.z);
          max.x = Math.max(max.x, f.p0.x, f.p1.x, f.p2.x);
          max.y = Math.max(max.y, f.p0.y, f.p1.y, f.p2.y);
          max.z = Math.max(max.z, f.p0.z, f.p1.z, f.p2.z);
        });

        if (max.x - min.x < bvMinDelta) {
          max.x += bvMinDelta;
        } // don't allow a 2D AABB
        if (max.y - min.y < bvMinDelta) {
          max.y += bvMinDelta;
        }
        if (max.z - min.z < bvMinDelta) {
          max.z += bvMinDelta;
        }
        const bv = new BV(min, max);
        outAABBs.push(bv);
        bv.subDivide(outFaces, outAABBs);

        //console.log(`# faces ${outFaces.length}`);
        //console.log(`# AABBs ${outAABBs.length}`);
        return {
          // a parsed obj containing faces and its corresponding BVH tree
          faces: outFaces,
          AABBs: outAABBs,
        };
      });

      this.parsedMtls = wavefrontMtl.map((mtl: Mtl) => {
        const mat = new Material(new Vector1x4(mtl.Kd.red, mtl.Kd.green, mtl.Kd.blue));
        // 'Metal 0', 0.95, 'Glass 0', 0.00, 1.33
        switch (mtl.name) {
          case 'light':
            mat.mtlCls = EMISSIVE_MATERIAL;
            mat.albedo.r = 3.0;
            mat.albedo.g = 3.0;
            mat.albedo.b = 3.0;
            break;
          case 'glass':
            mat.mtlCls = DIELECTRIC_MATERIAL;
            mat.refractionIndex = 1.52;
            mat.albedo.r = 1.0;
            mat.albedo.g = 1.0;
            mat.albedo.b = 1.0;
            break;
          case 'suzanne':
            mat.reflectionRatio = 0.5;
            mat.reflectionGloss = 0.7;
            break;
          case 'teapot':
            mat.reflectionRatio = 0.9;
            break;
          case 'ladder':
            mat.reflectionRatio = 0.3;
            mat.reflectionGloss = 0.8;
            break;

          default:
            break;
        }
        return mat;
      });
      //console.log(`# mtls ${this.parsedMtls.length}`);

      this.initTextures(this.GL);
      this.objCount = this.parsedObjs.length;
      this.mtlCount = this.parsedMtls.length;
    }
  }

  initTextures(GL: WebGL2RenderingContext) {
    const maxNumFaces = this.parsedObjs.reduce((max, obj) => Math.max(max, obj.faces.length), 0); // max number of faces
    const numTexelsPerFace = 8; // RGBA texel
    const numFloatsPerFace = 24;

    let data = new Float32Array(numFloatsPerFace * maxNumFaces * this.parsedObjs.length);
    this.parsedObjs.forEach((obj, id) => {
      let i = numFloatsPerFace * maxNumFaces * id; // index to start of texture slice for object's faces
      obj.faces.forEach((face) => {
        data[i++] = face.fn.x;
        data[i++] = face.fn.y;
        data[i++] = face.fn.z; // face unit normal

        data[i++] = face.p0.x;
        data[i++] = face.p0.y;
        data[i++] = face.p0.z; // vertex positions
        data[i++] = face.p1.x;
        data[i++] = face.p1.y;
        data[i++] = face.p1.z;
        data[i++] = face.p2.x;
        data[i++] = face.p2.y;
        data[i++] = face.p2.z;

        data[i++] = face.n0.x;
        data[i++] = face.n0.y;
        data[i++] = face.n0.z; // vertex normals
        data[i++] = face.n1.x;
        data[i++] = face.n1.y;
        data[i++] = face.n1.z;
        data[i++] = face.n2.x;
        data[i++] = face.n2.y;
        data[i++] = face.n2.z;

        data[i] = face.mi + 0.5; // material index is cast to int in fragment shader
        i += 3;
      });
    });
    GL.activeTexture(GL.TEXTURE0);
    GL.bindTexture(GL.TEXTURE_2D_ARRAY, this.facesTexture);
    GL.texParameteri(GL.TEXTURE_2D_ARRAY, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D_ARRAY, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D_ARRAY, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D_ARRAY, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.texImage3D(
      GL.TEXTURE_2D_ARRAY,
      0,
      GL.RGB32F,
      numTexelsPerFace,
      maxNumFaces,
      this.parsedObjs.length,
      0,
      GL.RGB,
      GL.FLOAT,
      data,
    );

    const maxNumBVs = this.parsedObjs.reduce((val: number, obj) => Math.max(val, obj.AABBs.length), 0); // max number of BV nodes
    const numTexelsPerBV = 3; // RGBA texel
    const numFloatsPerBV = 12;

    data = new Float32Array(numFloatsPerBV * maxNumBVs * this.parsedObjs.length);
    this.parsedObjs.forEach((obj, id) => {
      let i = numFloatsPerBV * maxNumBVs * id; // index to start of texture slice for the object's BVH tree
      obj.AABBs.forEach((bv) => {
        data[i++] = bv.min.x;
        data[i++] = bv.min.y;
        data[i++] = bv.min.z;
        data[i++] = 1.0;

        data[i++] = bv.max.x;
        data[i++] = bv.max.y;
        data[i++] = bv.max.z;
        data[i++] = 1.0;

        data[i++] = bv.lt + 0.5; // lt node index is cast to int in fragment shader
        data[i++] = bv.rt + 0.5; // rt node index is cast to int in fragment shader
        data[i++] = bv.fi[0] + 0.5; // face index is cast to int in fragment shader
        data[i++] = bv.fi[1] + 0.5; // face index is cast to int in fragment shader
      });
    });
    GL.activeTexture(GL.TEXTURE0);
    GL.bindTexture(GL.TEXTURE_2D_ARRAY, this.AABBsTexture);
    GL.texParameteri(GL.TEXTURE_2D_ARRAY, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D_ARRAY, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D_ARRAY, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D_ARRAY, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.texImage3D(
      GL.TEXTURE_2D_ARRAY,
      0,
      GL.RGBA32F,
      numTexelsPerBV,
      maxNumBVs,
      this.parsedObjs.length,
      0,
      GL.RGBA,
      GL.FLOAT,
      data,
    );

    const numTexelsPerMtl = 2;
    const numFloatsPerMtl = 8;
    data = new Float32Array(numFloatsPerMtl * this.parsedMtls.length);
    this.parsedMtls.forEach((mtl, id) => {
      let i = numFloatsPerMtl * id;
      data[i++] = mtl.albedo.x;
      data[i++] = mtl.albedo.y;
      data[i++] = mtl.albedo.z;
      data[i++] = 1.0;

      data[i++] = mtl.mtlCls + 0.5; // material type is cast to int in fragment shader
      data[i++] = mtl.reflectionRatio;
      data[i++] = mtl.reflectionGloss;
      data[i++] = mtl.refractionIndex;
    });
    GL.activeTexture(GL.TEXTURE0);
    GL.bindTexture(GL.TEXTURE_2D, this.mtlsTexture);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA32F, numTexelsPerMtl, this.parsedMtls.length, 0, GL.RGBA, GL.FLOAT, data);
  }

  bindToSampleShader(GL: WebGL2RenderingContext, program: WebGLProgram) {
    GL.activeTexture(GL.TEXTURE3);
    GL.bindTexture(GL.TEXTURE_2D_ARRAY, this.facesTexture);
    GL.uniform1i(GL.getUniformLocation(program, 'u_face_sampler'), 3);

    GL.activeTexture(GL.TEXTURE4);
    GL.bindTexture(GL.TEXTURE_2D_ARRAY, this.AABBsTexture);
    GL.uniform1i(GL.getUniformLocation(program, 'u_aabb_sampler'), 4);

    GL.activeTexture(GL.TEXTURE5);
    GL.bindTexture(GL.TEXTURE_2D, this.mtlsTexture);
    GL.uniform1i(GL.getUniformLocation(program, 'u_mtl_sampler'), 5);
  }
}
