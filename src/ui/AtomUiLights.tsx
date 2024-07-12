import { useAtomValue } from "jotai";
import { ReactNode } from "react";
import { ReadWriteAtom } from "../lib/types";
import { AmbientLight, Lights } from "../state/lights";
import { AtomUiGroup } from "./AtomUIGroup";
import { AtomUiAmbientLight } from "./AtomUiAmbientLight";
import { AtomUiPointLight } from "./AtomUiPointLight";

interface Props {
  ambientAtom: ReadWriteAtom<AmbientLight>
  lightsAtom: ReadWriteAtom<Lights>
}

export function AtomUiLights(props: Props): ReactNode {
  const { ambientAtom, lightsAtom } = props

  const lights = useAtomValue(lightsAtom)

  return (
    <AtomUiGroup name="Lights">
      <AtomUiAmbientLight atom={ambientAtom} />
      { Object.keys(lights).map(key => <AtomUiPointLight key={key} atom={lightsAtom} id={key} />) }
    </AtomUiGroup>
  )
}
