import { Getter, Setter, atom } from "jotai";
import { ReactNode, useMemo } from "react";
import { AtomUpdate, ReadWriteAtom, XYZ, resolveUpdate } from "../lib/types";
import { FirstPersonInfo, firstPersonCameraAtom } from "../state/first-person-camera";
import { farAtom, fovAtom, nearAtom } from "../state/perspective";
import { AtomUiGroup } from "./AtomUIGroup";
import { AtomUiFirstPersonRotation } from "./AtomUiFirstPersonRotation";
import { AtomUiSlider } from "./AtomUiSlider";
import { AtomUiXYZ } from "./AtomUiXYZ";


const POSITION_MIN = { x: -1000, y: 0, z: -1000 }
const POSITION_MAX = { x: 1000, y: 100, z: 1000 }

export function AtomUiFirstPersonCamera(): ReactNode {
  const xyzAtom = useMemo(() => getPositionAtom(firstPersonCameraAtom), [])

  return (
    <AtomUiGroup name="First Person Camera">
      <AtomUiXYZ atom={xyzAtom} label="Target" min={POSITION_MIN} max={POSITION_MAX} step={0.01} />
      <AtomUiFirstPersonRotation atom={firstPersonCameraAtom} />
      <AtomUiSlider atom={fovAtom} label="Field of View" min={1} max={179} step={1} />
      <AtomUiSlider atom={nearAtom} label="Near" min={0.01} max={1000} step={1} />
      <AtomUiSlider atom={farAtom} label="Far" min={0.01} max={5000} step={1} />
    </AtomUiGroup>
  )
}

function getPositionAtom(sourceAtom: ReadWriteAtom<FirstPersonInfo>): ReadWriteAtom<XYZ> {
  return atom(getPosition, setPosition)

  function getPosition(get: Getter): XYZ {
    const { x, y, z } = get(sourceAtom)
    return { x, y, z }
  }

  function setPosition(get: Getter, set: Setter, update: AtomUpdate<XYZ>): void {
    const { x, y, z } = resolveUpdate(sourceAtom, get, update)
    const current = get(sourceAtom)
    set(sourceAtom, { ...current, x, y, z })
  }
}
