import { Getter, atom } from "jotai";
import { WebGpuContext } from "../lib/webgpu/webgpu-context";
import { Workgroups } from "../lib/webgpu/workgroups";
import { getCode } from "../wgsl/blocks";
import { landscapeComputeBufferAtom } from "./landscape-compute-buffer";
import { landscapeComputeUniforms } from "./landscape-compute-uniforms";
import { webGpuContextAtom } from "./webgpu-context";
import { workgroupsAtom } from "./workgroups";

export interface LandscapeCompute {
  (encoder: GPUCommandEncoder): void
}

/** A readonly atom that maintains the compute shaders. */
export const landscapeComputeAtom = atom(getLandscapeCompute)

function getLandscapeCompute(get: Getter): LandscapeCompute | null {
  const buffer = get(landscapeComputeBufferAtom)
  const context = get(webGpuContextAtom)
  const uniforms = get(landscapeComputeUniforms)
  const workgroups = get(workgroupsAtom)

  return buffer && context && uniforms
    ? makeCompute({ buffer, context, uniforms, workgroups })
    : null
}

interface Props {
  buffer:     GPUBuffer
  context:    WebGpuContext
  uniforms:   GPUBuffer
  workgroups: Workgroups
}

/** Constructs the compute pipeline */
function makeCompute(props: Props): LandscapeCompute {
  const { buffer, context, uniforms, workgroups } = props
  const { device } = context

  const { workgroupCounts } = workgroups
  const [workgroupCountX, workgroupCountY, workgroupCountZ] = workgroupCounts

  const module = makeModule()
  const pipeline = makePipeline()
  const group = makeGroup()

  return function compute(encoder: GPUCommandEncoder): void {
    const passEncoder = encoder.beginComputePass({});
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, group);
    passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY, workgroupCountZ);
    passEncoder.end();
  }

  function makeModule(): GPUShaderModule {
    return device.createShaderModule({
      code:  getCode('landscapeCompute'),
      label: 'Landscape Compute Module',
    })
  }

  function makePipeline(): GPUComputePipeline {
    const { threadsPerWorkgroup } = workgroups
    const [workgroupThreadsX, workgroupThreadsY, workgroupThreadsZ] = threadsPerWorkgroup

    return device.createComputePipeline({
      compute: {
        module,
        constants: { workgroupThreadsX, workgroupThreadsY, workgroupThreadsZ },
      },
      layout: 'auto',
      label:  'Landscape Compute Pipeline',
    })
  }

  function makeGroup(): GPUBindGroup {
    return device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: uniforms } },
        { binding: 1, resource: { buffer } },
      ],
      label: 'Landscape Compute Bind Group',
    })
  }
}
