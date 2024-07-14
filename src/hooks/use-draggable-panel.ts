import { useEffect } from "react"
import { constrain } from "../lib/constrain"

interface Props {
  bounds?: HTMLElement | null
  subject: HTMLElement | null
  target:  HTMLElement | null
}

type Rect = Omit<DOMRectReadOnly, 'x' | 'y' | 'toJSON'>

export function useDraggablePanel(props: Props): void {
  const { subject, target, bounds } = props

  useEffect(() => {
    if (subject && target) {
      return mount(subject, target)
    }

    function mount(subject: HTMLElement, target: HTMLElement): VoidFunction {
      let down: PointerEvent | null = null
      let offsets: Constraints | null = null
      let prior: PriorTranslate | null = null

      target.addEventListener('pointerdown', onPointerDown)

      return function unmount(): void {
        target.removeEventListener('pointerdown', onPointerDown)
        window.removeEventListener('pointerup', onPointerUp)
        window.removeEventListener('pointermove', onPointerMove)
      }

      function onPointerDown(event: PointerEvent): void {
        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerup', onPointerUp)

        down = event
        offsets = getOffsetsFromSubjectAndBounds(subject, bounds)
        prior = getPriorTranslate(subject)
      }

      function onPointerMove(event: PointerEvent): void {
        const dx = constrain(event.clientX - down!.clientX, offsets!.dx) + prior!.dx
        const dy = constrain(event.clientY - down!.clientY, offsets!.dy) + prior!.dy
        subject.style.transform = `translate(${dx}px, ${dy}px)`
      }

      function onPointerUp(): void {
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)

        down = null
        offsets = null
        prior = null
      }
    }


  }, [subject, target, bounds])

}

function getOffsetsFromSubjectAndBounds(subject: HTMLElement, bounds?: HTMLElement | null): Constraints {
  const rect = subject.getBoundingClientRect()
  const container = bounds ? bounds.getBoundingClientRect() : getScreenBounds()
  return getOffsets(rect, container)
}

function getScreenBounds(): Rect {
  const width = window.innerWidth
  const height = window.innerHeight
  return { left: 0, top: 0, width, height, right: width, bottom: height }
}

interface Constraints {
  dx: Constraint
  dy: Constraint
}

interface Constraint {
  min: number
  max: number
}

function getOffsets(subject: Rect, container: Rect): Constraints {
  const dx = { min: container.left - subject.left, max: container.right - subject.right }
  const dy = { min: container.top - subject.top, max: container.bottom - subject.bottom }
  return { dx, dy }
}

interface PriorTranslate {
  dx: number
  dy: number
}

function getPriorTranslate(subject: HTMLElement): PriorTranslate {
  const transform = subject.style.transform.match(/translate\((.+)px,(.+)px\)/)
  return transform
    ? { dx: parseFloat(transform[1]), dy: parseFloat(transform[2]) }
    : { dx: 0, dy: 0 }
}
