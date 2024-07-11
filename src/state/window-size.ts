import { Getter, atom } from "jotai"
import { SetAtom } from "../types"

export interface Size {
  width: number
  height: number
}

const DEBOUNCE_TIME_MS = 500

/** A readonly atom that reflects the window size. */
export const windowSize = atom<Size>({ width: window.innerWidth, height: window.innerHeight })
windowSize.onMount = listenForResize

function listenForResize(set: SetAtom<[size: Size], void>): VoidFunction {
  let id = -1

  window.addEventListener('resize', onResize)

  return function unmount(): void {
    window.removeEventListener('resize', onResize);
  };

  function onResize(): void {
    clearTimeout(id)
    id = setTimeout(update, DEBOUNCE_TIME_MS)
  }

  function update(): void {
    set({ width: window.innerWidth, height: window.innerHeight })
  }
}

export const aspectRatio = atom(getAspectRatio)

function getAspectRatio(get: Getter): number {
  const { width, height } = get(windowSize)
  return width / height
}
