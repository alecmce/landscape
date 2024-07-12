/**
 * Calculated in the compute shader, MarchingSquareData contains the information necessary to resolve each vertex of a
 * marching square. There are six distinct marching square types; the `square` field specifies of which type is each
 * square. The data contains information sufficient to unpack that type assuming that the top-left vertex is part of the
 * set of included vertices; the (rotation) matrix then corrects for that orientation.
 *
 * This is the minimal data needed to resolve each vertex in the vertex shader. Note that I have packed the `square`
 * field, in an attempt to standardize the size of the data.
 *
 * 52 floats, 208 bytes
 * https://webgpufundamentals.org/webgpu/lessons/resources/wgsl-offset-computer.html#x=5d00000100d300000000000000003d888b0237284d3025f2381bcb28899290a1714d75ec90698d633d13a78d9b1606236838369c9a7e177b3c5f4c267f40b791c94c2fe849ae8a1b730b17f8a5af4f8b46ba08cdb7143fa56c5dd01648af7f4db78e0ae2bdf69033bd7d515a82fc69c40eb0d33bfc9528feebbc60c83a7cf87368f92eb1dcf263ab13f0e1b73b406ad5bbc3556eb0b862724c4a24ef9f5bf420ad1b9f0a18559ea5ff5ab38000
 */
struct MarchingSquareData {
  vertices: array<MarchingSquareVertex, 12>,
  square:   u32,
}

// 4 floats, 16 bytes
struct MarchingSquareVertex {
  position: vec2<f32>,
  normal:   vec2<f32>,
}

// 8 floats, 32 bytes
struct Terrain {
  offset: vec3<f32>, // pad 1 byte,
  scale:  vec3<f32>, // pad 1 byte,
}

fn get_world_xz(xz: vec2<u32>, terrain: Terrain, layers: vec3<f32>) -> vec2<f32> {
  let x = terrain.scale.x * (((f32(xz[0]) - terrain.offset.x) / layers[0]) - 0.5);
  let z = terrain.scale.z * (((f32(xz[1]) - terrain.offset.z) / layers[2]) - 0.5);
  return vec2<f32>(x, z);
}

fn get_world_y(y: f32, terrain: Terrain, layers: vec3<f32>) -> f32 {
  return (y * uniforms.terrain.scale.y) + uniforms.terrain.offset.y;
}
