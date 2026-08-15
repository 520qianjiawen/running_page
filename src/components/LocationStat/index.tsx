import YearStat from '@/components/YearStat';
import {
  CHINESE_LOCATION_INFO_MESSAGE_FIRST,
  CHINESE_LOCATION_INFO_MESSAGE_SECOND,
} from '@/utils/const';
import CitiesStat from './CitiesStat';
import LocationSummary from './LocationSummary';
import PeriodStat from './PeriodStat';

interface ILocationStatProps {
  changeYear: (_year: string) => void;
  changeCity: (_city: string) => void;
  changeTitle: (_title: string) => void;
}

const LocationStat = ({
  changeYear,
  changeCity,
  changeTitle,
}: ILocationStatProps) => (
  <aside className="panel">
    <div className="inspector-heading">
      <span className="section-number">01</span>
      <div>
        <div className="panel-title">足迹概览</div>
        <strong>这些年跑过的地方</strong>
      </div>
    </div>
    <p className="intro-text mb-4">
      {CHINESE_LOCATION_INFO_MESSAGE_FIRST}。
      <br />
      {CHINESE_LOCATION_INFO_MESSAGE_SECOND}。
    </p>
    <LocationSummary />
    <CitiesStat onClick={changeCity} />
    <PeriodStat onClick={changeTitle} />
    <div className="panel-title inspector-divider mt-5">全部年份</div>
    <YearStat year="Total" onClick={changeYear} />
  </aside>
);

export default LocationStat;
