import { beforeEach, describe, expect, it } from "vitest";
import { Grid, ORIENTATION, getCellCoordinates, getCellIndex, getEdgeCoordinates, getEdgeIndex } from "./edges";
import { vec2 } from "wgpu-matrix";

describe('edges', () => {
  let grid: Grid
  beforeEach(() => {
    grid = { width: 4, height: 3 }
  })

  describe('getCellIndex', () => {
    it('returns cell indices from x,y coordinatse', () => {
      expect(getCellIndex(grid, vec2.create(0,0))).toBe(0)
      expect(getCellIndex(grid, vec2.create(1,0))).toBe(1)
      expect(getCellIndex(grid, vec2.create(2,0))).toBe(2)
      expect(getCellIndex(grid, vec2.create(3,0))).toBe(3)
      expect(getCellIndex(grid, vec2.create(0,1))).toBe(4)
      expect(getCellIndex(grid, vec2.create(1,1))).toBe(5)
      expect(getCellIndex(grid, vec2.create(2,1))).toBe(6)
      expect(getCellIndex(grid, vec2.create(3,1))).toBe(7)
      expect(getCellIndex(grid, vec2.create(0,2))).toBe(8)
      expect(getCellIndex(grid, vec2.create(1,2))).toBe(9)
      expect(getCellIndex(grid, vec2.create(2,2))).toBe(10)
      expect(getCellIndex(grid, vec2.create(3,2))).toBe(11)
    })
  })

  describe('getCellCoordinates', () => {
      it('returns x,y coordinates from cell indices', () => {
        expect(getCellCoordinates(grid, 0)).toEqual(vec2.create(0,0))
        expect(getCellCoordinates(grid, 1)).toEqual(vec2.create(1,0))
        expect(getCellCoordinates(grid, 2)).toEqual(vec2.create(2,0))
        expect(getCellCoordinates(grid, 3)).toEqual(vec2.create(3,0))
        expect(getCellCoordinates(grid, 4)).toEqual(vec2.create(0,1))
        expect(getCellCoordinates(grid, 5)).toEqual(vec2.create(1,1))
        expect(getCellCoordinates(grid, 6)).toEqual(vec2.create(2,1))
        expect(getCellCoordinates(grid, 7)).toEqual(vec2.create(3,1))
        expect(getCellCoordinates(grid, 8)).toEqual(vec2.create(0,2))
        expect(getCellCoordinates(grid, 9)).toEqual(vec2.create(1,2))
        expect(getCellCoordinates(grid, 10)).toEqual(vec2.create(2,2))
        expect(getCellCoordinates(grid, 11)).toEqual(vec2.create(3,2))
      })
  })

  describe('getEdgeIndex', () => {
    it('returns edge indices from x,y coordinates in a pattern', () => {
      expect(getEdgeIndex(grid, vec2.create(0,0), ORIENTATION.HORIZONTAL)).toBe(0)
      expect(getEdgeIndex(grid, vec2.create(0,0), ORIENTATION.VERTICAL)).toBe(1)
      expect(getEdgeIndex(grid, vec2.create(1,0), ORIENTATION.HORIZONTAL)).toBe(2)
      expect(getEdgeIndex(grid, vec2.create(1,0), ORIENTATION.VERTICAL)).toBe(3)
      expect(getEdgeIndex(grid, vec2.create(2,0), ORIENTATION.HORIZONTAL)).toBe(4)
      expect(getEdgeIndex(grid, vec2.create(2,0), ORIENTATION.VERTICAL)).toBe(5)
      expect(getEdgeIndex(grid, vec2.create(3,0), ORIENTATION.VERTICAL)).toBe(7)

      expect(getEdgeIndex(grid, vec2.create(0,1), ORIENTATION.HORIZONTAL)).toBe(8)
      expect(getEdgeIndex(grid, vec2.create(0,1), ORIENTATION.VERTICAL)).toBe(9)
      expect(getEdgeIndex(grid, vec2.create(1,1), ORIENTATION.HORIZONTAL)).toBe(10)
      expect(getEdgeIndex(grid, vec2.create(1,1), ORIENTATION.VERTICAL)).toBe(11)
      expect(getEdgeIndex(grid, vec2.create(2,1), ORIENTATION.HORIZONTAL)).toBe(12)
      expect(getEdgeIndex(grid, vec2.create(2,1), ORIENTATION.VERTICAL)).toBe(13)
      expect(getEdgeIndex(grid, vec2.create(3,1), ORIENTATION.VERTICAL)).toBe(15)

      expect(getEdgeIndex(grid, vec2.create(0,2), ORIENTATION.HORIZONTAL)).toBe(16)
      expect(getEdgeIndex(grid, vec2.create(1,2), ORIENTATION.HORIZONTAL)).toBe(18)
      expect(getEdgeIndex(grid, vec2.create(2,2), ORIENTATION.HORIZONTAL)).toBe(20)
    })
  })

  describe('getEdgeCoordinaes', () => {
    it('returns x,y coordinates from edge indices in a pattern', () => {
      expect(getEdgeCoordinates(grid, 0, ORIENTATION.HORIZONTAL)).toEqual(vec2.create(0,0))
      expect(getEdgeCoordinates(grid, 1, ORIENTATION.VERTICAL)).toEqual(vec2.create(0,0))
      expect(getEdgeCoordinates(grid, 2, ORIENTATION.HORIZONTAL)).toEqual(vec2.create(1,0))
      expect(getEdgeCoordinates(grid, 3, ORIENTATION.VERTICAL)).toEqual(vec2.create(1,0))
      expect(getEdgeCoordinates(grid, 4, ORIENTATION.HORIZONTAL)).toEqual(vec2.create(2,0))
      expect(getEdgeCoordinates(grid, 5, ORIENTATION.VERTICAL)).toEqual(vec2.create(2,0))
      expect(getEdgeCoordinates(grid, 7, ORIENTATION.VERTICAL)).toEqual(vec2.create(3,0))

      expect(getEdgeCoordinates(grid, 8, ORIENTATION.HORIZONTAL)).toEqual(vec2.create(0,1))
      expect(getEdgeCoordinates(grid, 9, ORIENTATION.VERTICAL)).toEqual(vec2.create(0,1))
      expect(getEdgeCoordinates(grid, 10, ORIENTATION.HORIZONTAL)).toEqual(vec2.create(1,1))
      expect(getEdgeCoordinates(grid, 11, ORIENTATION.VERTICAL)).toEqual(vec2.create(1,1))
      expect(getEdgeCoordinates(grid, 12, ORIENTATION.HORIZONTAL)).toEqual(vec2.create(2,1))
      expect(getEdgeCoordinates(grid, 13, ORIENTATION.VERTICAL)).toEqual(vec2.create(2,1))
      expect(getEdgeCoordinates(grid, 15, ORIENTATION.VERTICAL)).toEqual(vec2.create(3,1))

      expect(getEdgeCoordinates(grid, 16, ORIENTATION.HORIZONTAL)).toEqual(vec2.create(0,2))
      expect(getEdgeCoordinates(grid, 18, ORIENTATION.HORIZONTAL)).toEqual(vec2.create(1,2))
      expect(getEdgeCoordinates(grid, 20, ORIENTATION.HORIZONTAL)).toEqual(vec2.create(2,2))
    })
  })
})


