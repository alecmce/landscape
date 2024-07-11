import { useSetAtom } from "jotai"
import { useEffect } from "react"
import { SphericalCoords, SphericalCoordsAtom, UpdateAtom } from "../lib/types"
import { SetAtom } from "../types"

interface Props {
  canvas:      HTMLCanvasElement | null
  cameraAtom:  SphericalCoordsAtom | null
  lightAtom?:  SphericalCoordsAtom
  sensitivity: number
}

export function useOrbitControls(props: Props): void {
  const { cameraAtom, canvas, lightAtom, sensitivity } = props

  const setCameraValue = cameraAtom ? useSetAtom(cameraAtom) : null
  const setLightValue = lightAtom ? useSetAtom(lightAtom) : null

  useEffect(() => {
    let shift = false
    let target: SetAtom<[valueOrUpdate: SphericalCoords | UpdateAtom<SphericalCoords>], void> | null = null
    let down: PointerEvent | null = null
    let cached: SphericalCoords | null = null

    canvas?.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return function unmount(): void {
      canvas?.removeEventListener('pointerdown', onPointerDown)
      canvas?.removeEventListener('pointermove', onPointerMove)
      canvas?.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }

    function onPointerDown(event: PointerEvent): void {
      down = event // Write the current pointer event into local state.

      const currentTarget = shift && setLightValue ? setLightValue : setCameraValue
      target = currentTarget
      currentTarget?.(value => {
        cached = value // Write the current value into local state.
        return value
      })

      canvas!.addEventListener('pointermove', onPointerMove)
      canvas!.addEventListener('pointerup', onPointerUp)
    }

    function onPointerMove(event: PointerEvent): void {
      const currentTarget = target
      if (currentTarget) {
        currentTarget(update)
      }

      function update(value: SphericalCoords): SphericalCoords {
        if (cached && down) {
          const dElevation = (event.clientY - down.clientY) / sensitivity
          const dAzithmul = (down.clientX - event.clientX) / sensitivity
          return {
            azithmulDegrees:  cached.azithmulDegrees - dAzithmul,
            elevationDegrees: cached.elevationDegrees + dElevation,
            radius:           cached.radius,
           }
        } else {
          return value
        }
      }
    }

    function onPointerUp(): void {
      down = null
      target = null
      cached = null

      canvas!.removeEventListener('pointermove', onPointerMove)
      canvas!.removeEventListener('pointerup', onPointerUp)
    }

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Shift') {
        shift = true
      }
    }

    function onKeyUp(event: KeyboardEvent): void {
      if (event.key === 'Shift') {
        shift = false
      }
    }

    function onWheel(event: WheelEvent): void {
      event.stopImmediatePropagation()
      event.preventDefault()

      const currentTarget = shift && setLightValue ? setLightValue : setCameraValue
      if (currentTarget) {
        currentTarget(update)
      }

      function update(value: SphericalCoords): SphericalCoords {
        const dRadius = (event.deltaY) / sensitivity
        const radius = value.radius + dRadius
        return { ...value, radius }
      }
    }
  }, [canvas, sensitivity])
}
