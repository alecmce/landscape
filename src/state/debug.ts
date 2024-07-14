import { Getter, Setter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { clamp } from "../lib/math";

const separation = atomWithStorage('landscape:separation', 0)

export const separationAtom = atom(getSeparation, setSeparation)

function getSeparation(get: Getter): number {
  return get(separation)
}

function setSeparation(_: Getter, set: Setter, value: number): void {
  set(separation, clamp(value, 0, 5))
}
