import { Getter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export enum RENDER_TYPE {
  STANDARD       = 'standard',
  SQUARE_TYPE    = 'square-type',
  NORMALS        = 'normals',
  POSITION_SCALE = 'position-scale',
}

export const RENDER_TYPE_OPTIONS = [
  { label: 'Standard',       value: RENDER_TYPE.STANDARD },
  { label: 'Square Type',    value: RENDER_TYPE.SQUARE_TYPE },
  { label: 'Normals',        value: RENDER_TYPE.NORMALS },
  { label: 'Position Scale', value: RENDER_TYPE.POSITION_SCALE },
]

const RENDER_TYPE_VALUES: Record<RENDER_TYPE, number> = {
  [RENDER_TYPE.STANDARD]:       0,
  [RENDER_TYPE.SQUARE_TYPE]:    1,
  [RENDER_TYPE.NORMALS]:        2,
  [RENDER_TYPE.POSITION_SCALE]: 3,
}

export const renderTypeAtom = atomWithStorage('landscape:render-type', RENDER_TYPE.STANDARD)

export const renderTypeValueAtom = atom(getRenderTypeValue)

function getRenderTypeValue(get: Getter): number {
  const type = get(renderTypeAtom)
  return RENDER_TYPE_VALUES[type]
}
