import { Grid, GridItem, HStack, IconButton, Text, createIcon, useColorModeValue } from "@chakra-ui/react";
import { Getter, Setter, atom, useSetAtom } from "jotai";
import { ReactNode, useMemo } from "react";
import { ReadWriteAtom, XYZ } from "../lib/types";
import { Lights } from "../state/lights";
import { AtomUiColor } from "./AtomUiColor";
import { AtomUiSlider } from "./AtomUiSlider";
import { AtomUiXYZ } from "./AtomUiXYZ";

interface Props {
  atom: ReadWriteAtom<Lights>
  id:   string
}

const MinusIcon = createIcon({
  displayName: 'MinusIcon',
  viewBox:     '0 -960 960 960',
  path:        <path fill="currentColor" d="M200-440v-80h560v80H200Z"/>,
})


const LIGHT_POSITION_MIN = { x: -100, y: 0, z: -100 }
const LIGHT_POSITION_MAX = { x: 100, y: 100, z: 100 }

export function AtomUiPointLight(props: Props): ReactNode {
  const { atom, id } = props

  const setAtom = useSetAtom(atom)
  const { position, color, intensity } = useMemo(() => deconstructLight(atom, id), [atom, id])
  const textColor = useColorModeValue('teal', 'lightseagreen')

  return (
    <GridItem colSpan={2}>
      <HStack justifyContent="space-between">
      <Text color={textColor} fontSize="sm">{ id }</Text>
      <IconButton
        aria-label="remove"
        icon={<MinusIcon />}
        isRound
        onClick={onClick}
        size="xs"
        variant="solid"
      />
      </HStack>
      <Grid templateColumns="repeat(2, 1fr)">
        <AtomUiXYZ atom={position} label="Position" min={LIGHT_POSITION_MIN} max={LIGHT_POSITION_MAX} step={1} />
        <AtomUiColor atom={color} label="Color" />
        <AtomUiSlider atom={intensity} label="Intensity" min={0} max={1} step={0.01} />
      </Grid>
    </GridItem>
  )

  function onClick(): void {
    setAtom(previous => {
      const result = { ...previous }
      delete result[id]
      return result
    })
  }
}

interface Atoms {
  position:  ReadWriteAtom<XYZ>
  color:     ReadWriteAtom<string>
  intensity: ReadWriteAtom<number>
}

function deconstructLight(sourceAtom: ReadWriteAtom<Lights>, id: string): Atoms {
  return {
    position:  atom(getPosition, setPosition) as ReadWriteAtom<XYZ>,
    color:     atom(getColor, setColor) as ReadWriteAtom<string>,
    intensity: atom(getIntensity, setIntensity) as ReadWriteAtom<number>,
  }

  function getPosition(get: Getter): XYZ {
    return get(sourceAtom)[id].position
  }

  function setPosition(get: Getter, set: Setter, value: XYZ): void {
    const source = get(sourceAtom)
    set(sourceAtom, { ...source, [id]: { ...source[id], position: value } })
  }

  function getColor(get: Getter): string {
    return get(sourceAtom)[id].color
  }

  function setColor(get: Getter, set: Setter, value: string): void {
    const source = get(sourceAtom)
    set(sourceAtom, { ...source, [id]: { ...source[id], color: value } })
  }

  function getIntensity(get: Getter): number {
    return get(sourceAtom)[id].intensity
  }

  function setIntensity(get: Getter, set: Setter, value: number): void {
    const source = get(sourceAtom)
    set(sourceAtom, { ...source, [id]: { ...source[id], intensity: value } })
  }
}
