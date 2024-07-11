const FACE_BOTTOM      = 1u;
const FACE_TOP         = 2u;
const FACE_BOTTOM_SIDE = 3u;
const FACE_TOP_SIDE    = 4u;

// https://webgpufundamentals.org/webgpu/lessons/resources/wgsl-offset-computer.html#x=5d000001005e01000000000000003d888b0237284d3025f2381bcb288ae878c60ccc524b94961b05d1ea86e70104488471fc4190e456f5a619d7f730c8c07da69c196379dfb7e9f59f3c84bc6848ab7f55e643a8fdcbc28c53ae476f6547c2f672f7dbedc37db771e1a95035fa7fe4f3f926448dc81096d5c839d53e3beb8a574e71f43ec8f53548b0dd3736ad319622a6f1b8eeda63d1b3408030710a120ef48e8aba7c6d0c51e2e0f7eeba07797d9b9b33db7f3459e8d65573f5c5d688951bff4008fbc23f1ce071f9da055ba0b42a03dcf55d83c9a9f18f8c2c5eff938624389286fef60e9026
// size: (40 floats, 160 bytes) + lights * (8 floats, 32 bytes)
struct Uniforms {
  camera:      vec3<f32>, // pad 1 byte
  matrix:      mat4x4<f32>,
  layers:      vec3<f32>,
  separation:  f32,
  scale:       vec3<f32>,
  render_type: f32,
  material:    Material,
  lights:      Lights,
};

@binding(0) @group(0) var<uniform>       uniforms:          Uniforms;
@binding(1) @group(0) var<storage, read> grid:              array<MarchingSquareData>;
@binding(2) @group(0) var                elevation_sampler: sampler;
@binding(3) @group(0) var                elevation_texture: texture_2d<f32>;

struct VertexShaderOutput {
   @builtin(position)              position:  vec4<f32>,
   @location(0)                    normal:    vec3<f32>,
   @location(1) @interpolate(flat) square:    u32, // For debugging
   @location(2) @interpolate(flat) elevation: f32,
}

@vertex
fn vs_main(
  @builtin(instance_index) instance_index: u32,
  @location(0)             position:       vec2<f32>,
) -> VertexShaderOutput {
  let grid_indices = get_grid_indices(instance_index);
  let square_data = grid[instance_index];

  let index = u32(position.x);
  let square_vertex = square_data.vertices[index];

  let face = u32(position.y);
  let vertex = (get_local_vertex(face, square_vertex.position) + get_instance_offset(grid_indices)) * uniforms.scale;
  let normal = (uniforms.matrix * vec4<f32>(get_normal(face, square_vertex.normal), 0.0)).xyz;

  let elevation = f32(grid_indices.y) / uniforms.layers[1];
  return VertexShaderOutput(uniforms.matrix * vec4<f32>(vertex, 1.0), normal, square_data.square, elevation);
}

/** Converts an index into a grid position. */
fn get_grid_indices(instance_index: u32) -> vec3<u32> {
  let x_count = u32(uniforms.layers[0]);
  let z_count = u32(uniforms.layers[2]);

  let x = instance_index % x_count;
  let z = (instance_index / x_count) % z_count;
  let y = instance_index / (x_count * z_count);
  return vec3<u32>(x, y, z);
}

fn get_local_vertex(face: u32, square_vertex: vec2<f32>) -> vec3<f32> {
  let y = select(0.0, 1.0, face == FACE_TOP || face == FACE_TOP_SIDE);
  return vec3<f32>(square_vertex[0], y, square_vertex[1]);
}

/** Returns the 3D space normal for a given vertex; either up, down, or the marching square vertex normal sideways. */
fn get_normal(face: u32, normal: vec2<f32>) -> vec3<f32> {
  switch (face) {
    case FACE_BOTTOM: { return vec3<f32>(0, -1, 0); }
    case FACE_TOP:    { return vec3<f32>(0, 1, 0); }
    default:          { return vec3<f32>(normal[0], 0, normal[1]); }
  }
}

fn get_instance_offset(grid_indices: vec3<u32>) -> vec3<f32> {
  let layer_offset = vec3<f32>(uniforms.layers.x, 0, uniforms.layers.z) / 2.0;
  let instance_offset = vec3<f32>(grid_indices) - layer_offset;
  return vec3<f32>(instance_offset * (1.0 + uniforms.separation));
}

const RENDER_TYPE_STANDARD    = 0u;
const RENDER_TYPE_SQUARE_TYPE = 1u;
const RENDER_TYPE_NORMALS     = 2u;

@fragment
fn fs_main(input: VertexShaderOutput) -> @location(0) vec4<f32> {
  switch u32(uniforms.render_type) {
    case RENDER_TYPE_SQUARE_TYPE: { return fs_square_type(input); }
    case RENDER_TYPE_NORMALS:     { return fs_normals(input); }
    default:                      { return fs_render(input); }
  }
}

fn fs_render(input: VertexShaderOutput) -> vec4<f32> {
  let material = Material(get_elevation_color(input.elevation), uniforms.material.diffuse_color, uniforms.material.specular_color, uniforms.material.shininess);
  let object = PhongObject(input.position.xyz, input.normal, material);
  return vec4<f32>(calculate_lighting(uniforms.camera, object, uniforms.lights), 1.0);
}

fn get_elevation_color(elevation: f32) -> vec3<f32> {
  let color = textureSample(elevation_texture, elevation_sampler, vec2<f32>(elevation, 0.5));
  return color.rgb;
}

fn fs_square_type(input: VertexShaderOutput) -> vec4<f32> {
  switch input.square {
    case 0u:  { return vec4<f32>(1.0, 0.0, 0.0, 1.0); }  // Red
    case 1u:  { return vec4<f32>(1.0, 0.5, 0.0, 1.0); }  // Orange
    case 2u:  { return vec4<f32>(1.0, 1.0, 0.0, 1.0); }  // Yellow
    case 3u:  { return vec4<f32>(0.5, 1.0, 0.0, 1.0); }  // Yellow-Green
    case 4u:  { return vec4<f32>(0.0, 1.0, 0.0, 1.0); }  // Green
    case 5u:  { return vec4<f32>(0.0, 1.0, 0.5, 1.0); }  // Spring Green
    case 6u:  { return vec4<f32>(0.0, 1.0, 1.0, 1.0); }  // Cyan
    case 7u:  { return vec4<f32>(0.0, 0.5, 1.0, 1.0); }  // Azure
    case 8u:  { return vec4<f32>(0.0, 0.0, 1.0, 1.0); }  // Blue
    case 9u:  { return vec4<f32>(0.5, 0.0, 1.0, 1.0); }  // Violet
    case 10u: { return vec4<f32>(1.0, 0.0, 1.0, 1.0); }  // Magenta
    case 11u: { return vec4<f32>(1.0, 0.0, 0.5, 1.0); }  // Rose
    case 12u: { return vec4<f32>(1.0, 0.25, 0.0, 1.0); } // Vermilion (slightly orange-red)
    case 13u: { return vec4<f32>(0.75, 1.0, 0.0, 1.0); } // Chartreuse (yellow-green)
    case 14u: { return vec4<f32>(0.0, 0.75, 1.0, 1.0); } // Teal (blue-green)
    case 15u: { return vec4<f32>(0.5, 0.0, 0.75, 1.0); } // Amethyst (purplish-violet)
    default:  { return vec4<f32>(0.0); }                 // Shouldn't be reached
  }
}

fn fs_normals(input: VertexShaderOutput) -> vec4<f32> {
  return vec4<f32>(abs(input.normal), 1.0);
}
