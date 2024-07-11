import { Getter, atom } from 'jotai'
import { Vec3 } from 'wgpu-matrix'
import { BYTES_PER_FLOAT } from '../lib/types'
import { WebGpuContext } from '../lib/webgpu/webgpu-context'
import { getCode } from '../wgsl/blocks'
import { landscapeComputeBufferAtom } from './landscape-compute-buffer'
import { landscapeDepthTexture } from './landscape-depth-texture'
import { landscapeRenderUniforms } from './landscape-render-uniforms'
import { FLOATS_PER_TEMPLATE_VERTEX, TEMPLATE_VERTEX_COUNT, landscapeVertexBuffer } from './landscape-template-vertices'
import { layersVec3Atom } from './layers'
import { webGpuContext } from './webgpu-context'
import { TextureWithSampler, elevationColorsTextureAtom } from './elevation-colors'
import { pointLightCountAtom } from './lights'


export interface LandscapeRender {
  (encoder: GPUCommandEncoder): void,
}

/** A readonly atom that maintains the render shaders. */
export const landscapeRenderAtom = atom(getlandscapeRender)

function getlandscapeRender(get: Getter): LandscapeRender | null {
  const buffer = get(landscapeComputeBufferAtom)
  const context = get(webGpuContext)
  const uniforms = get(landscapeRenderUniforms)
  const depthTexture = get(landscapeDepthTexture)
  const vertexBuffer = get(landscapeVertexBuffer)
  const layers = get(layersVec3Atom)
  const elevationColors = get(elevationColorsTextureAtom)
  const lightCount = get(pointLightCountAtom)

  return buffer && context && uniforms && depthTexture && vertexBuffer && elevationColors
    ? makelandscapeRender({ buffer, context, depthTexture, uniforms, vertexBuffer, layers, elevationColors, lightCount })
    : null
}

interface Props {
  buffer:          GPUBuffer
  context:         WebGpuContext
  depthTexture:    GPUTexture
  uniforms:        GPUBuffer
  vertexBuffer:    GPUBuffer
  layers:          Vec3
  elevationColors: TextureWithSampler
  lightCount:      number
}

/** Constructs a render pipeline. */
function makelandscapeRender(props: Props): LandscapeRender {
  const { buffer, context, depthTexture, uniforms, vertexBuffer, layers, elevationColors, lightCount } = props;
  const { device, format, context: gpuContext } = context

  const module = makeModule()
  const layout = makeLayout()
  const pipeline = makePipeline()
  const group = makeGroup()

  return function render(encoder: GPUCommandEncoder): void {
    const instances = layers[0] * layers[1] * layers[2]

    const passEncoder = encoder.beginRenderPass({
      colorAttachments: [{
        clearValue: [0.0, 0.0, 0.0, 1.0],
        loadOp: 'clear',
        storeOp: 'store',
        view: gpuContext.getCurrentTexture().createView(),
      }],
      depthStencilAttachment: {
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
        view: depthTexture.createView(),
      },
      label: 'Landscape Render Pass',
    });

    passEncoder.setPipeline(pipeline);
    passEncoder.setVertexBuffer(0, vertexBuffer)
    passEncoder.setBindGroup(0, group);
    passEncoder.draw(TEMPLATE_VERTEX_COUNT, instances, 0, 0);
    passEncoder.end();
  }

  function makeModule(): GPUShaderModule {
    return device.createShaderModule({
      code:  getCode('landscapeRender', { ['${POINT_LIGHT_COUNT}']: `${lightCount}u` }),
      label: 'Landscape Render Module',
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
          visibility: GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX,
          buffer: { type: 'read-only-storage' },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          sampler: {},
        },
        {
          binding: 3,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          texture: {},
        }
      ],
      label: 'Landscape Render Bind Group Layout',
    })
  }

  function makePipeline(): GPURenderPipeline {
    const vertexBufferLayout: GPUVertexBufferLayout = {
      arrayStride: FLOATS_PER_TEMPLATE_VERTEX * BYTES_PER_FLOAT,
      attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }],
    }

    return device.createRenderPipeline({
      fragment:  { entryPoint: 'fs_main', module, targets: [{ format }] },
      layout:    device.createPipelineLayout({ bindGroupLayouts: [layout] }),
      primitive: { topology: 'triangle-list' },
      vertex:    { entryPoint: 'vs_main', module, buffers: [vertexBufferLayout] },
      depthStencil: { depthWriteEnabled: true, depthCompare: 'less', format: 'depth24plus' },
    })
  }

  function makeGroup(): GPUBindGroup {
    const { sampler, texture } = elevationColors

    return device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: uniforms } },
        { binding: 1, resource: { buffer } },
        { binding: 2, resource: sampler },
        { binding: 3, resource: texture.createView() },
      ],
      label: 'Landscape Render Bind Group',
    })
  }
}
