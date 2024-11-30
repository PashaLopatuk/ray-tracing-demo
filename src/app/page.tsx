'use client';
import Canvas from '@/components/Canvas';
import Forms from '@/components/Forms';
import { Progress } from '@/components/Progress';
import StoreProvider from '@/components/StoreProvider';
import { defaultCanvasState } from '@/lib/types/ICanvasState';

export default function Home() {
  return (
    <StoreProvider>
      <main
        className={''}
        // style={{ width: `${defaultCanvasVars.canvasWd}px` }}
      >
        <Canvas />
        <Progress />
        <Forms />
      </main>
    </StoreProvider>
  );
}
