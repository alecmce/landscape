import chroma from "chroma-js";
import { Getter, atom } from "jotai";
import { WebGpuContext } from "../lib/webgpu/webgpu-context";
import { webGpuContext } from "./webgpu-context";


export const elevationColorsTextureAtom = atom(getTexture)

export interface TextureWithSampler {
  texture: GPUTexture
  sampler: GPUSampler
}

function getTexture(get: Getter): TextureWithSampler | null {
  const context = get(webGpuContext)

  return context ? makeElevationColorsTexture(context) : null
}

function makeElevationColorsTexture(context: WebGpuContext): TextureWithSampler {
  const { device } = context

  const texture = device.createTexture({
    size: [256, 1],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  })

  const scale = chroma.scale(['#ff0000', '#ff8800', '#ffee00', '#00ff00', '#1e90ff', '#0000cd', '#9900ff'])

  const textureData = new Uint8Array(256 * 4)
  for (let i = 0; i < 256; i++) {
    const color = scale(i / 255).rgb()
    textureData[i * 4 + 0] = color[0]
    textureData[i * 4 + 1] = color[1]
    textureData[i * 4 + 2] = color[2]
    textureData[i * 4 + 3] = 255
  }

  device.queue.writeTexture({ texture }, textureData, { bytesPerRow: 256 * 4 }, { width: 256, height: 1 })

  const sampler = device.createSampler()

  return { sampler, texture }
}
