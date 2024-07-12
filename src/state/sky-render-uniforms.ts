import { Atom, Getter, atom } from 'jotai'
import { atomEffect } from 'jotai-effect'
import { getColorVec3 } from '../lib/color'
import { BufferWithUpdate, createBufferWithUpdate } from '../lib/webgpu/create-buffer'
import { WebGpuContext } from '../lib/webgpu/webgpu-context'
import { ambientLightAtom } from './lights'
import { inverseMatrixAtom } from './perspective'
import { webGpuContextAtom } from './webgpu-context'

const UNIFORM_FLOATS = 16 // @see sky-render.wgsl

/** A readonly atom that maintains the render shaders' uniforms. */
export const skyRenderUniformsAtom = makeRenderUniforms()

function makeRenderUniforms(): Atom<GPUBuffer | null> {
  const bufferWithUpdate = makeBufferWithUpdateAtom()
  const updateState = atomEffect(applyUpdate)

  return atom(getBuffer)

  function makeBufferWithUpdateAtom(): Atom<BufferWithUpdate | null> {
    return atom(init)

    function init(get: Getter): BufferWithUpdate | null {
      const context = get(webGpuContextAtom)

      return context ? makeBuffer(context) : null

      function makeBuffer(context: WebGpuContext): BufferWithUpdate {
        const count = UNIFORM_FLOATS

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
    const base = get(bufferWithUpdate)
    const matrix = get(inverseMatrixAtom)
    const ambient = get(ambientLightAtom)

    if (base) {
      const [, update] = base
      update(new Float32Array([
        ...getColorVec3(ambient.color), ambient.intensity,
        ...matrix,
      ]))
    }
  }
}
