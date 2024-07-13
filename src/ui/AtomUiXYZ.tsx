import { Getter, Setter, WritableAtom, atom } from 'jotai';
import { ReactNode, useMemo } from 'react';
import { isNumber } from '../lib/object';
import { ReadWriteAtom, XYZ } from '../lib/types';
import { AtomUiSlider } from './AtomUiSlider';


interface Props {
  atom:       ReadWriteAtom<XYZ>,
  disabled?:  boolean;
  label:      string
  max?:       number | XYZ;
  min?:       number | XYZ;
  step?:      number | XYZ
  debug?:     true
  precision?: number
}

export function AtomUiXYZ(props: Props): ReactNode {
  const { atom, label, min, max, step, ...rest } = props;

  const { x, y, z } = useMemo(() => makeSubAtoms(atom), [atom])

  const isMinNumber = isNumber(min)
  const isMaxNumber = isNumber(max)
  const isStepNumber = isNumber(step)

  return (
    <>
      <AtomUiSlider
        atom={x}
        label={`${label}.x`}
        min={isMinNumber ? min : min?.x}
        max={isMaxNumber ? max : max?.x}
        step={isStepNumber ? step : step?.x}
        {...rest}
      />
      <AtomUiSlider
        atom={y}
        label={`${label}.y`}
        min={isMinNumber ? min : min?.y}
        max={isMaxNumber ? max : max?.y}
        step={isStepNumber ? step : step?.y}
        {...rest}
      />
      <AtomUiSlider
        atom={z}
        label={`${label}.z`}
        min={isMinNumber ? min : min?.z}
        max={isMaxNumber ? max : max?.z}
        step={isStepNumber ? step : step?.z}
        {...rest}
      />
    </>
  )
}

interface XyzAtoms {
  x: WritableAtom<number, [value: number], void>
  y: WritableAtom<number, [value: number], void>
  z: WritableAtom<number, [value: number], void>
}

function makeSubAtoms(source: WritableAtom<XYZ, [value: XYZ], void>): XyzAtoms {
  const x = atom(getX, setX)
  const y = atom(getY, setY)
  const z = atom(getZ, setZ)

  return { x, y, z }

  function getX(get: Getter): number {
    return get(source).x
  }

  function setX(get: Getter, set: Setter, x: number): void {
    const current = get(source)
    set(source, { ...current, x })
  }

  function getY(get: Getter): number {
    return get(source).y
  }

  function setY(get: Getter, set: Setter, y: number): void {
    const current = get(source)
    set(source, { ...current, y })
  }

  function getZ(get: Getter): number {
    return get(source).z
  }

  function setZ(get: Getter, set: Setter, z: number): void {
    const current = get(source)
    set(source, { ...current, z })
  }
}
