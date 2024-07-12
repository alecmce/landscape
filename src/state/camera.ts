import { Getter, Setter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { constrain } from "../lib/constrain";
import { isFunction } from "../lib/object";
import { SphericalCoords, SphericalCoordsAtom, UpdateAtom } from "../lib/types";
import { Vec3, vec3 } from "wgpu-matrix";
import { deg2rad } from "../lib/math";
import { targetVec3Atom } from "./perspective";

const camera = atomWithStorage('landscape:camera', { elevationDegrees: 16, radius: 200, azithmulDegrees: 4.2 })

export const cameraAtom = atom(getCamera, setCamera) as SphericalCoordsAtom

function getCamera(get: Getter): SphericalCoords {
  return get(camera)
}

const ELEVATION_CONSTRAINT = { min: -89.999, max: 89.999 }
const AZITHMUL_CONSTRAINT = { wrap: true, min: -180, max: 180 }
const RADIUS_CONSTRAINT = { min: 1, max: 250 }

function setCamera(get: Getter, set: Setter, update: SphericalCoords | UpdateAtom<SphericalCoords>): void {
  const value = isFunction(update) ? update(get(camera)) : update
  const { azithmulDegrees, elevationDegrees, radius } = value

  set(camera, {
    azithmulDegrees: constrain(azithmulDegrees, AZITHMUL_CONSTRAINT),
    elevationDegrees: constrain(elevationDegrees, ELEVATION_CONSTRAINT),
    radius: constrain(radius, RADIUS_CONSTRAINT),
  })
}

export const cameraPositionAtom = atom(getCameraPosition)

function getCameraPosition(get: Getter): Vec3 {
  const target = get(targetVec3Atom)
  const { azithmulDegrees, elevationDegrees, radius }  = get(cameraAtom)

  const azithmul = deg2rad(azithmulDegrees);
  const elevation = deg2rad(elevationDegrees);

  const x = target[0] + radius * Math.cos(elevation) * Math.cos(azithmul);
  const y = target[1] + radius * Math.sin(elevation);
  const z = target[2] + radius * Math.cos(elevation) * Math.sin(azithmul);

  return vec3.fromValues(x, y, z);
}
