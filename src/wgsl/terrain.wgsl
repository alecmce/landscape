// @see https://www.shadertoy.com/view/4ttSWf

// iq's 'terrainMap' function. Returns height: f32
fn get_terrain(p: vec2<f32>) -> f32 {
  return fractional_brownian_motion_order_9(p);
}

const FBM_9_F = 1.9;  // TODO: Work out what this is.
const FBM_9_S = 0.55; // TODO: Work out what this is.
const M_2 = mat2x2<f32>(0.80, 0.60, -0.60, 0.80);

// iq's `fbm_9` function, @see https://iquilezles.org/articles/fbm/
fn fractional_brownian_motion_order_9(x: vec2<f32>) -> f32 {
  var a = 0.0;
  var b = 0.5;
  var y = x;

  for (var i = 0u; i < 9u; i++) {
    let n = (get_noise_value(y) + 1.0) / 2.0;
    a += b * n;
    b *= FBM_9_S;
    y = FBM_9_F * M_2 * y;
  }

  return a;
}

// iq's `noise` function
fn get_noise_value(x: vec2<f32>) -> f32 {
  let p = floor(x);
  let w = fract(x);

  let a = hash1(p + vec2(0.0, 0.0));
  let b = hash1(p + vec2(1.0, 0.0));
  let c = hash1(p + vec2(0.0, 1.0));
  let d = hash1(p + vec2(1.0, 1.0));

  let u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);
  return -1.0 + 2.0 * (a + (b - a) * u.x + (c - a) * u.y + (a - b - c + d) * u.x * u.y);
}


fn hash1(p: vec2<f32>) -> f32 {
  let q = 50.0 * fract(p * 0.3183099);
  return fract(q.x * q.y * (q.x + q.y));
}
