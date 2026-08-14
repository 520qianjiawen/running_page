import React, { lazy, useState, Suspense } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import activities from '@/static/activities.json';
import styles from './style.module.css';
import { ACTIVITY_TOTAL } from "@/utils/const";
import { Activity as RunActivity, formatPace, formatRunPlace } from '@/utils/utils';
import { totalStat } from '@assets/index';
import { loadSvgComponent } from '@/utils/svgUtils';
import DaySharePoster from '@/components/DaySharePoster';

const MonthofLifeSvg = lazy(() => loadSvgComponent(totalStat, './mol.svg'));

// Define interfaces for our data structures
interface Activity {
  run_id?: number;
  start_date_local: string;
  distance: number;
  moving_time: string;
  type: string;
  location_country?: string;
  summary_polyline?: string;
  average_heartrate?: number | null;
}

interface ActivitySummary {
  totalDistance: number;
  totalTime: number;
  count: number;
  dailyDistances: number[];
  maxDistance: number;
  maxSpeed: number;
  location: string;
  heartRateSum: number;
  heartRateCount: number;
}

interface DisplaySummary {
  totalDistance: number;
  averageSpeed: number;
  totalTime: number;
  count: number;
  maxDistance: number;
  maxSpeed: number;
  location: string;
  averageHeartrate: number;
}

interface ChartData {
  day: number;
  distance: string;
}

interface ActivityCardProps {
  period: string;
  summary: DisplaySummary;
  dailyDistances: number[];
  interval: string;
  onOpenDay?: (_period: string) => void;
}

interface ActivityGroups {
  [key: string]: ActivitySummary;
}

type IntervalType = 'year' | 'month' | 'week' | 'day' | 'life';

const ActivityCard: React.FC<ActivityCardProps> = ({ period, summary, dailyDistances, interval, onOpenDay }) => {
    const generateLabels = (): number[] => {
        if (interval === 'month') {
            const [year, month] = period.split('-').map(Number);
            const daysInMonth = new Date(year, month, 0).getDate(); // Get the number of days in the month
            return Array.from({ length: daysInMonth }, (_, i) => i + 1);
        } else if (interval === 'week') {
            return Array.from({ length: 7 }, (_, i) => i + 1);
        } else if (interval === 'year') {
            return Array.from({ length: 12 }, (_, i) => i + 1); // Generate months 1 to 12
        }
        return [];
    };

    const data: ChartData[] = generateLabels().map((day) => ({
        day,
        distance: (dailyDistances[day - 1] || 0).toFixed(2), // Keep two decimal places
    }));

    const formatTime = (seconds: number): string => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        const parts = [];
        if (h > 0) parts.push(`${h}h`);
        parts.push(`${m}m`, `${s}s`);
        return parts.join(' ');
    };

    const formatPace = (speed: number): string => {
        if (speed === 0) return '0:00 min/km';
        const pace = 60 / speed; // min/km
        const totalSeconds = Math.round(pace * 60); // Total seconds per km
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} min/km`;
    };

    // Calculate Y-axis maximum value and ticks
    const yAxisMax = Math.ceil(Math.max(...data.map(d => parseFloat(d.distance))) + 10); // Round up and add buffer
    const yAxisTicks = Array.from({ length: Math.ceil(yAxisMax / 5) + 1 }, (_, i) => i * 5); // Generate arithmetic sequence

    return (
        <div
            className={`${styles.activityCard}${interval === 'day' ? ` ${styles.clickable}` : ''}`}
            onClick={interval === 'day' ? () => onOpenDay?.(period) : undefined}
            role={interval === 'day' ? 'button' : undefined}
        >
            <h2 className={styles.activityName}>{period}</h2>
            <div className={styles.activityDetails}>
                <p><strong>{ACTIVITY_TOTAL.TOTAL_DISTANCE_TITLE}:</strong> {summary.totalDistance.toFixed(2)} km</p>
                <p>
                    <strong>
                        {interval === 'day'
                            ? ACTIVITY_TOTAL.AVERAGE_PACE_TITLE
                            : ACTIVITY_TOTAL.AVERAGE_SPEED_TITLE}
                        :
                    </strong>{' '}
                    {formatPace(summary.averageSpeed)}
                </p>
                <p><strong>{ACTIVITY_TOTAL.TOTAL_TIME_TITLE}:</strong> {formatTime(summary.totalTime)}</p>
                {summary.averageHeartrate > 0 && (
                    <p>
                        <strong>{ACTIVITY_TOTAL.AVERAGE_HEART_RATE_TITLE}:</strong>{' '}
                        {Math.round(summary.averageHeartrate)} bpm
                    </p>
                )}
                {interval !== 'day' && (
                    <>
                        <p><strong>{ACTIVITY_TOTAL.ACTIVITY_COUNT_TITLE}:</strong> {summary.count}</p>
                        <p><strong>{ACTIVITY_TOTAL.MAX_DISTANCE_TITLE}:</strong> {summary.maxDistance.toFixed(2)} km</p>
                        <p><strong>{ACTIVITY_TOTAL.MAX_SPEED_TITLE}:</strong> {formatPace(summary.maxSpeed)}</p>
                    </>
                )}
                {interval === 'day' && summary.location && (
                    <p><strong>{ACTIVITY_TOTAL.LOCATION_TITLE}:</strong> {summary.location}</p>
                )}
                {interval === 'day' && (
                    <p className={styles.cardHint}>点击查看路线</p>
                )}
                {['month', 'week', 'year'].includes(interval) && (
                    <div className={styles.chart} style={{ height: '250px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="day" tick={{ fill: 'rgb(204, 204, 204)' }} />
                                <YAxis
                                    label={{ value: 'km', angle: -90, position: 'insideLeft', fill: 'rgb(204, 204, 204)' }}
                                    domain={[0, yAxisMax]}
                                    ticks={yAxisTicks}
                                    tick={{ fill: 'rgb(204, 204, 204)' }}
                                />
                                <Tooltip
                                    formatter={(value) => `${value} km`}
                                    contentStyle={{ backgroundColor: 'rgb(36, 36, 36)', border: '1px solid #444', color: 'rgb(204, 204, 204)' }}
                                    labelStyle={{ color: '#FF6B9D' }}
                                />
                                <Bar dataKey="distance" fill="#FF6B9D" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

const ActivityList: React.FC = () => {
    const [interval, setInterval] = useState<IntervalType>('month');
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const toggleInterval = (newInterval: IntervalType): void => {
        setInterval(newInterval);
        setSelectedDay(null);
    };

    const filterActivities = (activity: Activity): boolean => {
        return activity.type.toLowerCase() === 'run';
    };

    const convertTimeToSeconds = (time: string): number => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

    const groupActivities = (interval: IntervalType): ActivityGroups => {
        return (activities as Activity[]).filter(filterActivities).reduce((acc: ActivityGroups, activity) => {
            const date = new Date(activity.start_date_local);
            let key: string;
            let index: number;
            switch (interval) {
                case 'year':
                    key = date.getFullYear().toString();
                    index = date.getMonth(); // Return current month (0-11)
                    break;
                case 'month':
                    key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`; // Zero padding
                    index = date.getDate() - 1; // Return current day (0-30)
                    break;
                case 'week':
                    const currentDate = new Date(date.valueOf());
                    currentDate.setDate(currentDate.getDate() + 4 - (currentDate.getDay() || 7)); // Set to nearest Thursday (ISO weeks defined by Thursday)
                    const yearStart = new Date(currentDate.getFullYear(), 0, 1);
                    const weekNum = Math.ceil((((currentDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
                    key = `${currentDate.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
                    index = (date.getDay() + 6) % 7; // Return current day (0-6, Monday-Sunday)
                    break;
                case 'day':
                    key = activity.start_date_local.slice(0, 10);
                    index = 0; // Return 0
                    break;
                default:
                    key = date.getFullYear().toString();
                    index = 0; // Default return 0
            }

            if (!acc[key]) acc[key] = {
                totalDistance: 0,
                totalTime: 0,
                count: 0,
                dailyDistances: [],
                maxDistance: 0,
                maxSpeed: 0,
                location: '',
                heartRateSum: 0,
                heartRateCount: 0,
            };

            const distanceKm = activity.distance / 1000; // Convert to kilometers
            const timeInSeconds = convertTimeToSeconds(activity.moving_time);
            const speedKmh = timeInSeconds > 0 ? distanceKm / (timeInSeconds / 3600) : 0;

            acc[key].totalDistance += distanceKm;
            acc[key].totalTime += timeInSeconds;
            acc[key].count += 1;

            // Accumulate daily distances
            acc[key].dailyDistances[index] = (acc[key].dailyDistances[index] || 0) + distanceKm;

            if (distanceKm > acc[key].maxDistance) acc[key].maxDistance = distanceKm;
            if (speedKmh > acc[key].maxSpeed) acc[key].maxSpeed = speedKmh;
            if (activity.average_heartrate) {
                acc[key].heartRateSum += activity.average_heartrate;
                acc[key].heartRateCount += 1;
            }

            if (interval === 'day') {
              const place = formatRunPlace(activity);
              if (place) {
                acc[key].location = place;
              }
            }

            return acc;
        }, {});
    };

    const activitiesByInterval = groupActivities(interval);
    const selectedRuns = selectedDay
        ? (activities as RunActivity[]).filter(
            (activity) =>
                activity.type.toLowerCase() === 'run' &&
                activity.start_date_local.slice(0, 10) === selectedDay
          )
        : [];

    return (
        <div className={styles.activityList}>
            <div className={styles.filterContainer}>
                <select
                    onChange={(e) => toggleInterval(e.target.value as IntervalType)}
                    value={interval}
                >
                    <option value="year">{ACTIVITY_TOTAL.YEARLY_TITLE}</option>
                    <option value="month">{ACTIVITY_TOTAL.MONTHLY_TITLE}</option>
                    <option value="week">{ACTIVITY_TOTAL.WEEKLY_TITLE}</option>
                    <option value="day">{ACTIVITY_TOTAL.DAILY_TITLE}</option>
                    <option value="life">Life</option>
                </select>
            </div>

            {interval === 'life' && (
                <div className={styles.lifeContainer}>
                    <Suspense fallback={<div>Loading SVG...</div>}>
                        <MonthofLifeSvg />
                    </Suspense>
                </div>
            )}

            {interval !== 'life' && (
                <div className={styles.summaryContainer}>
                    {Object.entries(activitiesByInterval)
                        .sort(([a], [b]) => {
                            if (interval === 'day') {
                                return new Date(b).getTime() - new Date(a).getTime(); // Sort by date
                            } else if (interval === 'week') {
                                const [yearA, weekA] = a.split('-W').map(Number);
                                const [yearB, weekB] = b.split('-W').map(Number);
                                return yearB - yearA || weekB - weekA; // Sort by year and week number
                            } else {
                                const [yearA, monthA = 0] = a.split('-').map(Number);
                                const [yearB, monthB = 0] = b.split('-').map(Number);
                                return yearB - yearA || monthB - monthA; // Sort by year and month
                            }
                        })
                        .map(([period, summary]) => (
                            <ActivityCard
                                key={period}
                                period={period}
                                summary={{
                                    totalDistance: summary.totalDistance,
                                    averageSpeed: summary.totalTime ? (summary.totalDistance / (summary.totalTime / 3600)) : 0,
                                    totalTime: summary.totalTime,
                                    count: summary.count,
                                    maxDistance: summary.maxDistance,
                                    maxSpeed: summary.maxSpeed,
                                    location: summary.location,
                                    averageHeartrate: summary.heartRateCount
                                        ? summary.heartRateSum / summary.heartRateCount
                                        : 0,
                                }}
                                dailyDistances={summary.dailyDistances}
                                interval={interval}
                                onOpenDay={setSelectedDay}
                            />
                        ))}
                </div>
            )}
            {selectedDay && selectedRuns.length > 0 && (
                <DaySharePoster
                    date={selectedDay}
                    runs={selectedRuns}
                    onClose={() => setSelectedDay(null)}
                />
            )}
        </div>
    );
};

export default ActivityList;
