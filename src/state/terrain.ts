import { Getter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { PAD } from "../lib/types";
import { firstPersonCameraAtom } from "./first-person-camera";

export const terrainOffsetYAtom = atomWithStorage('landscape:terrain:offset:y', 0)
export const terrainXZScaleAtom = atomWithStorage('landscape:terrain:scale:xz', 10)
export const terrainYScaleAtom = atomWithStorage('landscape:terrain:scale:y', 40)

export const terrainDataAtom = atom(getTerrainData)

function getTerrainData(get: Getter): Float32Array {
  const offset = get(firstPersonCameraAtom)
  const terrainOffsetY = get(terrainOffsetYAtom)
  const terrainXZScale = get(terrainXZScaleAtom)
  const terrainYScale = get(terrainYScaleAtom)

  return new Float32Array([
    offset.x, terrainOffsetY, offset.z, PAD,
    terrainXZScale, terrainYScale, terrainXZScale, PAD,
  ])
}
