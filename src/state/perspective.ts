import { Getter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Mat4, Vec3, mat4, vec3 } from "wgpu-matrix";
import { deg2rad } from "../lib/math";
import { cameraPositionAtom } from "./camera";
import { aspectRatio } from "./window-size";

const UP = vec3.fromValues(0, 1, 0)

export const targetAtom = atomWithStorage('landscape:target', { x: 0, y: 0, z: 0 })
export const fovAtom = atomWithStorage('landscape:fov', 60);
export const nearAtom = atomWithStorage('landscape:near', 1)
export const farAtom = atomWithStorage('landscape:far', 1000)
export const targetVec3Atom = atom(getTargetVec3)
export const viewMatrixAtom = atom(getViewMatrix)
export const perspectiveMatrixAtom = atom(getPerspectiveMatrix)
export const inverseMatrixAtom = atom(getInverseMatrix)

function getTargetVec3(get: Getter): Vec3 {
  const target = get(targetAtom)
  return vec3.fromValues(target.x, target.y, target.z)
}

function getViewMatrix(get: Getter): Mat4 {
  return mat4.lookAt(get(cameraPositionAtom), get(targetVec3Atom), UP)
}

function getPerspectiveMatrix(get: Getter): Mat4 {
  const viewMatrix = get(viewMatrixAtom)
  const projectionMatrix = mat4.perspective(deg2rad(get(fovAtom)), get(aspectRatio), get(nearAtom), get(farAtom));
  return mat4.multiply(projectionMatrix, viewMatrix);

}
function getInverseMatrix(get: Getter): Mat4 {
  const matrix = mat4.clone(get(perspectiveMatrixAtom));
  matrix[12] = 0
  matrix[13] = 0
  matrix[14] = 0
  return mat4.invert(matrix, matrix)
}
