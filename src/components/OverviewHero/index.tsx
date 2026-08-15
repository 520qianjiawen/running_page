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
          RUNNING JOURNAL · SINCE {years[years.length - 1] || '2020'}
        </div>
        <h1>{siteTitle}</h1>
        <p>
          用脚步把城市点亮。这里收录了 {stats.yearCount} 年间留下的路线、
          配速与连续出勤。
        </p>
      </div>
      <div className="hero-metrics">
        <article className="metric-card">
          <div className="metric-label">总里程</div>
          <div className="metric-value">{stats.totalKm}<small>KM</small></div>
        </article>
        <article className="metric-card">
          <div className="metric-label">活动次数</div>
          <div className="metric-value">{stats.count}<small>次</small></div>
        </article>
        <article className="metric-card">
          <div className="metric-label">最长连续</div>
          <div className="metric-value">{stats.streak}<small>天</small></div>
        </article>
        <article className="metric-card">
          <div className="metric-label">{stats.focusYear} 里程</div>
          <div className="metric-value">{stats.yearKm}<small>KM</small></div>
        </article>
      </div>
    </section>
  );
};

export default OverviewHero;
