import { Getter, atom } from "jotai";
import { Atom } from "jotai/experimental";
import { atomWithStorage } from "jotai/utils";
import { Mat4, mat4 } from "wgpu-matrix";
import { deg2rad } from "../lib/math";
import { firstPersonCameraViewMatrixAtom } from "./first-person-camera";
import { aspectRatio } from "./window-size";

export const fovAtom = atomWithStorage('landscape:fov', 60);
export const nearAtom = atomWithStorage('landscape:near', 1)
export const farAtom = atomWithStorage('landscape:far', 2500)
export const perspectiveMatrixAtom = makePerspectiveAtom(firstPersonCameraViewMatrixAtom)
export const inverseMatrixAtom = atom(getInverseMatrix)

function makePerspectiveAtom(viewMatrixAtom: Atom<Mat4>): Atom<Mat4> {
  return atom(getPerspectiveMatrix)

  function getPerspectiveMatrix(get: Getter): Mat4 {
    const viewMatrix = get(viewMatrixAtom)
    const projectionMatrix = mat4.perspective(deg2rad(get(fovAtom)), get(aspectRatio), get(nearAtom), get(farAtom));
    return mat4.multiply(projectionMatrix, viewMatrix);
  }
}

function getInverseMatrix(get: Getter): Mat4 {
  const matrix = mat4.clone(get(perspectiveMatrixAtom));
  matrix[12] = 0
  matrix[13] = 0
  matrix[14] = 0
  return mat4.invert(matrix, matrix)
}
