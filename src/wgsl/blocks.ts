import { compileCode } from './compile'
import debugTerrain from './debug-terrain.wgsl?raw'
import landscapeCompute from './landscape-compute.wgsl?raw'
import landscapeRender from './landscape-render.wgsl?raw'
import landscapeShared from './landscape-shared.wgsl?raw'
import phongLighting from './phong-lighting.wgsl?raw'
import skyRender from './sky-render.wgsl?raw'
import terrain from './terrain.wgsl?raw'

export function getCode(id: string, replacements: Record<string, string> = {}): string {
  const entries = Object.entries(replacements)
  return entries.reduce(replace, compileCode({ blocks: CODE_BLOCKS, id }))

  function replace(code: string, [input, output]: [string, string]): string {
    return code.replace(input, output)
  }
}

const CODE_BLOCKS = [
  { id: 'debugLandscapeCompute', code: landscapeCompute, dependencies: ['landscapeShared', 'debugTerrain'] },
  { id: 'debugTerrain', code: debugTerrain, dependencies: [] },
  { id: 'landscapeCompute', code: landscapeCompute, dependencies: ['landscapeShared', 'terrain'] },
  { id: 'landscapeRender', code: landscapeRender, dependencies: ['landscapeShared', 'phongLighting'] },
  { id: 'landscapeShared', code: landscapeShared, dependencies: [] },
  { id: 'phongLighting', code: phongLighting, dependencies: [] },
  { id: 'skyRender', code: skyRender, dependencies: [] },
  { id: 'terrain', code: terrain, dependencies: [] },
];
