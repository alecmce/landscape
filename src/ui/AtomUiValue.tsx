import { GridItem, Text } from '@chakra-ui/react';
import { Atom, useAtomValue } from 'jotai';
import { ReactNode } from 'react';
import { isNumber } from '../lib/object';


interface Props {
  atom:  Atom<number | string | boolean>
  label: string
}

export function AtomUiValue(props: Props): ReactNode {
  const { atom, label } = props;

  const value = useAtomValue(atom)
  const simplified = isNumber(value)  ? value.toFixed(2) : value

  return (
    <>
      <GridItem className="atom-ui-cell" colSpan={1}>
        <Text fontSize="sm">{ label }</Text>
      </GridItem>
      <GridItem className="atom-ui-cell atom-ui-control" colSpan={1}>
        <Text fontSize="sm">{ simplified }</Text>
      </GridItem>
    </>
  )
}
