import { Getter, Setter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Vec3, vec3 } from "wgpu-matrix";
import { AtomUpdate, BYTES_PER_FLOAT, XYZ, resolveUpdate } from "../lib/types";

const MARCHING_SQUARE_DATA_FLOATS = 52 // @see landscsape-shared.wgsl.

const sourceAtom = atomWithStorage<XYZ>('landscape:layers', { x: 128, y: 39, z: 128 });

export const layerInstances = atom(getLayerInstances, setLayerInstances)

export const layersVec3Atom = atom(getLayersVec3)

function getLayersVec3(get: Getter): Vec3 {
  const { x, y, z } = get(sourceAtom)
  return vec3.fromValues(x, y, z)
}

function getLayerInstances(get: Getter) {
  return get(sourceAtom)
}

function setLayerInstances(get: Getter, set: Setter, update: AtomUpdate<XYZ>): void {
  const value = resolveUpdate(sourceAtom, get, update)
  const constrained = { x: constrain(value.x), y: constrain(value.y), z: constrain(value.z) }
  set(sourceAtom, constrained)
}

function constrain(value: number): number {
  return Math.max(1, value)
}

export const layersDataSize = atom(getLayersDataSize)

function getLayersDataSize(get: Getter): number {
  const layers = get(layerInstances)
  return layers.x * layers.y * layers.z * MARCHING_SQUARE_DATA_FLOATS * BYTES_PER_FLOAT
}
