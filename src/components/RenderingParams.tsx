import { appActions, ShadingMethod } from '../lib/redux/appSlice';
import { useAppDispatch, useAppSelector } from '../lib/redux/hooks';
import { Slider } from '@/components/ui/slider';

import { TableBody, Table, TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

const minSamples = 1;
const maxSamples = 3000;
const minBounces = 1;
const maxBounces = 16;
const minCameraFov = 10;
const maxCameraFov = 120;

export default function RenderingParams(): JSX.Element {
  const dispatch = useAppDispatch();
  const cameraFov = useAppSelector((state) => state.cameraFov);
  const numSamples = useAppSelector((state) => state.numSamples);
  const numBounces = useAppSelector((state) => state.numBounces);
  const shadingMethod = useAppSelector((state) => state.shadingMethod);
  const canvasScale = useAppSelector((state) => state.canvasScale)
  const canvasWidth = useAppSelector((state) => state.canvasWidth)
  const canvasHeight = useAppSelector((state) => state.canvasHeight)



  return (
    <form className={''}>
      <div className={'p-2 flex flex-col gap-2'}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className={''}>
                <div className={''}>Camera Field of View</div>
                <div className={''}>{cameraFov}</div>
              </TableCell>
              <TableCell className={''}>
                <label className={''}>{minCameraFov}</label>

                <Slider
                  min={minCameraFov}
                  max={maxCameraFov}
                  value={[cameraFov]}
                  onValueChange={(values) => {
                    dispatch(appActions.setCameraFov(values[0]))
                  }}
                />
                <label className={''}>{maxCameraFov}</label>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className={''}>
                <div className={''}># of Samples Per Pixel</div>
                <div className={''}>{numSamples}</div>
              </TableCell>
              <TableCell className={''}>
                <label className={''}>{minSamples}</label>
                <Slider
                  min={minSamples}
                  max={maxSamples}
                  value={[numSamples]}
                  // onChange={(event) => dispatch(appActions.setNumSamples(parseInt(event.target.value)))}
                  onValueChange={values => {
                    dispatch(appActions.setNumSamples(values[0]))
                  }}
                />
                <label className={''}>{maxSamples}</label>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className={''}>
                <div className={''}># of Ray Bounces</div>
                <div className={''}>{numBounces}</div>
              </TableCell>
              <TableCell className={''}>
                <label className={''}>{minBounces}</label>
                <input
                  type="range"
                  min={minBounces}
                  max={maxBounces}
                  value={numBounces}
                  onChange={(event) => dispatch(appActions.setNumBounces(parseInt(event.target.value)))}
                />
                <label className={''}>{maxBounces}</label>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Shading Method</TableCell>

              <TableCell className={''}>
                <div className="flex gap-2">
                  <Checkbox
                    value={ShadingMethod.flat}
                    checked={shadingMethod === ShadingMethod.flat}
                    // onChange={}
                    onCheckedChange={state => {
                      dispatch(appActions.setShadingMethod(ShadingMethod.flat))
                    }}
                  />
                  <label htmlFor="flat">Flat</label>
                </div>

                <div className="flex gap-2">
                  <Checkbox
                    value={ShadingMethod.phong}
                    checked={shadingMethod === ShadingMethod.phong}
                    // onChange={(event) => dispatch(appActions.setShadingMethod(parseInt(event.target.value)))}
                    onCheckedChange={state => {
                      dispatch(appActions.setShadingMethod(ShadingMethod.phong))
                    }}
                  />
                  <label htmlFor="phong">Phong</label>
                </div>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className={''}>
                <div className={''}>Canvas Scale in %</div>
                <div className={''}>{canvasScale}</div>
              </TableCell>
              <TableCell className={''}>
                <label className={''}>{canvasScale}</label>
                <input
                  type="range"
                  min={100}
                  max={200}
                  value={canvasScale}
                  onChange={(event) =>
                    dispatch(appActions.setCanvasScale(parseInt(event.target.value)))
                }
                />
                <label className={''}>{maxBounces}</label>
              </TableCell>
            </TableRow>

            {/*<TableRow>*/}
            {/*  <TableCell className={''}>*/}
            {/*    <div className={''}>Canvas size</div>*/}
            {/*    <div className={''}>{canvasWidth} x {canvasHeight}</div>*/}
            {/*  </TableCell>*/}
            {/*  <TableCell className={''}>*/}
            {/*    <label className={''}>{canvasWidth}</label>*/}
            {/*    <input*/}
            {/*      type="range"*/}
            {/*      min={100}*/}
            {/*      max={500}*/}
            {/*      value={canvasWidth}*/}
            {/*      onChange={(event) =>*/}
            {/*        dispatch(appActions.setCanvasWidth(parseInt(event.target.value)))*/}
            {/*      }*/}
            {/*    />*/}

            {/*    <label className={''}>{canvasHeight}</label>*/}
            {/*    <input*/}
            {/*      type="range"*/}
            {/*      min={100}*/}
            {/*      max={500}*/}
            {/*      value={canvasHeight}*/}
            {/*      onChange={(event) =>*/}
            {/*        dispatch(appActions.setCanvasHeight(parseInt(event.target.value)))*/}
            {/*      }*/}
            {/*    />*/}
            {/*    <label className={''}>{maxBounces}</label>*/}
            {/*  </TableCell>*/}
            {/*</TableRow>*/}

          </TableBody>
        </Table>
      </div>

    </form>
  );
}
