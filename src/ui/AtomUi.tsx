import { Box, Card, HStack, Icon, Text, createIcon } from "@chakra-ui/react";
import { ReactNode, useState } from "react";
import { useDraggablePanel } from "../hooks/use-draggable-panel";
import { ambientLightAtom, pointLightsAtom } from "../state/lights";
import { AtomUiAccordion } from "./AtomUiAccordion";
import { AtomUiDebug } from "./AtomUiDebug";
import { AtomUiFirstPersonCamera } from "./AtomUiFirstPersonCamera";
import { AtomUiLights } from "./AtomUiLights";
import { AtomUiPrintState } from "./AtomUiPrintState";
import { AtomUiResetState } from "./AtomUiResetState";
import { AtomUiStructure } from "./AtomUiStructure";
import './atom-ui.css';


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

  const [subject, setSubject] = useState<HTMLElement | null>(null)
  const [target, setTarget] = useState<HTMLElement | null>(null)

  useDraggablePanel({ subject, target })

  return (
    <Card className="atom-ui" ref={setSubject}>
      <Box p={2}>
        <HStack>
          <Icon as={DragIconSvg} ref={setTarget} />
          <Text fontSize="sm">{ label }</Text>
        </HStack>
        <AtomUiAccordion>
          <AtomUiFirstPersonCamera />
          <AtomUiStructure />
          <AtomUiLights ambientAtom={ambientLightAtom} lightsAtom={pointLightsAtom} />
          <AtomUiDebug />
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
