import { ReactNode } from "react";
import { separationAtom } from "../state/debug";
import { RENDER_TYPE_OPTIONS, renderTypeAtom } from "../state/render-type";
import { AtomUiGroup } from "./AtomUIGroup";
import { AtomUiSelect } from "./AtomUiSelect";
import { AtomUiSlider } from "./AtomUiSlider";


export function AtomUiDebug(): ReactNode {
  return (
    <AtomUiGroup name="Debug">
      <AtomUiSlider atom={separationAtom} label="Separation" min={0} max={4} step={0.01} />
      <AtomUiSelect atom={renderTypeAtom} label="Render Type" options={RENDER_TYPE_OPTIONS} />
    </AtomUiGroup>
  )
}
