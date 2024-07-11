import { Vec2, vec2 } from "wgpu-matrix"

interface XY {
  x: number
  y: number
}

export interface Grid {
  width: number
  height: number
}

/** Given a 2D grid of values stored in a single-dimension array, get the index of a value. */
export function getCellIndex(grid: Grid, xy: Vec2): number {
  const { width, height } = grid
  const x = positiveMod(xy[0], width)
  const y = positiveMod(xy[1], height)
  return x + y * width
}

function positiveMod(n: number, modulo: number): number {
  return (n % modulo + modulo) % modulo;
}

/** Given a 2D grid of values stored in a single-dimension array, get the cordinates of a value at an index. */
export function getCellCoordinates(grid: Grid, index: number): XY {
  const { width } = grid
  const x = index % width
  const y = Math.floor(index / width)
  return { x, y }
}

export enum ORIENTATION {
  HORIZONTAL = 'horizontal',
  VERTICAL   = 'vertical',
}

/**
 * Given a 2D grid of values stored in a single-dimension array, get the index of an edge where each cell has an edge
 * to the right, and an edge below. The edges to the right of the right-most column and below the bottom row are
 * included for symmetry, but should be ignored.
 */
export function getEdgeIndex(grid: Grid, xy: Vec2, orientation: ORIENTATION): number {
  const { width, height } = grid
  const xx = 2 * positiveMod(xy[0], width + 1)
  const yy = 2 * positiveMod(xy[1], height + 1)
  const offset = orientation === ORIENTATION.HORIZONTAL ? 0 : 1
  return xx + yy * width + offset
}

/** Given a 2D grid of values stored in a single-dimension array, get the cordinates of an edge at an index. */
export function getEdgeCoordinates(grid: Grid, index: number, orientation: ORIENTATION): Vec2 {
  const { width } = grid
  const i = (index - (orientation === ORIENTATION.HORIZONTAL ? 0 : 1)) / 2
  const x = i % width
  const y = Math.floor(i / width)
  return vec2.create(x, y)
}
