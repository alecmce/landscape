import { Getter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { PAD } from "../lib/types";

export const terrainXYZAtom = atomWithStorage('landscape:terrain', { x: -1000, y: 0, z: 0 })
export const terrainScaleAtom = atomWithStorage('landscape:terrain:scale', { x: 10, y: 50, z: 10 })

export const terrainDataAtom = atom(getTerrainData)

function getTerrainData(get: Getter): Float32Array {
  const terrainXYZ = get(terrainXYZAtom)
  const terrainScale = get(terrainScaleAtom)

  return new Float32Array([
    terrainXYZ.x, terrainXYZ.y, terrainXYZ.z, PAD,
    terrainScale.x, terrainScale.y, terrainScale.z, PAD,
  ])
}
