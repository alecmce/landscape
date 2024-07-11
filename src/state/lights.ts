import { Getter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { getColorVec3 } from "../lib/color";
import { PAD } from "../lib/types";

export const UNIFORM_FLOATS_PER_POINT_LIGHT = 8

export const pointLightsAtom = atomWithStorage('landscape:pointLights', {
  light1: {
    position:  { x: 0, y: 10, z: 0 },
    color:     '#ffffff',
    intensity: 1,
  },
  light2: {
    position: { x: 3, y: 5, z: 3 },
    color:    '#ff0000',
    intensity: 0.5,
  }
})

export const pointLightCountAtom = atom(getPointLightCount)

function getPointLightCount(get: Getter): number {
  return Object.keys(get(pointLightsAtom)).length
}

/** Converts the point-light data into the Float32Array format that the shader expects. */
export const pointLightDataAtom = atom(getPointLightData)

function getPointLightData(get: Getter): Float32Array {
  const data = get(pointLightsAtom)
  const lights = Object.values(data)

  return new Float32Array(lights.flatMap(light => ([
    light.position.x, light.position.y, light.position.z, PAD,
    ...getColorVec3(light.color), light.intensity,
  ])))
}
