import chroma from "chroma-js";
import { Getter, atom } from "jotai";
import { TextureWithSampler } from "../lib/types";
import { WebGpuContext } from "../lib/webgpu/webgpu-context";
import { webGpuContextAtom } from "./webgpu-context";


export const skyColorsTextureAtom = atom(getTexture)

function getTexture(get: Getter): TextureWithSampler | null {
  const context = get(webGpuContextAtom)

  return context ? makeSkyColorsTexture(context) : null
}

function makeSkyColorsTexture(context: WebGpuContext): TextureWithSampler {
  const { device } = context

  const texture = device.createTexture({
    size: [1, 256],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  })

  const scale = chroma.scale(['#F6E7D5', '#6BA3FF']).domain([0, 0.3])

  const textureData = new Uint8Array(256 * 3 * 4)
  for (let i = 0; i < 256; i++) {
    const color = scale(i / 255).rgb()

    textureData.set([color[0],  color[1],  color[2],  255], i * 4)
  }

  device.queue.writeTexture({ texture }, textureData, { bytesPerRow: 4 }, { width: 1, height: 256 })

  const sampler = device.createSampler()

  return { sampler, texture }
}
