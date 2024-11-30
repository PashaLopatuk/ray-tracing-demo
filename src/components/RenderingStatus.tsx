import { useAppSelector } from '../lib/redux/hooks';

export default function RenderingStatus() {
  const renderingPass = useAppSelector((state) => state.renderingPass);
  const elapsedTime = useAppSelector((state) => state.elapsedTime);
  const numSamples = useAppSelector((state) => state.numSamples);
  const etaTime = useAppSelector((state) => state.etaTime);
  const avgTime = useAppSelector((state) => state.avgTime);

  return (
    <div className={'grid grid-cols-3'}>
      <div className={''}>
        <div>Rendering Pass</div>
        <div>
          {renderingPass} / {numSamples}
        </div>
      </div>

      <div>
        <div>Elapsed Time</div>
        <div>{elapsedTime}</div>
      </div>

      <div>
        <div>Remaining Time</div>
        <div>{etaTime}</div>
      </div>

      <div>
        <div>Avg. Duration Per Pass</div>
        <div>{avgTime}</div>
      </div>
    </div>
  );
}
