import chroma from "chroma-js";
import { Atom, Getter, atom } from "jotai";
import { Vec3, vec3 } from "wgpu-matrix";
import { ReadWriteAtom } from "./types";

/** Converts a color from a hex string into an RGB Vec3 (Float32Array). */
export function colorVec3Atom(color: ReadWriteAtom<string>): Atom<Vec3> {
  return atom(getVec3)

  function getVec3(get: Getter): Vec3 {
    return getColorVec3(get(color))
  }
}

export function getColorVec3(hex: string): Vec3 {
  const rgb = chroma(hex).gl()
  return vec3.fromValues(rgb[0], rgb[1], rgb[2])
}
