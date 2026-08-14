import { lazy, Suspense } from 'react';
import { totalStat } from '@assets/index';
import { loadSvgComponent } from '@/utils/svgUtils';

const GithubSvg = lazy(() => loadSvgComponent(totalStat, './github.svg'));

const GridSvg = lazy(() => loadSvgComponent(totalStat, './grid.svg'));

const SVGStat = () => (
  <div id="svgStat" className="svg-shell">
    <Suspense fallback={<div className="py-10 text-center text-mute">加载轨迹图...</div>}>
      <GithubSvg className="mt-2 h-auto w-full" />
      <GridSvg className="mt-4 h-auto w-full" />
    </Suspense>
  </div>
);

export default SVGStat;
