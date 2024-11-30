import Vector1x4 from '@/models/Vector1x4';
import { BV } from '@/models/bv';

export enum Axis {
  x = 0,
  y = 1,
  z = 2,
}

export const bvMinDelta = 0.01;

export interface Model {
  name: string;
  vertices: { x: number; y: number; z: number }[];
  vertexNormals: { x: number; y: number; z: number }[];
  faces: {
    material: string;
    vertices: { vertexIndex: number; textureCoordsIndex: number; vertexNormalIndex: number }[];
  }[];
}

export interface Mtl {
  name: string;
  Kd: {
    method: string;
    red: number;
    green: number;
    blue: number;
  };
}

export interface Face {
  p0: Vector1x4; // vertex position 0
  p1: Vector1x4; // vertex position 1
  p2: Vector1x4; // vertex position 2

  n0: Vector1x4; // vertex normal 0
  n1: Vector1x4; // vertex normal 1
  n2: Vector1x4; // vertex normal 2

  fn: Vector1x4; // face normal
  fi: number; // index into root face array
  mi: number; // index into material array
}

export interface ParsedObj {
  faces: Face[];
  AABBs: BV[];
}