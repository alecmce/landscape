import { Accordion } from "@chakra-ui/react";
import { Getter, Setter, atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { ReactNode } from "react";
import { isArray } from "../lib/object";

interface Props {
  allowMultiple?: boolean
  children: ReactNode | ReactNode[]
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


export function AtomUiAccordion(props: Props): ReactNode {
  const { allowMultiple, children } = props

  const [groupArray, setGroupArray] = useAtom(groupArrayAtom)

  return (
    <Accordion allowMultiple={allowMultiple} index={groupArray} onChange={onGroupChange}>
      { children }
    </Accordion>
  )

  function onGroupChange(expanded: number | number[]): void {
    setGroupArray(isArray(expanded) ? expanded : [expanded])
  }
}

