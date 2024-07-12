import { Atom, Getter, atom } from "jotai";
import { WebGpuContext } from "../lib/webgpu/webgpu-context";
import { webGpuContextAtom } from "./webgpu-context";
import { Size, windowSize } from "./window-size";


/**
 * A readonly atom that generates a depth buffer the size of the window.
 *
 * TODO: Previously generated buffers are not being destroyed when this is recalculated.
 */
export const landscapeDepthTexture = makeDepthTextureAtom()

function makeDepthTextureAtom(): Atom<GPUTexture | null> {
  return atom(getBuffers)

  function getBuffers(get: Getter): GPUTexture | null {
    const context = get(webGpuContextAtom)
    const size = get(windowSize)
    return context ? makeDepthTexture({ context, size }) : null
  }
}

interface Props {
  context: WebGpuContext
  size:    Size
}

function makeDepthTexture(props: Props): GPUTexture {
  const { context, size } = props
  const { device } = context

  return device.createTexture({
    size: [size.width, size.height],
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
}
