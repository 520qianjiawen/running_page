import { useMemo } from 'react';
import useActivities from '@/hooks/useActivities';
import useSiteMetadata from '@/hooks/useSiteMetadata';
import { intComma } from '@/utils/utils';

const OverviewHero = ({ selectedYear }: { selectedYear: string }) => {
  const { siteTitle } = useSiteMetadata();
  const { activities, years, thisYear } = useActivities();

  const stats = useMemo(() => {
    const focusYear = selectedYear === 'Total' ? thisYear : selectedYear;
    let totalDistance = 0;
    let yearDistance = 0;
    let streak = 0;

    activities.forEach((activity) => {
      totalDistance += activity.distance || 0;
      if (activity.start_date_local.startsWith(focusYear)) {
        yearDistance += activity.distance || 0;
      }
      if (activity.streak) {
        streak = Math.max(streak, activity.streak);
      }
    });

    return {
      totalKm: intComma((totalDistance / 1000).toFixed(0)),
      yearKm: intComma((yearDistance / 1000).toFixed(1)),
      count: intComma(String(activities.length)),
      yearCount: years.length,
      streak,
      focusYear,
    };
  }, [activities, selectedYear, thisYear, years]);

  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="hero-kicker">
          Since {years[years.length - 1] || '2020'} · {stats.yearCount} 年
        </div>
        <h1>{siteTitle}</h1>
        <p>
          用脚步把城市点亮。不要停下来，不要停下奔跑的脚步。
          下面是这些年留下的轨迹、配速和连续出勤。
        </p>
      </div>
      <div className="hero-metrics">
        <article className="metric-card">
          <div className="metric-label">总里程</div>
          <div className="metric-value">{stats.totalKm}</div>
        </article>
        <article className="metric-card">
          <div className="metric-label">活动次数</div>
          <div className="metric-value">{stats.count}</div>
        </article>
        <article className="metric-card">
          <div className="metric-label">最长连续</div>
          <div className="metric-value">{stats.streak}天</div>
        </article>
        <article className="metric-card">
          <div className="metric-label">{stats.focusYear} 里程</div>
          <div className="metric-value">{stats.yearKm}</div>
        </article>
      </div>
    </section>
  );
};

export default OverviewHero;
