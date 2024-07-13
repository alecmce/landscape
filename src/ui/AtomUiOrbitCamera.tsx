import { ReactNode } from "react";
import { orbitCameraAtom, orbitCameraTargetAtom } from "../state/orbit-camera";
import { farAtom, fovAtom, nearAtom } from "../state/perspective";
import { AtomUiGroup } from "./AtomUIGroup";
import { AtomUiSlider } from "./AtomUiSlider";
import { AtomUiSphericalCoords } from "./AtomUiSphericalCoords";
import { AtomUiXYZ } from "./AtomUiXYZ";


export function AtomUiOrbitCamera(): ReactNode {
  return (
    <AtomUiGroup name="Orbit Camera">
      <AtomUiSphericalCoords atom={orbitCameraAtom} label="" />
      <AtomUiSlider atom={fovAtom} label="Field of View" min={1} max={179} step={1} />
      <AtomUiSlider atom={nearAtom} label="Near" min={0.01} max={1000} step={1} />
      <AtomUiSlider atom={farAtom} label="Far" min={0.01} max={5000} step={1} />
      <AtomUiXYZ atom={orbitCameraTargetAtom} label="Target" min={-100} max={100} step={1} />
    </AtomUiGroup>
  )
}
