import useActivities from '@/hooks/useActivities';

const CitiesStat = ({ onClick }: { onClick: (_city: string) => void }) => {
  const { cities } = useActivities();

  const citiesArr = Object.entries(cities);
  citiesArr.sort((a, b) => b[1] - a[1]);
  return (
    <section className="mb-5">
      <div className="panel-title">城市</div>
      <div className="chip-cloud">
        {citiesArr.map(([city, distance]) => (
          <button
            key={city}
            type="button"
            className="chip"
            onClick={() => onClick(city)}
          >
            {city} <span>{(distance / 1000).toFixed(0)} km</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CitiesStat;
