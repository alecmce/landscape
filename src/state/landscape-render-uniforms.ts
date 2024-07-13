import { Atom, Getter, atom } from 'jotai'
import { atomEffect } from 'jotai-effect'
import { PAD } from '../lib/types'
import { BufferWithUpdate, createBufferWithUpdate } from '../lib/webgpu/create-buffer'
import { WebGpuContext } from '../lib/webgpu/webgpu-context'
import { separationAtom } from './debug'
import { firstPersonCameraPositionAtom } from './first-person-camera'
import { layersVec3Atom } from './layers'
import { UNIFORM_FLOATS_PER_POINT_LIGHT, lightDataAtom, pointLightCountAtom } from './lights'
import { perspectiveMatrixAtom } from './perspective'
import { renderTypeValueAtom } from './render-type'
import { scaleVec3Atom } from './scale'
import { terrainDataAtom } from './terrain'
import { webGpuContextAtom } from './webgpu-context'

const UNIFORM_FLOATS_EXCLUDING_LIGHTS = 40 // @see landscape-render.wgsl

/** A readonly atom that maintains the render shaders' uniforms. */
export const landscapeRenderUniforms = makeRenderUniforms()

function makeRenderUniforms(): Atom<GPUBuffer | null> {
  const bufferWithUpdate = makeBufferWithUpdateAtom()
  const updateState = atomEffect(applyUpdate)

  return atom(getBuffer)

  function makeBufferWithUpdateAtom(): Atom<BufferWithUpdate | null> {
    return atom(init)

    function init(get: Getter): BufferWithUpdate | null {
      const context = get(webGpuContextAtom)
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
    const cameraPosition = get(firstPersonCameraPositionAtom)
    const base = get(bufferWithUpdate)
    const perspectiveMatrix = get(perspectiveMatrixAtom)
    const layers = get(layersVec3Atom)
    const separation = get(separationAtom)
    const scale = get(scaleVec3Atom)
    const renderType = get(renderTypeValueAtom)
    const lights = get(lightDataAtom)
    const terrain = get(terrainDataAtom)

    if (base) {
      const [, update] = base
      update(new Float32Array([
        ...cameraPosition, PAD,
        ...perspectiveMatrix,
        ...layers, separation,
        ...scale, renderType,
        ...terrain,
        ...lights,
      ]))
    }
  }
}
