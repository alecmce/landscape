import { GridItem, Input, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text } from '@chakra-ui/react';
import { WritableAtom, useAtom } from 'jotai';
import { ChangeEvent, KeyboardEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { isDefined } from '../lib/object';


interface Props {
  atom:       WritableAtom<number, [value: number], void>;
  disabled?:  boolean;
  label:      string
  max?:       number;
  min?:       number;
  step?:      number
  debug?:     true
  precision?: number
}

export function AtomUiSlider(props: Props): ReactNode {
  const { atom, disabled = false, label, min = 0, max = 100, precision, step } = props;

  const [value, setValue] = useAtom(atom)
  const [pending, setPending] = useState<string | undefined>(undefined)

  // This block makes the atom slider optimistic, to account for debouncing (like scale).
  const [inner, setInner] = useState(value)
  useEffect(() => {
    setInner(value)
  }, [value, setInner])

  const valuePrecision = useMemo(() => precision ?? (step ? getPrecision(step) : 2), [precision, step])
  const valueLabel = inner.toFixed(valuePrecision)

  return (
    <>
      <GridItem className="atom-ui-cell" colSpan={1}>
        <Text fontSize="sm">{ label }</Text>
      </GridItem>
      <GridItem className="atom-ui-cell atom-ui-control" colSpan={1}>
        <Input
          size="xs"
          width="5em"
          variant='unstyled'
          color={value === inner ? '' : 'tomato'}
          value={isDefined(pending) ? pending : valueLabel}
          type="number"
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
        />
        <Slider
          className="atom-ui-slider"
          value={inner}
          isDisabled={disabled}
          max={max}
          min={min}
          step={step}
          onChange={onSliderChange}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </GridItem>
    </>
  )

  function onSliderChange(value: number): void {
    setInner(value)
    setValue(value)
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>): void {
    setPending(event.target.value)
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') {
      const value = isDefined(pending) ? parseFloat(pending) : NaN
      if (!isNaN(value)) {
        setValue(value)
        setInner(value)
        setPending(undefined)
      }
    }
  }
}

function getPrecision(step: number): number {
  const string = step.toString()
  const decimalIndex = string.indexOf('.')
  return decimalIndex === -1 ? 0 : string.length - decimalIndex - 1
}
