import { Getter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { getColorVec3 } from "../lib/color";
import { PAD } from "../lib/types";

export const materialAtom = atomWithStorage('landscape:material', {
  ambientColor:  '#ff8800',
  diffuseColor:  '#ffee00',
  specularColor: '#9900ff',
  shininess:     0.4,
})

/**
 * Converts MaterialAtom into the Float32Array format that the shader expects.
 */
export const materialDataAtom = atom(getMaterialData)

function getMaterialData(get: Getter): Float32Array {
  const material = get(materialAtom)
  return new Float32Array([
    ...getColorVec3(material.ambientColor), PAD,
    ...getColorVec3(material.diffuseColor), PAD,
    ...getColorVec3(material.specularColor), material.shininess,
  ])
}
