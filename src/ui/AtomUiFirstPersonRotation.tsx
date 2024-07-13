import { Getter, Setter, WritableAtom, atom } from 'jotai';
import { ReactNode, useMemo } from 'react';
import { ReadWriteAtom } from '../lib/types';
import { FirstPersonInfo } from '../state/first-person-camera';
import { AtomUiSlider } from './AtomUiSlider';


interface Props {
  atom:       ReadWriteAtom<FirstPersonInfo>;
  disabled?:  boolean;
  label?:     string
}

export function AtomUiFirstPersonRotation(props: Props): ReactNode {
  const { atom, label } = props;

  const { pitchDegrees, yawDegrees } = useMemo(() => makeSubAtoms(atom), [atom])
  const stem = label ? `${label}.` : ``

  return (
    <>
      <AtomUiSlider atom={yawDegrees} label={`${stem}Yaw`} min={-180} max={180} step={0.01} />
      <AtomUiSlider atom={pitchDegrees} label={`${stem}Pitch`} min={-90} max={90} step={1} />
    </>
  )
}

interface Atoms {
  pitchDegrees: WritableAtom<number, [value: number], void>
  yawDegrees:   WritableAtom<number, [value: number], void>
}

function makeSubAtoms(source: ReadWriteAtom<FirstPersonInfo>): Atoms {
  const yawDegrees = atom(getElevationDegrees, setElevationDegrees)
  const pitchDegrees = atom(getAzithmulDegrees, setAzithmulDegrees)

  return { pitchDegrees, yawDegrees }

  function getElevationDegrees(get: Getter): number {
    return get(source).yaw
  }

  function setElevationDegrees(get: Getter, set: Setter, yaw: number): void {
    const current = get(source)
    set(source, { ...current, yaw })
  }

  function getAzithmulDegrees(get: Getter): number {
    return get(source).pitch
  }

  function setAzithmulDegrees(get: Getter, set: Setter, pitch: number): void {
    const current = get(source)
    set(source, { ...current, pitch })
  }
}
