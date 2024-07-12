import { Getter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { getColorVec3 } from "../lib/color";
import { PAD, XYZ } from "../lib/types";

export const UNIFORM_FLOATS_PER_POINT_LIGHT = 8

export interface Lights {
  [key: string]: PointLight
}

export interface PointLight {
  position:  XYZ
  color:     string
  intensity: number
}

export interface AmbientLight {
  color:     string
  intensity: number
}

export const ambientLightAtom = atomWithStorage<AmbientLight>('landscape:ambientLight', {
  color: '#ffffff', intensity: 0.2
})

export const pointLightsAtom = atomWithStorage<Lights>('landscape:pointLights', {
  light1: {
    position:  { x: 0, y: 100, z: -81 },
    color:     '#ffffff',
    intensity: 0.2,
  },
})

export const pointLightCountAtom = atom(getPointLightCount)

function getPointLightCount(get: Getter): number {
  return Object.keys(get(pointLightsAtom)).length
}

/** Converts the point-light data into the Float32Array format that the shader expects. */
export const lightDataAtom = atom(getLightData)

function getLightData(get: Getter): Float32Array {
  const ambientLight = get(ambientLightAtom)
  const pointLights = get(pointLightsAtom)
  const pointLightValues = Object.values(pointLights)

  return new Float32Array([
    ...getColorVec3(ambientLight.color), ambientLight.intensity,
    ...pointLightValues.flatMap(light => ([
      light.position.x, light.position.y, light.position.z, PAD,
      ...getColorVec3(light.color), light.intensity,
    ]))
  ])
}
