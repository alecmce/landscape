const POSITIONS = array(
  vec2f(-1, 3),
  vec2f(-1,-1),
  vec2f( 3,-1),
);

struct Uniforms {
  ambient_light: vec4<f32>,
  matrix:        mat4x4<f32>,
};

struct VertexShaderOutput {
  @builtin(position) position:     vec4f,
  @location(0)       sky_position: vec4f,
};

@binding(0) @group(0) var<uniform> uniforms:          Uniforms;
@binding(1) @group(0) var          sky_sampler: sampler;
@binding(2) @group(0) var          sky_texture: texture_2d<f32>;

@vertex fn vs_main(@builtin(vertex_index) vertex_index: u32) -> VertexShaderOutput {
  let position = vec4f(POSITIONS[vertex_index], 1.0, 1.0);
  return VertexShaderOutput(position, position);
}

@fragment fn fs_main(input: VertexShaderOutput) -> @location(0) vec4<f32> {
  let value = uniforms.matrix * input.sky_position;
  let rgb = get_sky_color(value.y) * uniforms.ambient_light.xyz * uniforms.ambient_light.w;
  return vec4<f32>(rgb, 1.0);
}

fn get_sky_color(y: f32) -> vec3<f32> {
  return textureSample(sky_texture, sky_sampler, vec2<f32>(0.5, y)).xyz;
}
