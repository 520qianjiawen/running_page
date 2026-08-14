import useActivities from '@/hooks/useActivities';
import { formatPace } from '@/utils/utils';
import { SHOW_ELEVATION_GAIN } from '@/utils/const';

const YearStat = ({
  year,
  onClick,
  active = false,
}: {
  year: string;
  onClick: (_year: string) => void;
  active?: boolean;
}) => {
  let { activities: runs, years } = useActivities();

  if (years.includes(year)) {
    runs = runs.filter((run) => run.start_date_local.slice(0, 4) === year);
  }
  let sumDistance = 0;
  let streak = 0;
  let sumElevationGain = 0;
  let heartRate = 0;
  let heartRateNullCount = 0;
  let totalMetersAvail = 0;
  let totalSecondsAvail = 0;
  runs.forEach((run) => {
    sumDistance += run.distance || 0;
    sumElevationGain += run.elevation_gain || 0;
    if (run.average_speed) {
      totalMetersAvail += run.distance || 0;
      totalSecondsAvail += (run.distance || 0) / run.average_speed;
    }
    if (run.average_heartrate) {
      heartRate += run.average_heartrate;
    } else {
      heartRateNullCount++;
    }
    if (run.streak) {
      streak = Math.max(streak, run.streak);
    }
  });
  sumDistance = parseFloat((sumDistance / 1000.0).toFixed(1));
  const elevation = Number(sumElevationGain).toFixed(0);
  const avgPace = formatPace(totalMetersAvail / totalSecondsAvail);
  const hasHeartRate = !(heartRate === 0);
  const avgHeartRate = (
    heartRate / (runs.length - heartRateNullCount)
  ).toFixed(0);

  return (
    <div
      className={`year-card${active ? ' active' : ''}`}
      onClick={() => onClick(year)}
    >
      <div className="year-card-head">
        <h3>{year === 'Total' ? '全部' : year}</h3>
        <span>{runs.length} 次</span>
      </div>
      <div className="year-metrics">
        <div>
          <strong>{sumDistance}</strong>
          <em>公里</em>
        </div>
        {SHOW_ELEVATION_GAIN && Number(elevation) > 0 && (
          <div>
            <strong>{elevation}</strong>
            <em>爬升</em>
          </div>
        )}
        <div>
          <strong>{avgPace}</strong>
          <em>配速</em>
        </div>
        <div>
          <strong>{streak} 天</strong>
          <em>连续</em>
        </div>
        {hasHeartRate && (
          <div>
            <strong>{avgHeartRate}</strong>
            <em>心率</em>
          </div>
        )}
      </div>
    </div>
  );
};

export default YearStat;
