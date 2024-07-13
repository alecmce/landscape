import { Getter, Setter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Mat4, Vec3, mat4, vec3 } from "wgpu-matrix";
import { constrain } from "../lib/constrain";
import { deg2rad } from "../lib/math";
import { SphericalCoords, SphericalCoordsAtom, UpdateAtom, resolveUpdate } from "../lib/types";

const UP = vec3.fromValues(0, 1, 0)

/** Input atoms that allows the orbit camera to be manipulated. */
export const orbitCameraAtom = atom(getOrbitCamera, setOrbitCamera) as SphericalCoordsAtom
export const orbitCameraTargetAtom = atomWithStorage('landscape:orbit-camera:target', { x: 0, y: 0, z: 0 })

/** Output atoms. */
export const orbitCameraPositionAtom = atom(getOrbitCameraPosition)
export const orbitCameraViewMatrixAtom = atom(getOrbitCameraViewMatrix)

const targetVec3Atom = atom(getTargetVec3)
const sourceAtom = atomWithStorage('landscape:orbit-camera', { elevationDegrees: 16, radius: 200, azithmulDegrees: 4.2 })

function getOrbitCameraViewMatrix(get: Getter): Mat4 {
  return mat4.lookAt(get(orbitCameraPositionAtom), get(targetVec3Atom), UP)
}

function getTargetVec3(get: Getter): Vec3 {
  const target = get(orbitCameraTargetAtom)
  return vec3.fromValues(target.x, target.y, target.z)
}

function getOrbitCamera(get: Getter): SphericalCoords {
  return get(sourceAtom)
}

const ELEVATION_CONSTRAINT = { min: -89.999, max: 89.999 }
const AZITHMUL_CONSTRAINT = { wrap: true, min: -180, max: 180 }
const RADIUS_CONSTRAINT = { min: 1, max: 250 }

function setOrbitCamera(get: Getter, set: Setter, update: SphericalCoords | UpdateAtom<SphericalCoords>): void {
  const value = resolveUpdate(sourceAtom, get, update)
  const { azithmulDegrees, elevationDegrees, radius } = value

  set(sourceAtom, {
    azithmulDegrees: constrain(azithmulDegrees, AZITHMUL_CONSTRAINT),
    elevationDegrees: constrain(elevationDegrees, ELEVATION_CONSTRAINT),
    radius: constrain(radius, RADIUS_CONSTRAINT),
  })
}

function getOrbitCameraPosition(get: Getter): Vec3 {
  const target = get(targetVec3Atom)
  const { azithmulDegrees, elevationDegrees, radius }  = get(orbitCameraAtom)

  const azithmul = deg2rad(azithmulDegrees);
  const elevation = deg2rad(elevationDegrees);

  const x = target[0] + radius * Math.cos(elevation) * Math.cos(azithmul);
  const y = target[1] + radius * Math.sin(elevation);
  const z = target[2] + radius * Math.cos(elevation) * Math.sin(azithmul);

  return vec3.fromValues(x, y, z);
}
