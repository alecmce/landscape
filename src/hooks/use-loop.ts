import { useAtomValue } from "jotai"
import { useEffect, useMemo, useState } from "react"
import { targetFrameMs } from "../state/frame-rate"

interface Loop {
  play: VoidFunction
  stop: VoidFunction
}

interface Fn {
  (): Promise<void>
}

export function useLoop(fn: Fn | null): Loop {
  const [isPlaying, setPlaying] = useState(true)

  const delayMs = useAtomValue(targetFrameMs)

  useEffect(() => {
    if (fn && isPlaying) {
      let id = requestAnimationFrame(iterate)
      let lastUpdate = -1

      return function dispose(): void {
        cancelAnimationFrame(id)
      }

      function iterate(): void {
        awaitIterate(fn!) // :20 guards fn from being null

        async function awaitIterate(fn: Fn): Promise<void> {
          await lastUpdate === -1 ? initialIterate(fn) : throttledIterate(fn)
          id = requestAnimationFrame(iterate)
        }
      }

      async function initialIterate(fn: Fn): Promise<void> {
        await fn()
        lastUpdate = performance.now()
      }

      async function throttledIterate(fn: Fn): Promise<void> {
        const now = performance.now()
        const sinceLastUpdate = now - lastUpdate
        if (sinceLastUpdate > delayMs) {
          await fn()
          lastUpdate = now
        }
      }

    }
  }, [isPlaying, delayMs, fn])

  return useMemo(() => {
    return { play, stop }

    function play(): void {
      setPlaying(true)
    }

    function stop(): void {
      setPlaying(true)
    }
  }, [setPlaying])
}
