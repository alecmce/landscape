import { AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Grid, Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import './atom-ui.css';

interface Props {
  name:     string
  children: ReactNode | ReactNode[]
}

export function AtomUiGroup(props: Props): ReactNode {
  const { name, children } = props

  return (
    <AccordionItem>
      <AccordionButton>
        <Text fontSize="sm">{ name }</Text>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel>
        <Grid templateColumns="repeat(2, 1fr)">
          { children }
        </Grid>
      </AccordionPanel>
    </AccordionItem>
  )
}
