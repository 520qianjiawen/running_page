import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import Map, { Layer, MapRef, Source } from 'react-map-gl';
import RunMarker from '@/components/RunMap/RunMarker';
import useSiteMetadata from '@/hooks/useSiteMetadata';
import { MAPBOX_TOKEN, RUN_COLOR } from '@/utils/const';
import {
  Activity,
  Coordinate,
  formatPace,
  coordinateForRun,
  formatRunPlace,
  geoJsonForRuns,
} from '@/utils/utils';
import { fetchRunTemperature } from '@/utils/weather';
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
  const [temperature, setTemperature] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveHint, setSaveHint] = useState('保存后可选存到相册');
  const posterRef = useRef<HTMLElement>(null);

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
    const best1k = sorted
      .map((run) => run.best_1k)
      .filter((value): value is number => typeof value === 'number' && value > 0);
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
      best1k: best1k.length ? Math.min(...best1k) : 0,
    };
  }, [date, runs]);

  useEffect(() => {
    const first = [...runs].sort((a, b) =>
      a.start_date_local.localeCompare(b.start_date_local)
    )[0];
    const point = first ? coordinateForRun(first) : null;
    if (!point) {
      return;
    }
    const hour = Number((first.start_date_local || '').slice(11, 13));
    let cancelled = false;
    fetchRunTemperature(point.lat, point.lon, date, Number.isFinite(hour) ? hour : 19)
      .then((value) => {
        if (!cancelled) {
          setTemperature(value);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTemperature(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [date, runs]);

  const sortedRuns = useMemo(
    () =>
      [...runs].sort((a, b) =>
        a.start_date_local.localeCompare(b.start_date_local)
      ),
    [runs]
  );
  const geoData = useMemo(() => geoJsonForRuns(sortedRuns), [sortedRuns]);
  const endpoints = useMemo(() => {
    const lines = geoData.features
      .map((feature) => feature.geometry.coordinates as Coordinate[])
      .filter((coords) => coords.length > 1);
    if (!lines.length) {
      return null;
    }
    const start = lines[0][0];
    const endLine = lines[lines.length - 1];
    const end = endLine[endLine.length - 1];
    return {
      startLon: start[0],
      startLat: start[1],
      endLon: end[0],
      endLat: end[1],
    };
  }, [geoData]);
  const routeBounds = useMemo(() => {
    let minLon = Infinity;
    let minLat = Infinity;
    let maxLon = -Infinity;
    let maxLat = -Infinity;
    for (const feature of geoData.features) {
      for (const [lon, lat] of (feature.geometry.coordinates as Coordinate[]) || []) {
        if (lon < minLon) minLon = lon;
        if (lat < minLat) minLat = lat;
        if (lon > maxLon) maxLon = lon;
        if (lat > maxLat) maxLat = lat;
      }
    }
    if (!Number.isFinite(minLon)) {
      return null;
    }
    return [
      [minLon, minLat],
      [maxLon, maxLat],
    ] as [[number, number], [number, number]];
  }, [geoData]);
  const hasRoute = geoData.features.some(
    (feature) => feature.geometry.coordinates.length > 1
  );
  const mapRef = useRef<MapRef>(null);

  const savePoster = useCallback(
    async (event: React.MouseEvent) => {
      event.stopPropagation();
      const poster = posterRef.current;
      if (!poster || saving) {
        return;
      }
      setSaving(true);
      setSaveHint('正在生成图片…');
      const mapWrap = poster.querySelector('[data-map-wrap]') as HTMLElement | null;
      const map = mapRef.current?.getMap?.();
      let overlay: HTMLImageElement | null = null;
      try {
        if (map && mapWrap) {
          overlay = document.createElement('img');
          overlay.src = map.getCanvas().toDataURL('image/png');
          overlay.alt = '';
          overlay.style.cssText =
            'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:6;';
          mapWrap.appendChild(overlay);
          if (!overlay.complete) {
            await new Promise<void>((resolve, reject) => {
              overlay!.onload = () => resolve();
              overlay!.onerror = () => reject(new Error('map snapshot failed'));
            });
          }
        }
        const blob = await toBlob(poster, {
          pixelRatio: Math.min(window.devicePixelRatio || 2, 3),
          cacheBust: true,
          backgroundColor: '#101217',
        });
        if (!blob) {
          throw new Error('empty image');
        }
        const file = new File([blob], `大猫跑步-${date}.png`, { type: 'image/png' });
        const nav = navigator as Navigator & {
          canShare?: (data: ShareData) => boolean;
        };
        if (nav.share && nav.canShare?.({ files: [file] })) {
          await nav.share({
            files: [file],
            title: `${siteTitle} ${date}`,
          });
          setSaveHint('已打开分享，点“存储图像”就能进相册');
        } else {
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.href = url;
          link.download = file.name;
          link.click();
          URL.revokeObjectURL(url);
          setSaveHint('图片已下载，可保存到相册');
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          setSaveHint('已取消');
        } else {
          setSaveHint('保存失败，请再试一次');
        }
      } finally {
        overlay?.remove();
        setSaving(false);
      }
    },
    [date, saving, siteTitle]
  );

  const fitRoute = useCallback(() => {
    const map = mapRef.current?.getMap?.();
    if (!map || !routeBounds) {
      return;
    }
    map.resize();
    map.fitBounds(routeBounds, {
      padding: 40,
      duration: 0,
      maxZoom: 14,
    });
  }, [routeBounds]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const frame = window.requestAnimationFrame(fitRoute);
    const timer = window.setTimeout(fitRoute, 180);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [onClose, fitRoute]);

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <button className={styles.close} type="button" onClick={onClose}>
        关闭
      </button>
      <article
        ref={posterRef}
        className={styles.poster}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <span className={styles.brand}>{siteTitle}</span>
          <span className={styles.date}>
            {stats.prettyDate} {stats.weekday}
          </span>
          {(stats.location || temperature !== null) && (
            <span className={styles.place}>
              {[
                stats.location,
                temperature !== null ? `${Math.round(temperature)}°C` : '',
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
          )}
        </header>

        <div className={styles.mapWrap} data-map-wrap>
          {hasRoute ? (
            <Map
              ref={mapRef}
              initialViewState={{
                longitude: routeBounds
                  ? (routeBounds[0][0] + routeBounds[1][0]) / 2
                  : 120.63,
                latitude: routeBounds
                  ? (routeBounds[0][1] + routeBounds[1][1]) / 2
                  : 31.79,
                zoom: 12,
                bounds: routeBounds ?? undefined,
                fitBoundsOptions: { padding: 40, maxZoom: 14 },
              }}
              onLoad={fitRoute}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              mapboxAccessToken={MAPBOX_TOKEN}
              preserveDrawingBuffer
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
              {endpoints && <RunMarker {...endpoints} />}
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
            <em>气温</em>
            <b>{temperature !== null ? `${Math.round(temperature)}°` : '--'}</b>
          </div>
          <div>
            <em>最快1公里</em>
            <b>{stats.best1k ? formatPace(1000 / stats.best1k) : '--'}</b>
          </div>
        </div>

        <footer className={styles.footer}>{siteUrl.replace(/^https?:\/\//, '')}</footer>
      </article>
      <div className={styles.actions} onClick={(event) => event.stopPropagation()}>
        <button
          className={styles.share}
          type="button"
          onClick={savePoster}
          disabled={saving}
        >
          {saving ? '生成中…' : '保存到相册'}
        </button>
        <p className={styles.hint}>{saveHint}</p>
      </div>
    </div>
  );
};

export default DaySharePoster;
