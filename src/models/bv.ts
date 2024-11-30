import Vector1x4 from '@/models/Vector1x4';
import { Axis, bvMinDelta, Face } from '@/models/objects';

export class BV {
  // AABB bounding volume
  min: Vector1x4; // min corner
  max: Vector1x4; // max corner
  lt: number; // lt child BV index
  rt: number; // rt child BV index
  fi: number[]; // face indices

  constructor(min: Vector1x4, max: Vector1x4) {
    this.min = min;
    this.max = max;
    this.lt = -2.0;
    this.rt = -2.0;
    this.fi = [-2.0, -2.0];
  }

  subDivide(faces: Face[], AABBs: BV[]) {
    if (faces.length <= this.fi.length) {
      // all the faces fit in this node
      faces.forEach((face, i) => (this.fi[i] = face.fi));
    } else {
      // split the AABB into two across the longest AABB axis
      const dx = Math.abs(this.max.x - this.min.x);
      const dy = Math.abs(this.max.y - this.min.y);
      const dz = Math.abs(this.max.z - this.min.z);
      const largestDelta = Math.max(dx, dy, dz);

      if (largestDelta === dx) {
        this.splitAcross(Axis.x, faces, AABBs); // split BV AABB across x axis
      } else if (largestDelta === dy) {
        this.splitAcross(Axis.y, faces, AABBs); // split BV AABB across y axis
      } else {
        this.splitAcross(Axis.z, faces, AABBs); // split BV AABB across z axis
      }
    }
  }

  splitAcross(axis: 0 | 1 | 2, faces: Face[], AABBs: BV[]) {
    const sorted = [...faces].sort((faceA, faceB) => {
      const a0 = faceA.p0.xyzw[axis];
      const a1 = faceA.p1.xyzw[axis];
      const a2 = faceA.p2.xyzw[axis];

      const b0 = faceB.p0.xyzw[axis];
      const b1 = faceB.p1.xyzw[axis];
      const b2 = faceB.p2.xyzw[axis];

      return (a0 + a1 + a2) / 3.0 - (b0 + b1 + b2) / 3.0;
    });

    const h = sorted.length / 2;
    const l = sorted.length;
    const ltFaces = sorted.slice(0, h); // left faces
    const rtFaces = sorted.slice(h, l); // right faces
    let ltBV = null;
    let rtBV = null;

    if (ltFaces.length > 0) {
      const min = new Vector1x4(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
      const max = new Vector1x4(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
      ltFaces.forEach((f) => {
        min.x = Math.min(min.x, f.p0.x, f.p1.x, f.p2.x);
        min.y = Math.min(min.y, f.p0.y, f.p1.y, f.p2.y);
        min.z = Math.min(min.z, f.p0.z, f.p1.z, f.p2.z);
        max.x = Math.max(max.x, f.p0.x, f.p1.x, f.p2.x);
        max.y = Math.max(max.y, f.p0.y, f.p1.y, f.p2.y);
        max.z = Math.max(max.z, f.p0.z, f.p1.z, f.p2.z);
      });
      if (max.x - min.x < bvMinDelta) {
        max.x += bvMinDelta;
      }
      if (max.y - min.y < bvMinDelta) {
        max.y += bvMinDelta;
      }
      if (max.z - min.z < bvMinDelta) {
        max.z += bvMinDelta;
      }

      this.lt = AABBs.length;
      ltBV = new BV(min, max);
      AABBs.push(ltBV);
    }

    if (rtFaces.length > 0) {
      const min = new Vector1x4(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
      const max = new Vector1x4(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
      rtFaces.forEach((f) => {
        min.x = Math.min(min.x, f.p0.x, f.p1.x, f.p2.x);
        min.y = Math.min(min.y, f.p0.y, f.p1.y, f.p2.y);
        min.z = Math.min(min.z, f.p0.z, f.p1.z, f.p2.z);
        max.x = Math.max(max.x, f.p0.x, f.p1.x, f.p2.x);
        max.y = Math.max(max.y, f.p0.y, f.p1.y, f.p2.y);
        max.z = Math.max(max.z, f.p0.z, f.p1.z, f.p2.z);
      });
      if (max.x - min.x < bvMinDelta) {
        max.x += bvMinDelta;
      }
      if (max.y - min.y < bvMinDelta) {
        max.y += bvMinDelta;
      }
      if (max.z - min.z < bvMinDelta) {
        max.z += bvMinDelta;
      }

      this.rt = AABBs.length;
      rtBV = new BV(min, max);
      AABBs.push(rtBV);
    }

    if (ltBV) {
      ltBV.subDivide(ltFaces, AABBs);
    }
    if (rtBV) {
      rtBV.subDivide(rtFaces, AABBs);
    }
  }
}
