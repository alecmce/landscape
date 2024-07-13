import { Atom, Getter, WritableAtom } from "jotai"
import { isFunction } from "./object"

export const BYTES_PER_FLOAT = 4
export const PAD = 0

export type ReadWriteAtom<Value> = WritableAtom<Value, [AtomUpdate<Value>], void>

export type AtomUpdate<Value> = Value | UpdateAtom<Value>

export interface UpdateAtom<Value> {
  (previous: Value): Value
}

export function resolveUpdate<Value>(sourceAtom: Atom<Value>, get: Getter, update: AtomUpdate<Value>): Value {
  return isFunction(update) ? update(get(sourceAtom)) : update;
}

// Avoiding mathematical notation for clarity. @see https://en.wikipedia.org/wiki/Spherical_coordinate_system
export interface SphericalCoords {
  elevationDegrees: number // Polar angle (latitude-like)
  azithmulDegrees:  number // Azimuthal angle (longitude-like)
  radius:           number // Distance from origin
}

export type SphericalCoordsAtom = ReadWriteAtom<SphericalCoords>

export type XYZ = { x: number, y: number, z: number }

export interface TextureWithSampler {
  texture: GPUTexture
  sampler: GPUSampler
}
