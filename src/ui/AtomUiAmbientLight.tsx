import { Grid, GridItem, Text, useColorModeValue } from "@chakra-ui/react";
import { Getter, Setter, atom } from "jotai";
import { ReactNode, useMemo } from "react";
import { ReadWriteAtom } from "../lib/types";
import { AmbientLight } from "../state/lights";
import { AtomUiColor } from "./AtomUiColor";
import { AtomUiSlider } from "./AtomUiSlider";

interface Props {
  atom: ReadWriteAtom<AmbientLight>
}

export function AtomUiAmbientLight(props: Props): ReactNode {
  const { atom } = props

  const { color, intensity } = useMemo(() => deconstructLight(atom), [atom])
  const textColor = useColorModeValue('teal', 'lightseagreen')

  return (
    <GridItem colSpan={2}>
      <Text color={textColor} fontSize="sm">Ambient</Text>
      <Grid templateColumns="repeat(2, 1fr)">
        <AtomUiColor atom={color} label="Color" />
        <AtomUiSlider atom={intensity} label="Intensity" min={0} max={1} step={0.01} />
      </Grid>
    </GridItem>
  )
}

interface Atoms {
  color:     ReadWriteAtom<string>
  intensity: ReadWriteAtom<number>
}

function deconstructLight(sourceAtom: ReadWriteAtom<AmbientLight>): Atoms {
  return {
    color:     atom(getColor, setColor) as ReadWriteAtom<string>,
    intensity: atom(getIntensity, setIntensity) as ReadWriteAtom<number>,
  }

  function getColor(get: Getter): string {
    return get(sourceAtom).color
  }

  function setColor(get: Getter, set: Setter, value: string): void {
    const source = get(sourceAtom)
    set(sourceAtom, { ...source, color: value })
  }

  function getIntensity(get: Getter): number {
    return get(sourceAtom).intensity
  }

  function setIntensity(get: Getter, set: Setter, intensity: number): void {
    const source = get(sourceAtom)
    set(sourceAtom, { ...source, intensity })
  }
}
