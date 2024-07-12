import { Button } from "@chakra-ui/react";
import { ReactNode } from "react";
import { integers } from "../lib/number";

interface Props {
  matchKey: (key: string) => boolean
}

export function AtomUiResetState(props: Props): ReactNode {
  const { matchKey } = props

  return (
    <Button size="xs" className="atom-ui-button" onClick={resetState}>Reset State</Button>
  )

  function resetState(): void {
    integers(0, localStorage.length)
      .map(getKey)
      .filter(matchKey)
      .forEach(removeKey)
    location.reload()
  }
}

function getKey(index: number): string {
  return localStorage.key(index) ?? ''
}

function removeKey(key: string): void {
  localStorage.removeItem(key)
}
