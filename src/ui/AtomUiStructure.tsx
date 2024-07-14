import { ReactNode } from "react";
import { layerInstances } from "../state/layers";
import { xzScaleAtom, yScaleAtom } from "../state/scale";
import { terrainOffsetYAtom, terrainXZScaleAtom, terrainYScaleAtom } from "../state/terrain";
import { AtomUiGroup } from "./AtomUIGroup";
import { AtomUiSlider } from "./AtomUiSlider";
import { AtomUiXYZ } from "./AtomUiXYZ";

const LAYER_MAX = { x: 128, y: 39, z: 128 }

export function AtomUiStructure(): ReactNode {
  return (
    <AtomUiGroup name="Structure">
      <AtomUiXYZ atom={layerInstances} label="Layers" min={1} max={LAYER_MAX} step={1} />
      <AtomUiSlider atom={xzScaleAtom} label="Layer XZ Scale" min={1} max={10} step={0.01} />
      <AtomUiSlider atom={yScaleAtom} label="Layer Y Scale" min={1} max={100} step={0.01} />
      <AtomUiSlider atom={terrainOffsetYAtom} label="Terrain Offset Y" min={-50} max={10} step={0.01} />
      <AtomUiSlider atom={terrainXZScaleAtom} label="Terrain XZ Scale" min={1} max={100} step={0.01} />
      <AtomUiSlider atom={terrainYScaleAtom} label="Terrain Y Scale" min={1} max={100} step={0.01} />
    </AtomUiGroup>
  )
}
