import { mat2 } from "gl-matrix";
import { describe, expect, it } from "vitest";
import { Vec2, Vec3, vec2, vec3 } from "wgpu-matrix";
import { integers } from "../lib/number";

interface Uniforms {
  layers: Vec3
}

describe('get_instance_index (in compute shader)', () => {

  it('returns the correct index on the first y-layer', () => {
    const uniforms = { layers: vec3.fromValues(4, 1, 4) }
    expect(get_instance_index(vec3.fromValues(0, 0, 0), uniforms)).toBe(0)
    expect(get_instance_index(vec3.fromValues(1, 0, 0), uniforms)).toBe(1)
    expect(get_instance_index(vec3.fromValues(0, 0, 1), uniforms)).toBe(4)
    expect(get_instance_index(vec3.fromValues(1, 0, 3), uniforms)).toBe(13)
  })

  it('returns the correct index on other y-layers', () => {
    const uniforms = { layers: vec3.fromValues(4, 4, 4) }
    expect(get_instance_index(vec3.fromValues(0, 1, 0), uniforms)).toBe(1 * 16)
    expect(get_instance_index(vec3.fromValues(1, 2, 0), uniforms)).toBe(2 * 16 + 1)
    expect(get_instance_index(vec3.fromValues(0, 3, 1), uniforms)).toBe(3 * 16 + 4)
    expect(get_instance_index(vec3.fromValues(1, 4, 3), uniforms)).toBe(4 * 16 + 13)
  })

  function get_instance_index(grid_indices: Vec3, uniforms: Uniforms): number {
    const x_count = uniforms.layers[0];
    const z_count = uniforms.layers[2];
    return grid_indices[1] * x_count * z_count + grid_indices[2] * x_count + grid_indices[0];
  }
})

describe('get_grid_indices (in vertex shader)', () => {

  it('inverts get_instance_index', () => {
    const uniforms = { layers: vec3.fromValues(4, 4, 4) }
    expect(get_grid_indices(0, uniforms)).toEqual(vec3.fromValues(0, 0, 0))
    expect(get_grid_indices(1, uniforms)).toEqual(vec3.fromValues(1, 0, 0))
    expect(get_grid_indices(4, uniforms)).toEqual(vec3.fromValues(0, 0, 1))
    expect(get_grid_indices(13, uniforms)).toEqual(vec3.fromValues(1, 0, 3))

    expect(get_grid_indices(1 * 16, uniforms)).toEqual(vec3.fromValues(0, 1, 0))
    expect(get_grid_indices(2 * 16 + 1, uniforms)).toEqual(vec3.fromValues(1, 2, 0))
    expect(get_grid_indices(3 * 16 + 4, uniforms)).toEqual(vec3.fromValues(0, 3, 1))
    expect(get_grid_indices(4 * 16 + 13, uniforms)).toEqual(vec3.fromValues(1, 4, 3))
  })

  /** Converts an index into a grid position. */
  function get_grid_indices(instance_index: number, uniforms: Uniforms): Vec3 {
    const x_count = uniforms.layers[0]
    const z_count = uniforms.layers[2]

    const x = instance_index % x_count;
    const z = Math.floor(instance_index / x_count) % z_count;
    const y = Math.floor(instance_index / (x_count * z_count));
    return vec3.fromValues(x, y, z);
  }
})

describe('monkey_saddle', () => {

  it('returns values in a reasonable range', () => {
    const uniforms = { layers: vec3.fromValues(4, 4, 4) }
    expect(monkey_saddle(vec2.fromValues(0, 0), uniforms)).toEqual(0.25)
    expect(monkey_saddle(vec2.fromValues(1, 0), uniforms)).toEqual(0.171875)
    expect(monkey_saddle(vec2.fromValues(0, 1), uniforms)).toEqual(-0.03125)
    expect(monkey_saddle(vec2.fromValues(1, 3), uniforms)).toEqual(0.03125)
  })

  function monkey_saddle(xz: Vec2, uniforms: Uniforms): number {
    const x = (xz[0] / uniforms.layers[0]) - 0.5;
    const z = (xz[1] / uniforms.layers[2]) - 0.5;
    return x * x * x - 3.0 * x * z * z;
  }
})

describe('get_terrain', () => {

  it('is based on hash values in the range 0..1', () => {
    const list = integers(0, 100).map(() => hash1(Math.random(), Math.random()))
    expect(list.every(n => n >= 0 && n <= 1)).toBe(true)
  })

  it('is based on noise values in the range -1..1', () => {
    const list = integers(0, 100).map(() => {
      return get_noise_value(Math.random(), Math.random())
    })
    expect(list.every(n => n >= -1 && n <= 1)).toBe(true)
  })

  it('is based on noise values in the range -1..1', () => {
    const list = integers(0, 100).map(() => {
      return get_noise_value(Math.random(), Math.random())
    })
    expect(list.every(n => n >= -1 && n <= 1)).toBe(true)
  })

  it('is based on fractional brownian motion values in the range 0..1', () => {
    const list = integers(0, 100).map(() => {
      const input = vec2.fromValues(Math.random(), Math.random())
      return fractional_brownian_motion_order_9(input)
    })
    expect(list.every(n => n >= 0 && n <= 1)).toBe(true)
  })

  it('returns values in a reasonable range', () => {
    expect(get_terrain(vec2.fromValues(0, 0))).toBeCloseTo(-1.566)
    expect(get_terrain(vec2.fromValues(1, 0))).toBeCloseTo(-1.566)
    expect(get_terrain(vec2.fromValues(0, 1))).toBeCloseTo(-3.554)
    expect(get_terrain(vec2.fromValues(1, 3))).toBeCloseTo(-3.544)
  })


  function get_terrain(p: Vec2): number {
    const px = p[0] / 2000 + 1
    const py = p[1] / 2000 - 2
    return fractional_brownian_motion_order_9(vec2.fromValues(px, py))
  }

  const FBM_9_F = 1.9;
  const FBM_9_S = 0.55;
  const M_2 = mat2.fromValues(0.80, 0.60, -0.60, 0.80);

  function fractional_brownian_motion_order_9(x: Vec2): number {
    let a = 0.0;
    let b = 0.5;
    let y = x;

    for (let i = 0; i < 9; i++) {
      const n = (get_noise_value(y[0], y[1]) + 1) / 2
      a += b * n;
      b *= FBM_9_S;
      y = vec2.mulScalar(vec2.multiply(M_2, y), FBM_9_F)
    }

    return a;
  }

  function get_noise_value(x: number, y: number): number {
    const px = Math.floor(x)
    const py = Math.floor(y)

    const wx = fract(x)
    const wy = fract(y)

    const a = hash1(px + 0, py + 0)
    const b = hash1(px + 1, py + 0)
    const c = hash1(px + 0, py + 1)
    const d = hash1(px + 1, py + 1)

    const ux = wx * wx * wx * (wx * (wx * 6.0 - 15.0) + 10.0);
    const uy = wy * wy * wy * (wy * (wy * 6.0 - 15.0) + 10.0);
    return -1.0 + 2.0 * (a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy);
  }

  function hash1(x: number, y: number): number {
    const qx = 50.0 * fract(x * 0.3183099)
    const qy = 50.0 * fract(y * 0.3183099)
    return (qx * qy * (qx + qy)) % 1;
  }

  function fract(n: number): number {
    return Math.abs(n % 1)
  }
})
