import { Button, Center, GridItem, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Text } from "@chakra-ui/react";
import { contrast } from "chroma-js";
import { useAtom } from "jotai";
import { ReactNode, useMemo } from "react";
import { HexColorPicker } from "react-colorful";
import { ReadWriteAtom } from "../lib/types";
import './atom-ui-color.css';

interface Props {
  atom:  ReadWriteAtom<string>
  label: string
}

const WHITE = 'white'
const BLACK = 'black'

export function AtomUiColor(props: Props): ReactNode {
  const { atom, label } = props

  const [color, setColor] = useAtom(atom)
  const textColor = useMemo(() => contrast(color, WHITE) > 4.5 ? WHITE : BLACK, [color])

  return (
    <>
      <GridItem className="atom-ui-cell" colSpan={1}>
        <Text fontSize="sm">{ label }</Text>
      </GridItem>
      <GridItem className="atom-ui-cell atom-ui-control" colSpan={1}>
        <Popover trigger="click">
          <PopoverTrigger>
            <Button
              aria-label={color}
              background={color}
              height="0.875rem"
              width="0.875rem"
              padding={0}
              minWidth="unset"
            />
          </PopoverTrigger>
          {/* <Text fontSize="sm">{ color }</Text> */}
          <PopoverContent className="atom-ui-color-picker" zIndex={1000}>
            <PopoverArrow bg={color} />
            <PopoverCloseButton color={textColor} />
            <PopoverHeader
              backgroundColor={color}
              borderTopLeftRadius={5}
              borderTopRightRadius={5}
              color={textColor}
              height="40px"
            >
              <Center height="100%">{ color }</Center>
            </PopoverHeader>
            <PopoverBody>
              <HexColorPicker color={color} onChange={setColor} />
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </GridItem>
    </>
  )
}
