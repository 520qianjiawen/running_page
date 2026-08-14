const tempCache = new Map<string, number | null>();

const pickHourlyTemp = (
  times: string[],
  values: Array<number | null>,
  hour: number
): number | null => {
  if (!times?.length || !values?.length) {
    return null;
  }
  const padded = String(hour).padStart(2, '0');
  const index = times.findIndex((time) => time.includes(`T${padded}:`));
  const value = values[index >= 0 ? index : 0];
  return typeof value === 'number' ? value : null;
};

const requestTemp = async (
  base: string,
  lat: number,
  lon: number,
  date: string,
  hour: number
): Promise<number | null> => {
  const url =
    `${base}?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}` +
    `&start_date=${date}&end_date=${date}` +
    `&hourly=temperature_2m&timezone=Asia/Shanghai`;
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return pickHourlyTemp(data?.hourly?.time || [], data?.hourly?.temperature_2m || [], hour);
};

export const fetchRunTemperature = async (
  lat: number,
  lon: number,
  date: string,
  hour: number
): Promise<number | null> => {
  const key = `${date}|${hour}|${lat.toFixed(2)}|${lon.toFixed(2)}`;
  if (tempCache.has(key)) {
    return tempCache.get(key) ?? null;
  }
  let temp = await requestTemp(
    'https://api.open-meteo.com/v1/forecast',
    lat,
    lon,
    date,
    hour
  );
  if (temp === null) {
    temp = await requestTemp(
      'https://archive-api.open-meteo.com/v1/archive',
      lat,
      lon,
      date,
      hour
    );
  }
  tempCache.set(key, temp);
  return temp;
};
