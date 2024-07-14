override workgroupThreadsX = 8;
override workgroupThreadsY = 1;
override workgroupThreadsZ = 8;

// size 12 floats, 48 bytes
// https://webgpufundamentals.org/webgpu/lessons/resources/wgsl-offset-computer.html#x=5d00000100d100000000000000003d888b0237284d3025f2381bcb288ae878c60ccc524b94961b05d1ea8834541f68656bbfcd10bea873816749c6ff72cf4d0422bcf3f333c54aa59a48e190f9b5a39ebc969e529b65ad41153646e32583df8dc36d3238a9a2b7a6c5c1e6ed4a00308610545d4734a44ebdd8ab1358e041ec6faa51931ad7962cd95ac371a13d63ceb0bdc36bdb4d64abc924b95d906eecffd2623000
struct Uniforms {
  layers: vec3<f32>,
  terrain: Terrain,
}

@binding(0) @group(0) var<uniform>             uniforms: Uniforms;
@binding(1) @group(0) var<storage, read_write> grid:     array<MarchingSquareData>;


@compute @workgroup_size(workgroupThreadsX, workgroupThreadsY, workgroupThreadsZ)
fn simulate(@builtin(global_invocation_id) grid_indices: vec3<u32>) {
  let instance_index = get_instance_index(grid_indices);

  // Replace the get_marching_square_data call below with each of these for MachingSquareData debugging:
  // grid[instance_index] = MarchingSquareData(TYPE_0);
  // grid[instance_index] = MarchingSquareData(type_1(1, -0.5, -1, -1));
  // grid[instance_index] = MarchingSquareData(type_2(1, 1, -0.2, -3));
  // grid[instance_index] = MarchingSquareData(type_3(1, -0.2, 1, -4.2));
  // grid[instance_index] = MarchingSquareData(type_4(1, 2, 1, -4.2));
  // grid[instance_index] = MarchingSquareData(TYPE_5);

  grid[instance_index] = get_marching_square_data(grid_indices, instance_index);
}

fn get_instance_index(grid_indices: vec3<u32>) -> u32 {
  let x_count = u32(uniforms.layers[0]);
  let z_count = u32(uniforms.layers[2]);
  return grid_indices.y * x_count * z_count + grid_indices.z * x_count + grid_indices.x;
}

const D_RR = vec2<u32>(1, 0);
const D_DR = vec2<u32>(1, 1);
const D_DD = vec2<u32>(0, 1);

const ROT_270d = mat2x2<f32>( 0.0, -1.0,  1.0,  0.0);
const ROT_180d = mat2x2<f32>(-1.0,  0.0,  0.0, -1.0);
const ROT_090d = mat2x2<f32>( 0.0,  1.0, -1.0,  0.0);

const TL = vec2<f32>(-0.5, -0.5);
const TR = vec2<f32>( 0.5, -0.5);
const BR = vec2<f32>( 0.5,  0.5);
const BL = vec2<f32>(-0.5,  0.5);

const UP = vec2<f32>(0, -1);
const RIGHT = vec2<f32>(1, 0);
const DOWN = vec2<f32>(0, 1);
const LEFT = vec2<f32>(-1, 0);

const TL_UP = MarchingSquareVertex(TL, UP);
const TR_UP = MarchingSquareVertex(TR, UP);
const TR_RIGHT = MarchingSquareVertex(TR, RIGHT);
const BR_RIGHT = MarchingSquareVertex(BR, RIGHT);
const BR_DOWN = MarchingSquareVertex(BR, DOWN);
const BL_DOWN = MarchingSquareVertex(BL, DOWN);
const BL_LEFT = MarchingSquareVertex(BL, LEFT);
const TL_LEFT = MarchingSquareVertex(TL, LEFT);

/** Type-0 marching square has four excluded vertices. */
const TYPE_0 = array<MarchingSquareVertex, 12>(
  TL_UP, TL_UP, TL_UP, TL_UP, TL_UP, TL_UP,
  TL_UP, TL_UP, TL_UP, TL_UP, TL_UP, TL_UP
);

/** Type-5 marching square has four included vertices. */
const TYPE_5 = array<MarchingSquareVertex, 12>(
  TL_UP, TR_UP, TR_RIGHT, BR_RIGHT, BR_DOWN, BL_DOWN,
  BL_LEFT, TL_LEFT, TL_UP, TL_UP, TL_UP, TL_UP
);

fn get_marching_square_data(grid_indices: vec3<u32>, instance_index: u32) -> MarchingSquareData {
  let xz = grid_indices.xz;
  let elevation = f32(grid_indices.y);

  let tl = get_height(xz)        - elevation;
  let tr = get_height(xz + D_RR) - elevation;
  let br = get_height(xz + D_DR) - elevation;
  let bl = get_height(xz + D_DD) - elevation;

  let square = get_marching_square(tl, tr, br, bl);

  switch square {
    case  1u: { return MarchingSquareData(type_1(tl, tr, br, bl), square); }
    case  2u: { return MarchingSquareData(rotate(ROT_090d, type_1(tr, br, bl, tl)), square); }
    case  3u: { return MarchingSquareData(type_2(tl, tr, br, bl), square); }
    case  4u: { return MarchingSquareData(rotate(ROT_180d, type_1(br, bl, tl, tr)), square); }
    case  5u: { return MarchingSquareData(type_3(tl, tr, br, bl), square); }
    case  6u: { return MarchingSquareData(rotate(ROT_090d, type_2(tr, br, bl, tl)), square); }
    case  7u: { return MarchingSquareData(type_4(tl, tr, br, bl), square); }
    case  8u: { return MarchingSquareData(rotate(ROT_270d, type_1(bl, tl, tr, br)), square); }
    case  9u: { return MarchingSquareData(rotate(ROT_270d, type_2(bl, tl, tr, br)), square); }
    case 10u: { return MarchingSquareData(rotate(ROT_270d, type_3(bl, tl, tr, br)), square); }
    case 11u: { return MarchingSquareData(rotate(ROT_270d, type_4(bl, tl, tr, br)), square); }
    case 12u: { return MarchingSquareData(rotate(ROT_180d, type_2(br, bl, tl, tr)), square); }
    case 13u: { return MarchingSquareData(rotate(ROT_180d, type_4(br, bl, tl, tr)), square); }
    case 14u: { return MarchingSquareData(rotate(ROT_090d, type_4(tr, br, bl, tl)), square); }
    case 15u: { return MarchingSquareData(TYPE_5, square); }
    default:  { return MarchingSquareData(TYPE_0, square); }
  }
}

fn get_height(xz: vec2<u32>) -> f32 {
  let world_xz = get_world_xz(xz, uniforms.terrain, uniforms.layers);
  return get_world_y(get_terrain(world_xz), uniforms.terrain, uniforms.layers);
}

/** Returns a marching-square type, based on the four corners. */
fn get_marching_square(tl: f32, tr: f32, br: f32, bl: f32) -> u32 {
  return select(0u, 1u, tl >= 0.0) +
         select(0u, 2u, tr >= 0.0) +
         select(0u, 4u, br >= 0.0) +
         select(0u, 8u, bl >= 0.0);
}

/** Type-1 marching square has one included vertex. */
fn type_1(tl: f32, tr: f32, br: f32, bl: f32) -> array<MarchingSquareVertex, 12> {
  let p = unmix(tl, tr);
  let q = unmix(tl, bl);
  let TP = vec2<f32>(p - 0.5, -0.5);
  let QL = vec2<f32>(-0.5, q - 0.5);
  let normal = normalize(vec2<f32>(q, p));

  return array<MarchingSquareVertex, 12>(
    TL_UP,
    MarchingSquareVertex(TP, UP),
    MarchingSquareVertex(TP, normal),
    MarchingSquareVertex(QL, normal),
    MarchingSquareVertex(QL, LEFT),
    TL_LEFT, TL_UP, TL_UP, TL_UP, TL_UP, TL_UP, TL_UP
  );
}

/** Type-2 marching square has two adjacent included vertices. */
fn type_2(tl: f32, tr: f32, br: f32, bl: f32) -> array<MarchingSquareVertex, 12> {
  let p = unmix(tl, bl);
  let q = unmix(tr, br);
  let PL = vec2<f32>(-0.5, p - 0.5);
  let QR = vec2<f32>( 0.5, q - 0.5);
  let normal = normalize(vec2<f32>(q - p, 1));

  return array<MarchingSquareVertex, 12>(
    TL_UP, TR_UP, TR_RIGHT,
    MarchingSquareVertex(QR, RIGHT),
    MarchingSquareVertex(QR, normal),
    MarchingSquareVertex(PL, normal),
    MarchingSquareVertex(PL, LEFT),
    TL_LEFT, TL_UP, TL_UP, TL_UP, TL_UP,
  );
}

/** Type-3 marching square has two opposite included vertices. */
fn type_3(tl: f32, tr: f32, br: f32, bl: f32) -> array<MarchingSquareVertex, 12> {
  let p = unmix(tl, tr);
  let q = unmix(tr, br);
  let s = unmix(bl, br);
  let u = unmix(tl, bl);
  let TP = vec2<f32>(p - 0.5, -0.5);
  let QR = vec2<f32>(0.5, q - 0.5);
  let BS = vec2<f32>(s - 0.5, 0.5);
  let LU = vec2<f32>(-0.5, u - 0.5);
  let tr_normal = normalize(vec2<f32>(q, p - 1));
  let bl_normal = normalize(vec2<f32>(u - 1, s));

  return array<MarchingSquareVertex, 12>(
    TL_UP,
    MarchingSquareVertex(TP, UP),
    MarchingSquareVertex(TP, tr_normal),
    MarchingSquareVertex(QR, tr_normal),
    MarchingSquareVertex(QR, RIGHT),
    BR_RIGHT, BR_DOWN,
    MarchingSquareVertex(BS, DOWN),
    MarchingSquareVertex(BS, bl_normal),
    MarchingSquareVertex(LU, bl_normal),
    MarchingSquareVertex(LU, LEFT),
    TL_LEFT,
  );
}

/** Type-4 has one excluded vertex. */
fn type_4(tl: f32, tr: f32, br: f32, bl: f32) -> array<MarchingSquareVertex, 12> {
  let p = unmix(bl, br);
  let q = unmix(tl, bl);
  let BP = vec2<f32>(p - 0.5, 0.5);
  let QL = vec2<f32>(-0.5, q - 0.5);
  let bl_normal = normalize(vec2<f32>(q - 1, p));

  return array<MarchingSquareVertex, 12>(
    TL_UP, TR_UP, TR_RIGHT, BR_RIGHT, BR_DOWN,
    MarchingSquareVertex(BP, DOWN),
    MarchingSquareVertex(BP, bl_normal),
    MarchingSquareVertex(QL, bl_normal),
    MarchingSquareVertex(QL, LEFT),
    TL_LEFT, TL_UP, TL_UP,
  );
}

fn rotate(matrix: mat2x2<f32>, source: array<MarchingSquareVertex, 12>) -> array<MarchingSquareVertex, 12> {
  var result = array<MarchingSquareVertex, 12>();
  for (var i = 0u; i < 12u; i = i + 1u) {
    let source = source[i];
    result[i] = MarchingSquareVertex(matrix * source.position, matrix * source.normal);
  }
  return result;
}

fn unmix(a: f32, b: f32) -> f32 {
  return -a / (b - a);
}

fn debug_scale(source: array<MarchingSquareVertex, 12>) -> array<MarchingSquareVertex, 12> {
  var result = array<MarchingSquareVertex, 12>();
  for (var i = 0u; i < 12u; i = i + 1u) {
    let source = source[i];
    result[i] = MarchingSquareVertex(source.position * 1.5, source.normal);
  }
  return result;
}
