
fn get_terrain(p: vec2<f32>) -> f32 {
  // return get_steps(p);
  return get_hemisphere_height(p);
}

const SCALAR = 20.0;

fn get_hemisphere_height(p: vec2<f32>) -> f32 {
  let distance = SCALAR * length(repeated(p * SCALAR)) * 2.0;
  return select(0.0, sqrt(SCALAR * SCALAR - distance * distance), distance < SCALAR);
}


fn get_steps(p: vec2<f32>) -> f32 {
  return SCALAR * abs(p.x + p.y);
}

fn repeated(p: vec2<f32>) -> vec2<f32> {
  return p - round(p);
}
