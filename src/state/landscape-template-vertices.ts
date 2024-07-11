import { Getter, atom } from "jotai"
import { WebGpuContext } from "../lib/webgpu/webgpu-context"
import { webGpuContext } from "./webgpu-context"

export const FLOATS_PER_TEMPLATE_VERTEX = 2

const SIDE_TRIANGLE_COUNT = 6
const TOP_AND_BOTTOM_TRIANGLE_COUNT = 5
const VERTICES_PER_SET = 6

const SIDE_VERTEX_COUNT = VERTICES_PER_SET * SIDE_TRIANGLE_COUNT
const TOP_AND_BOTTOM_VERTEX_COUNT = VERTICES_PER_SET * TOP_AND_BOTTOM_TRIANGLE_COUNT

export const TEMPLATE_VERTEX_COUNT = SIDE_VERTEX_COUNT + TOP_AND_BOTTOM_VERTEX_COUNT

export const landscapeVertexBuffer = atom(getBuffer)

function getBuffer(get: Getter): GPUBuffer | null {
  const context = get(webGpuContext)
  return context ? makeBuffer(context) : null
}

function makeBuffer(context: WebGpuContext): GPUBuffer {
  const { device } = context

  const vertexData = makeVertexData()
  const buffer = device.createBuffer({
    label: 'vertex buffer vertices',
    size:  vertexData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(buffer, 0, vertexData);
  return buffer
}

enum FACE {
  TOP         = 2,
  BOTTOM      = 1,
  SIDE        = 0,
  BOTTOM_SIDE = 3,
  TOP_SIDE    = 4,
}

/**
 * Vertex data specifies a structure of template "vertices" that encode a position using:
 * vec3({top: 1, bottom: 0}, {center: 0, edge: 1}, index: 0..11, {side face: 0, bottom face: 1, top face: 2}).
 */
function makeVertexData(): Float32Array {
  const vertices = new Float32Array(TEMPLATE_VERTEX_COUNT * FLOATS_PER_TEMPLATE_VERTEX)
  writeSideVertexData()
  writeTopAndBottomVertexData()
  return vertices

  function writeSideVertexData(): void {
    for (let i = 0; i < SIDE_TRIANGLE_COUNT; i++) {
      const j = 2 * i
      const k = j + 1

      vertices.set([
        [j, FACE.BOTTOM_SIDE], [j, FACE.TOP_SIDE],    [k, FACE.TOP_SIDE],
        [k, FACE.TOP_SIDE],    [k, FACE.BOTTOM_SIDE], [j, FACE.BOTTOM_SIDE],
      ].flat(), FLOATS_PER_TEMPLATE_VERTEX * VERTICES_PER_SET * i)
    }
  }

  function writeTopAndBottomVertexData(): void {
    for (let i = 0; i < TOP_AND_BOTTOM_TRIANGLE_COUNT; i++) {
      const j = 2 * i
      const k = j + 2
      vertices.set([
        [0, FACE.TOP],    [j, FACE.TOP],    [k, FACE.TOP],
        [0, FACE.BOTTOM], [j, FACE.BOTTOM], [k, FACE.BOTTOM],
      ].flat(), FLOATS_PER_TEMPLATE_VERTEX * (SIDE_VERTEX_COUNT + VERTICES_PER_SET * i))
    }
  }
}
