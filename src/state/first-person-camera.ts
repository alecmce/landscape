import { Getter, Setter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Mat4, Vec3, mat4, vec3 } from "wgpu-matrix";
import { constrain } from "../lib/constrain";
import { deg2rad } from "../lib/math";
import { AtomUpdate, XYZ, resolveUpdate } from "../lib/types";

export interface FirstPersonInfo extends XYZ, FirstPersonRotation {
  speed: number
}

export interface FirstPersonRotation {
  pitch: number,
  yaw:   number,
}

const UP = vec3.fromValues(0, 1, 0);

// Input Atoms for First-Person Camera
const sourceAtom = atomWithStorage('landscape:first-person', { x: 0, y: 60, z: 0, pitch: -1, yaw: 0, speed: 1, });

// Output Atoms (same as orbit camera for consistency)
export const firstPersonCameraAtom = atom(getFpCameraInfo, setFpCameraInfo)
export const firstPersonCameraPositionAtom = atom(getFpCameraPosition);
export const firstPersonCameraViewMatrixAtom = atom(getFpCameraViewMatrix);

// Internal Atoms
const lookDirectionAtom = atom(getFpCameraLookDirection);


function getFpCameraInfo(get: Getter): FirstPersonInfo {
  return get(sourceAtom);
}

const PITCH_CONSTRAINTS = { min: -89, max: 89 };
const YAW_CONSTRAINTS = { min: -180, max: 180, wrap: true };
const EPSILON = 0.001 // Hack to avoid weird sky behaviour at 0 yaw.

function setFpCameraInfo(get: Getter, set: Setter, update: AtomUpdate<FirstPersonInfo>): void {
  const { x, y, z, speed, pitch, yaw } = resolveUpdate(sourceAtom, get, update)
  const yawValue = constrain(yaw, YAW_CONSTRAINTS)
  const pitchValue = constrain(pitch, PITCH_CONSTRAINTS)
  set(sourceAtom, { x, y, z, speed, pitch: pitchValue === 0 ? EPSILON : pitchValue, yaw: yawValue });
}

function getFpCameraPosition(get: Getter): Vec3 {
  const position = get(sourceAtom);
  return vec3.fromValues(0, position.y, 0)
}

function getFpCameraViewMatrix(get: Getter): Mat4 {
  const position = get(firstPersonCameraPositionAtom);

  const lookDirection = get(lookDirectionAtom);
  const target = vec3.add(position, lookDirection);
  return mat4.lookAt(position, target, UP);
}

function getFpCameraLookDirection(get: Getter): Vec3 {
  const { pitch, yaw } = get(sourceAtom);
  const pitchRad = deg2rad(pitch);
  const yawRad = deg2rad(yaw);

  const x = Math.cos(pitchRad) * Math.sin(yawRad);
  const y = Math.sin(pitchRad);
  const z = Math.cos(pitchRad) * Math.cos(yawRad);

  return vec3.fromValues(x, y, z);
}
