import { Atom, Getter, atom } from 'jotai'
import { atomEffect } from 'jotai-effect'
import { PAD } from '../lib/types'
import { BufferWithUpdate, createBufferWithUpdate } from '../lib/webgpu/create-buffer'
import { WebGpuContext } from '../lib/webgpu/webgpu-context'
import { cameraPositionAtom } from './camera'
import { separationAtom } from './debug'
import { layersVec3Atom } from './layers'
import { UNIFORM_FLOATS_PER_POINT_LIGHT, pointLightCountAtom, pointLightDataAtom } from './lights'
import { materialDataAtom } from './material'
import { perspectiveMatrixAtom } from './perspective'
import { renderTypeValueAtom } from './render-type'
import { scaleVec3Atom } from './scale'
import { webGpuContext } from './webgpu-context'

const UNIFORM_FLOATS_EXCLUDING_LIGHTS = 48 // @see landscape-render.wgsl

/** A readonly atom that maintains the render shaders' uniforms. */
export const landscapeRenderUniforms = makeRenderUniforms()

function makeRenderUniforms(): Atom<GPUBuffer | null> {
  const bufferWithUpdate = makeBufferWithUpdateAtom()
  const updateState = atomEffect(applyUpdate)

  return atom(getBuffer)

  function makeBufferWithUpdateAtom(): Atom<BufferWithUpdate | null> {
    return atom(init)

    function init(get: Getter): BufferWithUpdate | null {
      const context = get(webGpuContext)
      const pointLightCount = get(pointLightCountAtom)

      return context ? makeBuffer(context) : null

      function makeBuffer(context: WebGpuContext): BufferWithUpdate {
        const count = UNIFORM_FLOATS_EXCLUDING_LIGHTS + pointLightCount * UNIFORM_FLOATS_PER_POINT_LIGHT

        return createBufferWithUpdate({
          context,
          initial: new Float32Array(count),
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })
      }
    }
  }

  function getBuffer(get: Getter): GPUBuffer | null {
    get(updateState)

    const value = get(bufferWithUpdate)
    return value ? value[0] : null
  }

  function applyUpdate(get: Getter): void {
    const cameraPosition = get(cameraPositionAtom)
    const base = get(bufferWithUpdate)
    const perspectiveMatrix = get(perspectiveMatrixAtom)
    const layers = get(layersVec3Atom)
    const separation = get(separationAtom)
    const scale = get(scaleVec3Atom)
    const renderType = get(renderTypeValueAtom)
    const material = get(materialDataAtom)
    const lights = get(pointLightDataAtom)

    if (base) {
      const [, update] = base
      update(new Float32Array([
        ...cameraPosition, PAD,
        ...perspectiveMatrix,
        ...layers, separation,
        ...scale, renderType,
        ...material,
        ...lights,
      ]))
    }
  }
}
