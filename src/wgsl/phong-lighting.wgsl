const POINT_LIGHT_COUNT = ${POINT_LIGHT_COUNT};

// size 20 floats, 80 bytes
struct PhongObject {
  position: vec3<f32>, // pad 1 byte
  normal:   vec3<f32>, // pad 1 byte
  material: Material,
};

// size 12 floats, 48 bytes
struct Material {
  ambient_color:  vec3<f32>, // pad 1 byte
  diffuse_color:  vec3<f32>, // pad 1 byte
  specular_color: vec3<f32>,
  shininess:      f32,
};

// size 8 * POINT_LIGHT_COUNT floats, 32 * POINT_LIGHT_COUNT bytes
struct Lights {
  point_lights: array<PointLight, POINT_LIGHT_COUNT>,
};

// size 8 floats, 32 bytes
struct PointLight {
  position:  vec3<f32>, // pad 1 byte
  color:     vec3<f32>,
  intensity: f32,
};

fn calculate_lighting(camera: vec3<f32>, object: PhongObject, lights: Lights) -> vec3<f32> {
  let material = object.material;

  var result = material.ambient_color;

  for (var i = 0u; i < POINT_LIGHT_COUNT; i++) {
    let light = lights.point_lights[i];
    let lightDir = normalize(light.position - object.position);
    let viewDir = normalize(camera - object.position);
    let halfVector = normalize(lightDir + viewDir);

    // Diffuse component
    let diffuse_factor = max(dot(object.normal, lightDir), 0.0);
    result += material.diffuse_color * light.color * diffuse_factor * light.intensity;

    // Specular component
    let specular_factor = pow(max(dot(object.normal, halfVector), 0.0), material.shininess);
    result += material.specular_color * light.color * specular_factor * light.intensity;
  }

  return result;
}
