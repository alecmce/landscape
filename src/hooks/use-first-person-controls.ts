import { useSetAtom } from "jotai"
import { useEffect } from "react"
import { deg2rad } from "../lib/math"
import { ReadWriteAtom } from "../lib/types"
import { FirstPersonInfo, FirstPersonRotation } from "../state/first-person-camera"

interface Props {
  canvas:      HTMLCanvasElement | null
  sensitivity: number
  sourceAtom:  ReadWriteAtom<FirstPersonInfo>
}

const ARROW_UP = 'ArrowUp'
const ARROW_DOWN = 'ArrowDown'
const HANDLED_KEYS = new Set<string>([ARROW_UP, ARROW_DOWN])

export function useFirstPersonControls(props: Props): void {
  const { canvas, sensitivity, sourceAtom } = props

  const setInfo = useSetAtom(sourceAtom)

  useEffect(() => {
    let down: PointerEvent | null = null
    let cached: FirstPersonRotation | null = null
    let requestId: number | null = null

    const keys = new Set<string>()

    canvas?.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return function unmount(): void {
      canvas?.removeEventListener('pointerdown', onPointerDown)
      canvas?.removeEventListener('pointermove', onPointerMove)
      canvas?.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }

    function onPointerDown(event: PointerEvent): void {
      down = event // Write the current pointer event into local state.

      setInfo(value => {
        cached = value // Write the current value into local state.
        return value
      })

      canvas!.addEventListener('pointermove', onPointerMove)
      canvas!.addEventListener('pointerup', onPointerUp)
    }

    function onPointerMove(event: PointerEvent): void {
      setInfo(update)

      function update(value: FirstPersonInfo): FirstPersonInfo {
        if (cached && down) {
          const dPitch = (event.clientY - down.clientY) / sensitivity
          const dYaw = (down.clientX - event.clientX) / sensitivity
          return { ...value, yaw:  cached.yaw - dYaw, pitch: cached.pitch + dPitch }
        } else {
          return value
        }
      }
    }

    function onPointerUp(): void {
      down = null
      cached = null

      canvas!.removeEventListener('pointermove', onPointerMove)
      canvas!.removeEventListener('pointerup', onPointerUp)
    }

    function onKeyDown(event: KeyboardEvent): void {
      if (HANDLED_KEYS.has(event.key)) {
        keys.add(event.key)
        requestId = requestAnimationFrame(iterate)
      }
    }

    function onKeyUp(event: KeyboardEvent): void {
      keys.delete(event.key)
      if (keys.size === 0) {
        cancelAnimationFrame(requestId!)
      }
    }

    function iterate(): void {
      if (keys.has(ARROW_UP)) {
        setInfo(walkForwards)
      } else if (keys.has(ARROW_DOWN)) {
        setInfo(walkBackwards)
      }

      requestId = requestAnimationFrame(iterate)
    }

    function walkForwards(value: FirstPersonInfo): FirstPersonInfo {
      return walk(value, 1)
    }

    function walkBackwards(value: FirstPersonInfo): FirstPersonInfo {
      return walk(value, -1)
    }

    function walk(value: FirstPersonInfo, direction: number): FirstPersonInfo {
      const angle = deg2rad(-value.yaw)
      const dx = Math.sin(angle) * 0.1 * direction
      const dz = -Math.cos(angle) * 0.1 * direction
      return { ...value, x: value.x + dx, z: value.z + dz }
    }
  }, [canvas, sensitivity])
}
