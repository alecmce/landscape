import { Atom, Getter, atom } from 'jotai'
import { WebGpuContext } from '../lib/webgpu/webgpu-context'
import { LandscapeCompute, landscapeComputeAtom } from './landscape-compute'
import { LandscapeRender, landscapeRenderAtom } from './landscape-render'
import { webGpuContextAtom } from './webgpu-context'
import { SkyRender, skyRenderAtom } from './sky-render'

export interface Landscape {
  (): Promise<void>
}

/** A readonly atom that composites the compute and render shaders into a single callable function. */
export const landscape = makelandscape()

function makelandscape(): Atom<Landscape | null> {
  return atom(getlandscape)

  function getlandscape(get: Getter): Landscape | null {
    const context = get(webGpuContextAtom)
    const compute = get(landscapeComputeAtom)
    const renderLandscape = get(landscapeRenderAtom)
    const renderSky = get(skyRenderAtom)

    return context && compute && renderLandscape && renderSky
      ? makelandscape({ compute, context, renderLandscape, renderSky })
      : null
  }

  interface Props {
    compute:         LandscapeCompute
    context:         WebGpuContext
    renderLandscape: LandscapeRender
    renderSky:       SkyRender
  }


  function makelandscape(props: Props): Landscape {
    const { compute, context, renderLandscape, renderSky } = props
    const { device } = context

    return async function iterate(): Promise<void> {
      const encoder = device.createCommandEncoder()
      compute(encoder)
      renderSky(encoder)
      renderLandscape(encoder)
      device.queue.submit([encoder.finish()])

      // useLoop awaits this to ensure that requestAnimationFrame doesn't go faster than the GPU can handle.
      await device.queue.onSubmittedWorkDone()
    }
  }
}
