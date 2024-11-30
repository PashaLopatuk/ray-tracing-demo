import { useCallback, useEffect, useRef } from 'react';
import { appActions, LoadingSpinner } from '../lib/redux/appSlice';
import { useAppDispatch, useAppSelector } from '../lib/redux/hooks';
import { ICanvasState, defaultCanvasState } from '../lib/types/ICanvasState';
import { initMonkeyAndTeapotScene } from '@/scene/monkey-teapot-scene/init';
import { Card } from '@/components/ui/card';


export default function Canvas() {
  const dispatch = useAppDispatch();
  const cameraFov = useAppSelector((state) => state.cameraFov);
  const numSamples = useAppSelector((state) => state.numSamples);
  const numBounces = useAppSelector((state) => state.numBounces);
  const shadingMethod = useAppSelector((state) => state.shadingMethod);
  const loadingSpinner = useAppSelector((state) => state.loadingSpinner);
  const canvasWidth = useAppSelector((state) => state.canvasWidth)
  const canvasHeight = useAppSelector((state) => state.canvasHeight)
  const canvasScale = useAppSelector((state) => state.canvasScale)

  const cvRef = useRef<ICanvasState>({ ...defaultCanvasState });
  const cv = cvRef.current;

  useEffect(() => {
    cv.renderingPass = 0;
    cv.restartRenderTimestamp = Date.now();

    cv.cameraFov = cameraFov;
    cv.numSamples = numSamples;
    cv.numBounces = numBounces;
    cv.shadingMethod = shadingMethod;

    dispatch(appActions.setRenderingPass(0));
    dispatch(appActions.setElapsedTime('00:00:00'));
    dispatch(appActions.setEtaTime('??:??:??'));
    dispatch(appActions.setAvgTime('????'));
  }, [cv, cameraFov, numSamples, numBounces, shadingMethod, dispatch]);

  const canvasCb = useCallback(
    (canvas: HTMLCanvasElement) => {
      initMonkeyAndTeapotScene({
        canvas: canvas,
        canvasState: cv,

        onRenderReset: () => {
          dispatch(appActions.setRenderingPass(0));
          dispatch(appActions.setElapsedTime('00:00:00'));
          dispatch(appActions.setEtaTime('??:??:??'));
          dispatch(appActions.setAvgTime('????'));
        },
        onLoading: () => {
          dispatch(appActions.setLoadingSpinner(LoadingSpinner.show))
        },
        onLoaded: () => {
          dispatch(appActions.setLoadingSpinner(LoadingSpinner.hide));
        },
        onRenderUpdate: (params: {
          renderingPass: number,
          elapsedTime: Date,
          average: number,
          eta: Date,
        }) => {
          dispatch(appActions.setRenderingPass(params.renderingPass))
          dispatch(appActions.setElapsedTime(params.elapsedTime.toISOString()))
          dispatch(appActions.setEtaTime(params.eta.toISOString().slice(11, 19)))
          dispatch(appActions.setAvgTime(`${params.average}ms`))
        }
      }).then();
    }, [cv, dispatch],
  );

  return (
    <div className={'flex justify-center items-center'}>
      <Card className={''}>
        {loadingSpinner === LoadingSpinner.show && <div className="spinner" />}
        <canvas
          className={'rounded-xl p-10'}
          style={{
            scale: `${canvasScale}%`
          }}
          ref={canvasCb}
          width={canvasWidth}
          height={canvasHeight}
        >
          Please use a GPU and browser that supports WebGL 2
        </canvas>
      </Card>
    </div>
  );
}
