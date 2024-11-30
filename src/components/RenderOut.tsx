import { useCallback } from 'react';

import type { FC } from 'react';
import { defaultCanvasState, ICanvasState } from '@/lib/types/ICanvasState';
import { initMonkeyAndTeapotScene } from '@/scene/monkey-teapot-scene/init';
import { appActions, LoadingSpinner } from '@/lib/redux/appSlice';
import { Button } from '@/components/ui/button';
import { dataURLtoFile } from '@/utils/base64';

const renderOptions: ICanvasState = {
  ...defaultCanvasState,
  numBounces: 4,
  numSamples: 1000,
  canvasHt: 1000,
  canvasWd: 1000
}

const RenderOut: FC = ({}) => {

  const canvas = document.createElement('canvas')

  canvas.width = 1000
  canvas.height = 1000

  const render = useCallback(() => {
    initMonkeyAndTeapotScene({
      canvas: canvas,
      canvasState: renderOptions,

      onRenderReset: () => {
      },
      onLoading: () => {
      },
      onLoaded: () => {
      },
      onRenderUpdate: (params: {
        renderingPass: number,
        elapsedTime: Date,
        average: number,
        eta: Date,
      }) => {

      }
    }).then(() => {
      const imageString = canvas.toDataURL('image/png')

      const link = document.createElement('a')
      link.href = imageString
      link.download = 'image.png'
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      document.removeChild(canvas)
      // delete canvas
    })
  }, [])

  return (
    <>
      RenderOut

      <Button onClick={() => {
        render()
      }}>Render!</Button>
    </>
  );
};

export default RenderOut;