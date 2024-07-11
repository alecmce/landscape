import { Getter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Vec3, vec3 } from "wgpu-matrix";

export const xzScaleAtom = atomWithStorage('landscape:xz-scale', 10)
export const yScaleAtom = atomWithStorage('landscape:y-scale', 2)

export const scaleVec3Atom = atom(getScaleVec3)

function getScaleVec3(get: Getter): Vec3 {
  const xzScale = get(xzScaleAtom)
  const yScale = get(yScaleAtom)
  return vec3.fromValues(xzScale, yScale, xzScale)
}
