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
      <div className="inspector-heading">
        <span className="section-number">02</span>
        <div>
          <div className="panel-title">年度切片</div>
          <strong>{year === 'Total' ? '完整跑步档案' : `${year} 年度报告`}</strong>
        </div>
      </div>
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
