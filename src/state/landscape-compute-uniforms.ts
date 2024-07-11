import { Atom, Getter, atom } from "jotai";
import { atomEffect } from "jotai-effect";
import { PAD } from "../lib/types";
import { BufferWithUpdate, createBufferWithUpdate } from "../lib/webgpu/create-buffer";
import { WebGpuContext } from "../lib/webgpu/webgpu-context";
import { layersVec3Atom } from "./layers";
import { terrainDataAtom } from "./terrain";
import { webGpuContext } from "./webgpu-context";


/** A readonly atom that maintains the compute shader's uniforms. */
export const landscapeComputeUniforms = makeComputeUniforms()

function makeComputeUniforms(): Atom<GPUBuffer | null> {
  const bufferWithUpdate = makeBufferWithUpdateAtom()
  const updateState = updateBufferAtom()

  return makeBufferAtom(updateState)

  function makeBufferWithUpdateAtom(): Atom<BufferWithUpdate | null> {
    return atom(init)

    function init(get: Getter): BufferWithUpdate | null {
      const context = get(webGpuContext)
      return context ? makeBuffer(context) : null

      function makeBuffer(context: WebGpuContext): BufferWithUpdate {
        return createBufferWithUpdate({
          context,
          initial: new Float32Array([0, 0, 0, 0]),
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })
      }
    }
  }

  function makeBufferAtom(updateState: Atom<void>): Atom<GPUBuffer | null> {
    return atom(getBuffer)

    function getBuffer(get: Getter): GPUBuffer | null {
      get(updateState)

      const value = get(bufferWithUpdate)
      return value ? value[0] : null
    }
  }

  function updateBufferAtom(): Atom<void | Promise<void>> {
    return atomEffect(apply)

    function apply(get: Getter): void {
      const base = get(bufferWithUpdate)
      const layers = get(layersVec3Atom)
      const terrain = get(terrainDataAtom)

      if (base) {
        const [, update] = base
        update(new Float32Array([...layers, PAD, ...terrain]))
      }
    }
  }
}
