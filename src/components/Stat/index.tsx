import { intComma } from '@/utils/utils';

interface IStatProperties {
  value: string | number;
  description: string;
  className?: string;
  citySize?: number;
  onClick?: () => void;
}

const Stat = ({
  value,
  description,
  className = '',
  onClick,
}: IStatProperties) => (
  <div className={`stat-item ${className}`} onClick={onClick}>
    <span className="value">{intComma(value.toString())}</span>
    <span className="desc">{description}</span>
  </div>
);

export default Stat;
