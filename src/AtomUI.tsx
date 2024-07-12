import { Box, Card, HStack, Icon, Text, createIcon } from "@chakra-ui/react";
import { ReactNode } from "react";
import './atom-ui.css';
import { cameraAtom } from "./state/camera";
import { separationAtom } from "./state/debug";
import { layerInstances } from "./state/layers";
import { ambientLightAtom, pointLightsAtom } from "./state/lights";
import { farAtom, fovAtom, nearAtom, targetAtom } from "./state/perspective";
import { RENDER_TYPE_OPTIONS, renderTypeAtom } from "./state/render-type";
import { xzScaleAtom, yScaleAtom } from "./state/scale";
import { terrainScaleAtom, terrainXYZAtom } from "./state/terrain";
import { AtomUiGroup } from "./ui/AtomUIGroup";
import { AtomUiAccordion } from "./ui/AtomUiAccordion";
import { AtomUiLights } from "./ui/AtomUiLights";
import { AtomUiPrintState } from "./ui/AtomUiPrintState";
import { AtomUiResetState } from "./ui/AtomUiResetState";
import { AtomUiSelect } from "./ui/AtomUiSelect";
import { AtomUiSlider } from "./ui/AtomUiSlider";
import { AtomUiSphericalCoords } from "./ui/AtomUiSphericalCoords";
import { AtomUiXYZ } from "./ui/AtomUiXYZ";

const LAYER_MAX = { x: 128, y: 39, z: 128 }
const TERRAIN_XYZ_MIN = { x: -1000, y: -50, z: -1000 }
const TERRAIN_XYZ_MAX = { x: 1000, y: 10, z: 1000 }

interface Props {
  label: string
}

const DragIconSvg = createIcon({
  displayName: 'DragIcon',
  viewBox:     '0 -960 960 960',
  path:         <path fill="currentColor" d="M360-160q-33 0-56.5-23.5T280-240q0-33 23.5-56.5T360-320q33 0 56.5 23.5T440-240q0 33-23.5 56.5T360-160Zm240 0q-33 0-56.5-23.5T520-240q0-33 23.5-56.5T600-320q33 0 56.5 23.5T680-240q0 33-23.5 56.5T600-160ZM360-400q-33 0-56.5-23.5T280-480q0-33 23.5-56.5T360-560q33 0 56.5 23.5T440-480q0 33-23.5 56.5T360-400Zm240 0q-33 0-56.5-23.5T520-480q0-33 23.5-56.5T600-560q33 0 56.5 23.5T680-480q0 33-23.5 56.5T600-400ZM360-640q-33 0-56.5-23.5T280-720q0-33 23.5-56.5T360-800q33 0 56.5 23.5T440-720q0 33-23.5 56.5T360-640Zm240 0q-33 0-56.5-23.5T520-720q0-33 23.5-56.5T600-800q33 0 56.5 23.5T680-720q0 33-23.5 56.5T600-640Z" />
})

export function AtomUi(props: Props): ReactNode {
  const { label } = props

  return (
    <Card className="atom-ui">
      <Box p={2}>
        <HStack>
          <Icon as={DragIconSvg} />
          <Text fontSize="sm">{ label }</Text>
        </HStack>
        <AtomUiAccordion>
        <AtomUiGroup name="Camera">
          <AtomUiSphericalCoords atom={cameraAtom} label="" />
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
        <AtomUiLights ambientAtom={ambientLightAtom} lightsAtom={pointLightsAtom} />
        <AtomUiGroup name="Debug">
          <AtomUiSlider atom={separationAtom} label="Separation" min={0} max={4} step={0.01} />
          <AtomUiSelect atom={renderTypeAtom} label="Render Type" options={RENDER_TYPE_OPTIONS} />
        </AtomUiGroup>
        </AtomUiAccordion>
        <HStack>
          <AtomUiPrintState matchKey={isLandscapeKey} />
          <AtomUiResetState matchKey={isLandscapeKey} />
        </HStack>
      </Box>
    </Card>
  )

}

function isLandscapeKey(key: string): boolean {
  return key.startsWith('landscape:')
}
