import { Getter, atom } from 'jotai'
import { TextureWithSampler } from '../lib/types'
import { WebGpuContext } from '../lib/webgpu/webgpu-context'
import { getCode } from '../wgsl/blocks'
import { skyColorsTextureAtom } from './sky-colors'
import { skyRenderUniformsAtom } from './sky-render-uniforms'
import { webGpuContextAtom } from './webgpu-context'


export interface SkyRender {
  (encoder: GPUCommandEncoder): void,
}

/** A readonly atom that maintains the render shaders. */
export const skyRenderAtom = atom(getlandscapeRender)

function getlandscapeRender(get: Getter): SkyRender | null {
  const context = get(webGpuContextAtom)
  const uniforms = get(skyRenderUniformsAtom)
  const skyColors = get(skyColorsTextureAtom)

  return context && uniforms && skyColors
    ? makeSkyRender({ context, uniforms, skyColors })
    : null
}

interface Props {
  context:         WebGpuContext
  uniforms:        GPUBuffer
  skyColors:       TextureWithSampler
}

/** Constructs a render pipeline. */
function makeSkyRender(props: Props): SkyRender {
  const {  context, uniforms, skyColors } = props;
  const { device, format, context: gpuContext } = context

  const module = makeModule()
  const layout = makeLayout()
  const pipeline = makePipeline()
  const group = makeGroup()

  return function render(encoder: GPUCommandEncoder): void {
    const passEncoder = encoder.beginRenderPass({
      colorAttachments: [{
        clearValue: [0.0, 0.0, 0.0, 1.0],
        loadOp: 'clear',
        storeOp: 'store',
        view: gpuContext.getCurrentTexture().createView(),
      }],
      label: 'Sky Render Pass',
    });

    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, group);
    passEncoder.draw(3, 1, 0, 0);
    passEncoder.end();
  }

  function makeModule(): GPUShaderModule {
    return device.createShaderModule({
      code:  getCode('skyRender'),
      label: 'Sky Render Module',
    })
  }

  function makeLayout(): GPUBindGroupLayout {
    return device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          sampler: {},
        },
        {
          binding: 2,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          texture: {},
        }
      ],
      label: 'Sky Render Bind Group Layout',
    })
  }

  function makePipeline(): GPURenderPipeline {
    return device.createRenderPipeline({
      fragment:  { entryPoint: 'fs_main', module, targets: [{ format }] },
      layout:    device.createPipelineLayout({ bindGroupLayouts: [layout] }),
      primitive: { topology: 'triangle-list' },
      vertex:    { entryPoint: 'vs_main', module },
    })
  }

  function makeGroup(): GPUBindGroup {
    const { sampler, texture } = skyColors

    return device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: uniforms } },
        { binding: 1, resource: sampler },
        { binding: 2, resource: texture.createView() },
      ],
      label: 'Landscape Render Bind Group',
    })
  }
}
