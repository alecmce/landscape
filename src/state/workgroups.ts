import { Getter, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { NNN, WORKGROUP_3D, Workgroups, getWorkgroups } from "../lib/webgpu/workgroups";
import { layersVec3Atom } from "./layers";
import { workgroupSize as workgroupSizeAtom } from './workgroups';


type WorkgroupSize = 1 | 2 | 4

/** An atom that reflects the compute shader's underlying workgroup-size. */
export const workgroupSize = atomWithStorage<WorkgroupSize>('landscape:workgroupSize', 1)

/** A reaonly atom that relfects the workgroup counts and threads per workgroup. */
export const workgroupsAtom = atom(getWorkgroupsAtom)

function getWorkgroupsAtom(get: Getter): Workgroups {
  const instances = get(layersVec3Atom)
  const workgroupSize = get(workgroupSizeAtom)

  const counts = [instances[0], instances[1], instances[2]] as NNN
  return getWorkgroups<WORKGROUP_3D>(counts, [workgroupSize, workgroupSize, workgroupSize])
}
