import React, { useState } from 'react';
import {
  sortDateFunc,
  sortDateFuncReverse,
  convertMovingTime2Sec,
  Activity,
  RunIds,
} from '@/utils/utils';
import { SHOW_ELEVATION_GAIN, IS_CHINESE } from '@/utils/const';

import RunRow from './RunRow';
import styles from './style.module.css';

interface IRunTableProperties {
  runs: Activity[];
  locateActivity: (_runIds: RunIds) => void;
  setActivity: (_runs: Activity[]) => void;
  runIndex: number;
  setRunIndex: (_index: number) => void;
}

type SortFunc = (_a: Activity, _b: Activity) => number;

const RunTable = ({
  runs,
  locateActivity,
  setActivity,
  runIndex,
  setRunIndex,
}: IRunTableProperties) => {
  const [sortFuncInfo, setSortFuncInfo] = useState('');
  const labels = IS_CHINESE
    ? {
        KM: '公里',
        'Elevation Gain': '爬升',
        Pace: '配速',
        BPM: '心率',
        Time: '用时',
        Date: '日期',
      }
    : {
        KM: 'KM',
        'Elevation Gain': 'Elevation Gain',
        Pace: 'Pace',
        BPM: 'BPM',
        Time: 'Time',
        Date: 'Date',
      };

  const sortKMFunc: SortFunc = (a, b) =>
    sortFuncInfo === labels.KM ? a.distance - b.distance : b.distance - a.distance;
  const sortElevationGainFunc: SortFunc = (a, b) =>
    sortFuncInfo === labels['Elevation Gain']
      ? (a.elevation_gain ?? 0) - (b.elevation_gain ?? 0)
      : (b.elevation_gain ?? 0) - (a.elevation_gain ?? 0);
  const sortPaceFunc: SortFunc = (a, b) =>
    sortFuncInfo === labels.Pace
      ? a.average_speed - b.average_speed
      : b.average_speed - a.average_speed;
  const sortBPMFunc: SortFunc = (a, b) => {
    return sortFuncInfo === labels.BPM
      ? (a.average_heartrate ?? 0) - (b.average_heartrate ?? 0)
      : (b.average_heartrate ?? 0) - (a.average_heartrate ?? 0);
  };
  const sortRunTimeFunc: SortFunc = (a, b) => {
    const aTotalSeconds = convertMovingTime2Sec(a.moving_time);
    const bTotalSeconds = convertMovingTime2Sec(b.moving_time);
    return sortFuncInfo === labels.Time
      ? aTotalSeconds - bTotalSeconds
      : bTotalSeconds - aTotalSeconds;
  };

  const sortDateFuncClick =
    sortFuncInfo === labels.Date ? sortDateFunc : sortDateFuncReverse;

  const sortFuncMap = new Map([
    [labels.KM, sortKMFunc],
    [labels['Elevation Gain'], sortElevationGainFunc],
    [labels.Pace, sortPaceFunc],
    [labels.BPM, sortBPMFunc],
    [labels.Time, sortRunTimeFunc],
    [labels.Date, sortDateFuncClick],
  ]);
  if (!SHOW_ELEVATION_GAIN) {
    sortFuncMap.delete(labels['Elevation Gain']);
  }

  const handleClick: React.MouseEventHandler<HTMLElement> = (e) => {
    const funcName = ((e.target as HTMLElement).textContent || '').trim();
    const f = sortFuncMap.get(funcName);

    setRunIndex(-1);
    setSortFuncInfo(sortFuncInfo === funcName ? '' : funcName);
    setActivity(runs.sort(f));
  };

  return (
    <div className={`table-shell ${styles.tableContainer}`}>
      <table className={styles.runTable} cellSpacing="0" cellPadding="0">
        <thead>
          <tr>
            <th>类型</th>
            {Array.from(sortFuncMap.keys()).map((k) => (
              <th key={k} onClick={handleClick}>
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {runs.map((run, elementIndex) => (
            <RunRow
              key={run.run_id}
              elementIndex={elementIndex}
              locateActivity={locateActivity}
              run={run}
              runIndex={runIndex}
              setRunIndex={setRunIndex}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RunTable;
