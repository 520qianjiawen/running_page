import useActivities from '@/hooks/useActivities';

const PeriodStat = ({ onClick }: { onClick: (_period: string) => void }) => {
  const { runPeriod } = useActivities();

  const periodArr = Object.entries(runPeriod);
  periodArr.sort((a, b) => b[1] - a[1]);
  return (
    <section>
      <div className="panel-title">时段</div>
      <div className="chip-cloud">
        {periodArr.map(([period, times]) => (
          <button
            key={period}
            type="button"
            className="chip"
            onClick={() => onClick(period)}
          >
            {period} <span>{times} 次</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default PeriodStat;
