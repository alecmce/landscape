import { Accordion, Box, Card } from "@chakra-ui/react";
import { Getter, Setter, atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { ReactNode } from "react";
import { AtomUiGroup } from "./AtomUIGroup";
import './atom-ui.css';
import { isArray } from "./lib/object";
import { cameraAtom } from "./state/camera";
import { separationAtom } from "./state/debug";
import { layerInstances } from "./state/layers";
import { farAtom, fovAtom, nearAtom, targetAtom } from "./state/perspective";
import { RENDER_TYPE_OPTIONS, renderTypeAtom } from "./state/render-type";
import { xzScaleAtom, yScaleAtom } from "./state/scale";
import { terrainScaleAtom, terrainXYZAtom } from "./state/terrain";
import { AtomUiSelect } from "./ui/AtomUiSelect";
import { AtomUiSlider } from "./ui/AtomUiSlider";
import { AtomUiSphericalCoords } from "./ui/AtomUiSphericalCoords";
import { AtomUiXYZ } from "./ui/AtomUiXYZ";

const LAYER_MAX = { x: 128, y: 39, z: 128 }
const TERRAIN_XYZ_MIN = { x: -1000, y: -50, z: -1000 }
const TERRAIN_XYZ_MAX = { x: 1000, y: 10, z: 1000 }

export function AtomUi(): ReactNode {

  const [groupArray, setGroupArray] = useAtom(groupArrayAtom)

  return (
    <Card className="atom-ui">
      <Box p={2}>
        <Accordion allowMultiple index={groupArray} onChange={onGroupChange}>
        <AtomUiGroup name="Camera">
          <AtomUiSphericalCoords atom={cameraAtom} label="Camera" />
          <AtomUiSlider atom={fovAtom} label="Field of View" min={1} max={179} step={1} />
          <AtomUiSlider atom={nearAtom} label="Near" min={0.01} max={1000} step={1} />
          <AtomUiSlider atom={farAtom} label="Far" min={0.01} max={5000} step={1} />
          <AtomUiXYZ atom={targetAtom} label="Target" min={-100} max={100} step={1} />
        </AtomUiGroup>
        <AtomUiGroup name="Structure">
          <AtomUiXYZ atom={layerInstances} label="Layers" min={1} max={LAYER_MAX} step={1} />
          <AtomUiSlider atom={xzScaleAtom} label="XZ Scale" min={1} max={10} step={0.01} />
          <AtomUiSlider atom={yScaleAtom} label="Y Scale" min={1} max={100} step={0.01} />
        </AtomUiGroup>
        <AtomUiGroup name="Terrain">
          <AtomUiXYZ atom={terrainXYZAtom} label="Position" min={TERRAIN_XYZ_MIN} max={TERRAIN_XYZ_MAX} step={0.01} />
          <AtomUiXYZ atom={terrainScaleAtom} label="Scale" min={1} max={100} step={0.01} />
        </AtomUiGroup>
        <AtomUiGroup name="Debug">
          <AtomUiSlider atom={separationAtom} label="Separation" min={0} max={4} step={0.01} />
          <AtomUiSelect atom={renderTypeAtom} label="Render Type" options={RENDER_TYPE_OPTIONS} />
        </AtomUiGroup>
        </Accordion>
      </Box>
    </Card>
  )

  function onGroupChange(expanded: number | number[]): void {
    setGroupArray(isArray(expanded) ? expanded : [expanded])
  }
}

/** Stores the open groups in local storage. */
const groupDataAtom = atomWithStorage<{ [key: string]: true }>('landscape-group-data', { 1: true })

/** Exposes the stored group data atom to an array getter/setter. */
const groupArrayAtom = atom(getGroupArray, setGroupArray)

function getGroupArray(get: Getter) {
  const data = get(groupDataAtom)
  return Object.keys(data).map(Number)
}

function setGroupArray(_: Getter, set: Setter, value: number[]) {
  const data = value.reduce((acc, id) => ({ ...acc, [id]: true }), {})
  set(groupDataAtom, data)
}
