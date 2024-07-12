import chroma from "chroma-js";
import { Getter, atom } from "jotai";
import { TextureWithSampler } from "../lib/types";
import { WebGpuContext } from "../lib/webgpu/webgpu-context";
import { webGpuContextAtom } from "./webgpu-context";


export const elevationColorsTextureAtom = atom(getTexture)

function getTexture(get: Getter): TextureWithSampler | null {
  const context = get(webGpuContextAtom)

  return context ? makeElevationColorsTexture(context) : null
}

function makeElevationColorsTexture(context: WebGpuContext): TextureWithSampler {
  const { device } = context

  const texture = device.createTexture({
    size: [3, 256],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  })

  const ambientScale = chroma.scale([
    '#28441C','#0F5E00','#377E00','#378700','#9B8100','#FF7651',
    '#FF8E8F','#FF929E','#C58199','#AFAFAF','#F0F0F0',
  ])
  const diffuseScale = chroma.scale(['#441C3E', '#572143'])

  const textureData = new Uint8Array(256 * 3 * 4)
  for (let i = 0; i < 256; i++) {
    const ambientColor = ambientScale(i / 255).rgb()
    const diffuseColor = diffuseScale(i / 255).rgb()
    const specularColor = [255, 255, 255]

    textureData.set([
      ambientColor[0],  ambientColor[1],  ambientColor[2],  255,
      diffuseColor[0],  diffuseColor[1],  diffuseColor[2],  255,
      specularColor[0], specularColor[1], specularColor[2], 255,
    ], i * 3 * 4)
  }

  device.queue.writeTexture({ texture }, textureData, { bytesPerRow: 3 * 4 }, { width: 3, height: 256 })

  const sampler = device.createSampler()

  return { sampler, texture }
}
