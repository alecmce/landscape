import { Getter, atom } from "jotai"
import { WebGpuContext } from "../lib/webgpu/webgpu-context"
import { layersDataSize } from "./layers"
import { webGpuContext } from "./webgpu-context"


export const landscapeComputeBufferAtom = atom(getLandscapeComputeBuffer)

function getLandscapeComputeBuffer(get: Getter): GPUBuffer | null {
  const context = get(webGpuContext)
  const size = get(layersDataSize)

  return context ? makeLandscapeComputeBuffer({ context, size }) : null
}

interface Props {
  context: WebGpuContext
  size:    number
}

function makeLandscapeComputeBuffer(props: Props): GPUBuffer {
  const { context, size: requiredSize } = props
  const { adapter, device } = context

  const usage = GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE
  const minSize = adapter.limits.minUniformBufferOffsetAlignment
  const size = Math.ceil(requiredSize / minSize) * minSize
  return device.createBuffer({ label: 'Landscape Compute Buffer', size, usage });
}
