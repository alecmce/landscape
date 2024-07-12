import { Box, Card, IconButton, Text } from "@chakra-ui/react";
import { ReactNode, Suspense, useState } from 'react';
import './App.css';

import { useAtom, useAtomValue } from 'jotai';
import { AtomUi } from './AtomUI';
import { useLoop } from './hooks/use-loop';
import { useOrbitControls } from "./hooks/use-orbit-controls";
import { cameraAtom } from "./state/camera";
import { landscape as landscapeAtom } from './state/landscape';
import { canvas as canvasAtom } from './state/webgpu-context';
import { windowSize } from './state/window-size';

export function App(): ReactNode {
  const [canvas, setCanvas] = useAtom(canvasAtom)
  const { width, height } = useAtomValue(windowSize)

  const landscape = useAtomValue(landscapeAtom)

  useOrbitControls({ canvas, cameraAtom, sensitivity: 3 })

  useLoop(landscape)

  return (
    <Suspense fallback={<Loading />}>
      <canvas className="canvas" ref={setCanvas} width={width} height={height} />
      <AtomUi label="Landscape" />
      { landscape ? <Info /> : <Fallback /> }
    </Suspense>
  )
}

function Loading(): ReactNode {
  return <div>Loading...</div>
}

function Info(): ReactNode {
  const [infoMinimized, setInfoMinimized] = useState(false)

  return (
    <Card variant="" className={`info ${infoMinimized ? 'minimized' : ''}`}>
      <Box>
        <IconButton size="sm" isRound aria-label="Toggle Minimized" icon={<MinimizeSvg />} onClick={onClick} />
      </Box>
      <Box p={2}>
        <Text fontSize="sm">
          Landscape Demo - in progress
        </Text>
      </Box>
    </Card>
  )

  function onClick(): void {
    setInfoMinimized(value => !value)
  }
}

function MinimizeSvg(): ReactNode {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
      <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
    </svg>
  )
}

function Fallback() {
  return (
    <div className="info">
      <p>Sorry, this demo only works in WebGPU enabled browsers.</p>
    </div>
  )
}
