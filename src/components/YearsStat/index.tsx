import YearStat from '@/components/YearStat';
import useActivities from '@/hooks/useActivities';
import { INFO_MESSAGE } from '@/utils/const';

const YearsStat = ({
  year,
  onClick,
}: {
  year: string;
  onClick: (_year: string) => void;
}) => {
  const { years } = useActivities();
  const yearsArrayUpdate = [year, ...years.filter((x) => x !== year), 'Total'].filter(
    (value, index, arr) => arr.indexOf(value) === index
  );

  return (
    <aside className="panel">
      <div className="panel-title">年度</div>
      <p className="intro-text mb-4">{INFO_MESSAGE(years.length, year)}</p>
      {yearsArrayUpdate.map((item) => (
        <YearStat
          key={item}
          year={item}
          onClick={onClick}
          active={item === year}
        />
      ))}
    </aside>
  );
};

export default YearsStat;
