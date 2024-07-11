import { Atom, Getter, atom } from 'jotai'
import { WebGpuContext } from '../lib/webgpu/webgpu-context'
import { LandscapeCompute, landscapeComputeAtom } from './landscape-compute'
import { LandscapeRender, landscapeRenderAtom } from './landscape-render'
import { webGpuContext } from './webgpu-context'

export interface Landscape {
  (): Promise<void>
}

/** A readonly atom that composites the compute and render shaders into a single callable function. */
export const landscape = makelandscape()

function makelandscape(): Atom<Landscape | null> {
  return atom(getlandscape)

  function getlandscape(get: Getter): Landscape | null {
    const context = get(webGpuContext)
    const compute = get(landscapeComputeAtom)
    const render = get(landscapeRenderAtom)

    return context && compute && render
      ? makelandscape({ compute, context, render })
      : null
  }

  interface Props {
    compute:     LandscapeCompute
    context:     WebGpuContext
    render:      LandscapeRender
  }


  function makelandscape(props: Props): Landscape {
    const { compute, context, render } = props
    const { device } = context

    return async function iterate(): Promise<void> {
      const encoder = device.createCommandEncoder()
      compute(encoder)
      render(encoder)
      device.queue.submit([encoder.finish()])

      // useLoop awaits this to ensure that requestAnimationFrame doesn't go faster than the GPU can handle.
      await device.queue.onSubmittedWorkDone()
    }
  }
}
