import { useAppSelector } from '../lib/redux/hooks';
import styles from './Progress.module.scss';

import {Progress as ProgressBar} from '@/components/ui/progress'


export function Progress() {
  const renderingPass = useAppSelector((state) => state.renderingPass);
  const numSamples = useAppSelector((state) => state.numSamples);
  const proportion = renderingPass / numSamples; // 0.0 - 1.0

  return (
    <div className={'p-5 place-items-center'}>
      <ProgressBar
        value={proportion}
        className={'w-8/12'}
      ></ProgressBar>
    </div>
  );
}
