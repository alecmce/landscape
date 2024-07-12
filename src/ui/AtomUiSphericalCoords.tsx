import { Getter, Setter, WritableAtom, atom } from 'jotai';
import { ReactNode, useMemo } from 'react';
import { SphericalCoordsAtom } from '../lib/types';
import { AtomUiSlider } from './AtomUiSlider';


interface Props {
  atom:       SphericalCoordsAtom;
  disabled?:  boolean;
  label?:     string
  debug?:     true
}

export function AtomUiSphericalCoords(props: Props): ReactNode {
  const { atom, label } = props;

  const { azithmulDegrees, elevationDegrees, radius } = useMemo(() => makeSubAtoms(atom), [atom])
  const stem = label ? `${label}.` : ``

  return (
    <>
      <AtomUiSlider atom={elevationDegrees} label={`${stem}Elevation`} min={-90} max={90} step={1} />
      <AtomUiSlider atom={azithmulDegrees} label={`${stem}Azithmul`} min={-180} max={180} step={1} />
      <AtomUiSlider atom={radius} label={`${stem}Radius`} min={1} max={250} step={1} />
    </>
  )
}

interface XyzAtoms {
  azithmulDegrees:  WritableAtom<number, [value: number], void>
  elevationDegrees: WritableAtom<number, [value: number], void>
  radius:           WritableAtom<number, [value: number], void>
}

function makeSubAtoms(source: SphericalCoordsAtom): XyzAtoms {
  const elevationDegrees = atom(getElevationDegrees, setElevationDegrees)
  const azithmulDegrees = atom(getAzithmulDegrees, setAzithmulDegrees)
  const radius = atom(getRadius, setRadius)

  return { azithmulDegrees, elevationDegrees, radius }

  function getElevationDegrees(get: Getter): number {
    return get(source).elevationDegrees
  }

  function setElevationDegrees(get: Getter, set: Setter, elevationDegrees: number): void {
    const current = get(source)
    set(source, { ...current, elevationDegrees })
  }

  function getAzithmulDegrees(get: Getter): number {
    return get(source).azithmulDegrees
  }

  function setAzithmulDegrees(get: Getter, set: Setter, azithmulDegrees: number): void {
    const current = get(source)
    set(source, { ...current, azithmulDegrees })
  }

  function getRadius(get: Getter): number {
    return get(source).radius
  }

  function setRadius(get: Getter, set: Setter, radius: number): void {
    const current = get(source)
    set(source, { ...current, radius })
  }
}
