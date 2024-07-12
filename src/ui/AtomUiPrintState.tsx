import { Button } from "@chakra-ui/react";
import { ReactNode } from "react";
import { integers } from "../lib/number";

interface Props {
  matchKey: (key: string) => boolean
}

export function AtomUiPrintState(props: Props): ReactNode {
  const { matchKey } = props

  return (
    <Button size="xs" className="atom-ui-button" onClick={printState}>Print State</Button>
  )

  function printState(): void {
    const lines = integers(0, localStorage.length)
      .map(getKey)
      .filter(matchKey)
      .map(toLine)
    lines.length
      ? console.log(lines.join('\n'))
      : console.log('State does not vary from default')
  }
}

function getKey(index: number): string {
  return localStorage.key(index) ?? ''
}

function toLine(key: string): string {
  return `${key}: ${localStorage.getItem(key)}`
}
