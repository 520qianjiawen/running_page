import { useEffect, useMemo } from 'react';
import Map, { Layer, Source } from 'react-map-gl';
import useSiteMetadata from '@/hooks/useSiteMetadata';
import { MAPBOX_TOKEN, RUN_COLOR } from '@/utils/const';
import {
  Activity,
  formatPace,
  formatRunPlace,
  geoJsonForRuns,
  getBoundsForGeoData,
} from '@/utils/utils';
import styles from './style.module.css';
import '@/components/RunMap/mapbox.css';

interface DaySharePosterProps {
  date: string;
  runs: Activity[];
  onClose: () => void;
}

const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const formatClock = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
};

const movingSeconds = (movingTime: string): number => {
  if (!movingTime) return 0;
  const chunk = movingTime.includes(', ')
    ? movingTime.split(', ').slice(-1)[0]
    : movingTime;
  const [hours, minutes, seconds] = chunk.split(':').map(Number);
  return (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
};

const DaySharePoster = ({ date, runs, onClose }: DaySharePosterProps) => {
  const { siteTitle, siteUrl } = useSiteMetadata();

  const stats = useMemo(() => {
    const sorted = [...runs].sort((a, b) =>
      a.start_date_local.localeCompare(b.start_date_local)
    );
    const distance = sorted.reduce((sum, run) => sum + (run.distance || 0), 0);
    const seconds = sorted.reduce(
      (sum, run) => sum + movingSeconds(run.moving_time),
      0
    );
    const hrRuns = sorted.filter((run) => run.average_heartrate);
    const elevation = sorted.reduce(
      (sum, run) => sum + (run.elevation_gain || 0),
      0
    );
    const start = sorted[0]?.start_date_local.slice(11, 16) || '';
    const km = distance / 1000;
    const weekday = weekdayNames[new Date(`${date}T12:00:00`).getDay()];
    const prettyDate = date.replace(/-/g, '.');

    return {
      km,
      seconds,
      pace: seconds > 0 ? formatPace(distance / seconds) : '--',
      heartrate: hrRuns.length
        ? Math.round(
            hrRuns.reduce((sum, run) => sum + (run.average_heartrate || 0), 0) /
              hrRuns.length
          )
        : 0,
      elevation,
      start,
      count: sorted.length,
      location: formatRunPlace(sorted[0] || {}),
      weekday,
      prettyDate,
      kcal: Math.round(km * 65),
    };
  }, [date, runs]);

  const geoData = useMemo(() => geoJsonForRuns(runs), [runs]);
  const viewState = useMemo(() => getBoundsForGeoData(geoData), [geoData]);
  const hasRoute = geoData.features.some(
    (feature) => feature.geometry.coordinates.length > 1
  );

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <button className={styles.close} type="button" onClick={onClose}>
        关闭
      </button>
      <article
        className={styles.poster}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <span className={styles.brand}>{siteTitle}</span>
          <span className={styles.date}>
            {stats.prettyDate} {stats.weekday}
          </span>
          {stats.location && (
            <span className={styles.place}>{stats.location}</span>
          )}
        </header>

        <div className={styles.mapWrap}>
          {hasRoute ? (
            <Map
              {...viewState}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              mapboxAccessToken={MAPBOX_TOKEN}
              attributionControl={false}
              dragPan={false}
              scrollZoom={false}
              doubleClickZoom={false}
              touchZoomRotate={false}
              style={{ width: '100%', height: '100%' }}
            >
              <Source id="day-run" type="geojson" data={geoData}>
                <Layer
                  id="day-run-glow"
                  type="line"
                  paint={{
                    'line-color': RUN_COLOR,
                    'line-width': 8,
                    'line-blur': 6,
                    'line-opacity': 0.35,
                  }}
                  layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                />
                <Layer
                  id="day-run-line"
                  type="line"
                  paint={{
                    'line-color': RUN_COLOR,
                    'line-width': 3.4,
                    'line-opacity': 1,
                  }}
                  layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                />
              </Source>
            </Map>
          ) : (
            <div className={styles.mapEmpty}>这条记录没有轨迹</div>
          )}
        </div>

        <div className={styles.heroStat}>
          <strong>{stats.km.toFixed(2)}</strong>
          <span>公里</span>
        </div>

        <div className={styles.grid}>
          <div>
            <em>配速</em>
            <b>{stats.pace}</b>
          </div>
          <div>
            <em>用时</em>
            <b>{formatClock(stats.seconds)}</b>
          </div>
          <div>
            <em>心率</em>
            <b>{stats.heartrate ? `${stats.heartrate}` : '--'}</b>
          </div>
          <div>
            <em>开始</em>
            <b>{stats.start || '--'}</b>
          </div>
          <div>
            <em>热量</em>
            <b>{stats.kcal ? `${stats.kcal}` : '--'}</b>
          </div>
          <div>
            <em>{stats.elevation > 0 ? '爬升' : '次数'}</em>
            <b>
              {stats.elevation > 0
                ? `${Math.round(stats.elevation)}`
                : `${stats.count}`}
            </b>
          </div>
        </div>

        <footer className={styles.footer}>{siteUrl.replace(/^https?:\/\//, '')}</footer>
      </article>
      <p className={styles.hint}>截图这张卡片，就可以发朋友圈或小红书</p>
    </div>
  );
};

export default DaySharePoster;
