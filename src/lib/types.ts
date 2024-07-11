import { WritableAtom } from "jotai"

export const BYTES_PER_FLOAT = 4
export const PAD = 0

export type ReadWriteAtom<Value> = WritableAtom<Value, [valueOrUpdate: Value | UpdateAtom<Value>], void>

export interface UpdateAtom<Value> {
  (value: Value): Value
}

// Avoiding mathematical notation for clarity. @see https://en.wikipedia.org/wiki/Spherical_coordinate_system
export interface SphericalCoords {
  elevationDegrees: number // Polar angle (latitude-like)
  azithmulDegrees:  number // Azimuthal angle (longitude-like)
  radius:           number // Distance from origin
}

export type SphericalCoordsAtom = ReadWriteAtom<SphericalCoords>

export type XYZ = { x: number, y: number, z: number }
