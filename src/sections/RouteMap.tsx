/* ROUTE — schematic topographic map generated from the same terrain as the 3D
 * scene (d3-contour), clickable checkpoints with popups, and the
 * "How to get to Koti" options. */
import { useMemo, useState } from 'react';
import { contours } from 'd3-contour';
import { CHECKPOINTS, PACKAGES, SITE, T } from '../config/content';
import { useLang } from '../lib/i18n';
import { price } from '../lib/format';
import { useBooking } from '../lib/booking';
import { scrollToTarget } from '../lib/smooth';
import { HALF, WORLD_SIZE, routeXZ, terrainHeight } from '../three/world';
import { Icon } from '../components/Icon';
import { Media } from '../components/Media';
import { Cta, Reveal, SectionHead, cx, useInView } from '../components/motion';

/* Map orientation: Koti top-right (north-east), camp bottom-left (south-west),
 * roughly like the real Tavush → Lori direction. */
const toMap = (x: number, z: number): [number, number] => [z + HALF, x + HALF];

const PALETTE = ['#cfdcb3', '#bccf98', '#a6c07e', '#8fb06a', '#7aa05a', '#a2a96a', '#bfae80', '#b59d7c', '#9c8670', '#86766a', '#ece8de'];

function useTopo() {
  return useMemo(() => {
    const N = 96;
    const values = new Array(N * N);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        // grid in MAP space → convert back to world: mapX = z + HALF, mapY = x + HALF
        const mx = (i / (N - 1)) * WORLD_SIZE;
        const my = (j / (N - 1)) * WORLD_SIZE;
        values[j * N + i] = terrainHeight(my - HALF, mx - HALF);
      }
    }
    const thresholds = Array.from({ length: 11 }, (_, k) => k * 9);
    const polys = contours().size([N, N]).thresholds(thresholds)(values);
    const scale = WORLD_SIZE / (N - 1);
    const toPath = (mp: (typeof polys)[number]) =>
      mp.coordinates
        .map((poly) =>
          poly
            .map((ring) => 'M' + ring.map(([x, y]) => `${(x * scale).toFixed(1)},${(y * scale).toFixed(1)}`).join('L') + 'Z')
            .join(''),
        )
        .join('');
    const layers = polys.map((p, k) => ({ d: toPath(p), fill: PALETTE[Math.min(PALETTE.length - 1, k)] }));
    // route path
    const pts: string[] = [];
    for (let k = 0; k <= 160; k++) {
      const [x, z] = routeXZ(k / 160);
      const [mx, my] = toMap(x, z);
      pts.push(`${mx.toFixed(1)},${my.toFixed(1)}`);
    }
    const route = 'M' + pts.join('L');
    const marks = CHECKPOINTS.map((c) => {
      const [x, z] = routeXZ(c.u);
      return toMap(x, z);
    });
    // regional border across the pass (between checkpoints 3 and 4)
    const [bx, bz] = routeXZ(0.6);
    const [bx2, bz2] = routeXZ(0.64);
    const [m1x, m1y] = toMap(bx, bz);
    const [m2x, m2y] = toMap(bx2, bz2);
    const dx = m2x - m1x, dy = m2y - m1y;
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l;
    const border = `M${m1x + nx * -260},${m1y + ny * -260} Q${m1x + 30},${m1y - 20} ${m1x + nx * 260},${m1y + ny * 260}`;
    return { layers, route, marks, border };
  }, []);
}

function TopoMap() {
  const { t } = useLang();
  const { layers, route, marks, border } = useTopo();
  const [active, setActive] = useState<number | null>(null);
  const [ref, inView] = useInView<HTMLDivElement>({ rootMargin: '0px 0px -20% 0px' });
  const cp = active != null ? CHECKPOINTS[active] : null;
  const pos = active != null ? marks[active] : null;

  return (
    <div ref={ref} className="relative">
      <div className="relative aspect-square w-full overflow-hidden rounded-[32px] border border-forest/10 bg-[#dfe6cc] shadow-[0_40px_80px_-40px_rgba(15,42,29,.45)]">
        <svg viewBox={`0 0 ${WORLD_SIZE} ${WORLD_SIZE}`} className="h-full w-full" role="img" aria-label={t(T.route.schematic)}>
          {layers.map((l, i) => (
            <path key={i} d={l.d} fill={l.fill} stroke="#0F2A1D" strokeOpacity={0.14} strokeWidth={0.6} />
          ))}
          <path d={border} fill="none" stroke="#0F2A1D" strokeOpacity=".35" strokeWidth="1.2" strokeDasharray="6 5" />
          <text x="236" y="36" className="fill-forest/60 font-display text-[15px] uppercase tracking-[0.3em]">
            Tavush
          </text>
          <text x="30" y="414" className="fill-forest/60 font-display text-[15px] uppercase tracking-[0.3em]">
            Lori
          </text>
          {/* route casing + animated dashed line */}
          <path d={route} fill="none" stroke="#F4F1EA" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
          <path
            d={route}
            fill="none"
            stroke="#E8772E"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={inView ? 0 : 1}
            style={{ transition: 'stroke-dashoffset 2.6s cubic-bezier(.65,0,.35,1)' }}
          />
          <path d={route} fill="none" stroke="#0F2A1D" strokeWidth="1" strokeDasharray="2 6" opacity=".5" />
          {marks.map(([x, y], i) => (
            <g
              key={i}
              transform={`translate(${x} ${y})`}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`${i + 1}. ${t(CHECKPOINTS[i].name)}`}
              aria-pressed={active === i}
              onClick={() => setActive(active === i ? null : i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActive(active === i ? null : i);
                }
              }}
              data-cursor="hover"
            >
              <circle r="13" fill="#E8772E" opacity=".35" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `pulse-ring 2.2s ease-out ${i * 0.25}s infinite` }} />
              <circle r="10" fill={active === i ? '#0F2A1D' : '#E8772E'} stroke="#F4F1EA" strokeWidth="2.5" />
              <text textAnchor="middle" dy="4" className="pointer-events-none fill-offwhite font-display text-[11px] font-bold">
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
        <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-offwhite/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-forest/70">
          {t(T.route.schematic)}
        </span>
        <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-forest/85 px-3 py-1.5 text-[12px] text-offwhite md:hidden">
          {t(T.route.mapHint)}
        </span>
        {/* desktop popup anchored to the marker */}
        {cp && pos && (
          <div
            className={cx(
              'absolute z-10 hidden w-[min(290px,46%)] md:block',
              // keep the card away from its marker: markers in the upper-right half → card bottom-left, and vice versa
              pos[0] + (WORLD_SIZE - pos[1]) > WORLD_SIZE ? 'bottom-4 left-4' : 'right-4 top-4',
            )}
          >
            <CheckpointCard i={active!} onClose={() => setActive(null)} />
          </div>
        )}
      </div>
      {/* mobile: card under the map */}
      {cp && (
        <div className="mt-4 md:hidden">
          <CheckpointCard i={active!} onClose={() => setActive(null)} />
        </div>
      )}
      <div className="mt-4 hidden items-center gap-2 text-[13px] text-forest/60 md:flex">
        <Icon name="pin" size={15} /> {t(T.route.mapHint)}
      </div>
    </div>
  );
}

function CheckpointCard({ i, onClose }: { i: number; onClose: () => void }) {
  const { t } = useLang();
  const c = CHECKPOINTS[i];
  return (
    <div className="overflow-hidden rounded-3xl bg-forest text-offwhite shadow-2xl" role="dialog" aria-label={t(c.name)}>
      <div className="relative h-36">
        <Media image={c.image} tone={c.icon} alt={t(c.name)} label={!c.image ? t(T.gallery.soon) : undefined} />
        <button
          type="button"
          onClick={onClose}
          aria-label={t(T.nav.close)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-forest/80 text-offwhite"
        >
          <Icon name="x" size={16} />
        </button>
        <span className="absolute bottom-3 left-3 rounded-full bg-sunset px-2.5 py-1 text-[12px] font-semibold text-forest">
          {t(T.route.altitude)}: ~{c.alt} {t(T.route.m)}
        </span>
      </div>
      <div className="p-5">
        <p className="text-[12px] uppercase tracking-[0.2em] text-sunset">
          {i + 1} / {CHECKPOINTS.length}
        </p>
        <h3 className="mt-1 font-display text-2xl uppercase leading-none">{t(c.name)}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-offwhite/75">{t(c.text)}</p>
        {i === CHECKPOINTS.length - 1 && (
          <a href={SITE.campMapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-sunset hover:underline">
            {t(T.route.openMap)} <Icon name="external" size={14} />
          </a>
        )}
      </div>
    </div>
  );
}

function GetThere() {
  const { t, lang } = useLang();
  const { set } = useBooking();
  const [sel, setSel] = useState(0);
  const opt = T.route.options[sel];
  const pkg = PACKAGES.find((p) => p.id === opt.price)!;
  const icons = ['bus', 'car', 'jeep', 'flag'];
  return (
    <div className="mt-10">
      <h3 className="font-display text-3xl uppercase text-forest">{t(T.route.getThere)}</h3>
      <div role="tablist" aria-label={t(T.route.getThere)} className="mt-4 grid grid-cols-1 gap-2 min-[440px]:grid-cols-2">
        {T.route.options.map((o, i) => (
          <button
            key={o.id}
            role="tab"
            type="button"
            aria-selected={sel === i}
            aria-controls="getthere-panel"
            onClick={() => setSel(i)}
            className={cx(
              'wrap-safe flex min-w-0 items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left text-[14px] font-semibold leading-tight transition-colors',
              sel === i ? 'border-forest bg-forest text-offwhite' : 'border-forest/15 bg-white/50 text-forest hover:border-forest/40',
            )}
          >
            <Icon name={icons[i]} size={20} className={sel === i ? 'text-sunset' : 'text-forest/60'} />
            {t(o.title)}
          </button>
        ))}
      </div>
      <div id="getthere-panel" role="tabpanel" className="mt-3 rounded-2xl bg-white/70 p-5 text-forest">
        <p className="leading-relaxed text-forest/85">{t(opt.text)}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="font-display text-2xl">
            {pkg.price != null ? (
              <>
                {price(pkg.price, lang)} <span className="font-sans text-sm text-forest/60">{t(T.packages.perPerson)}</span>
              </>
            ) : (
              <span className="text-lg">{t(T.packages.onRequest)}</span>
            )}
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-sunset hover:underline"
            onClick={() => {
              set({ packageId: pkg.id });
              scrollToTarget('#prices');
            }}
          >
            {t(pkg.name)} <Icon name="arrow" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function RouteSection() {
  const { t } = useLang();
  return (
    <section id="route" className="topo-dark relative z-10 bg-sand px-5 py-24 text-forest md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <SectionHead eyebrow={t(T.route.eyebrow)} title={t(T.route.title)} lead={t(T.route.lead)} tone="dark" />
          <Reveal delay={200}>
            <p className="mt-6 flex gap-3 rounded-2xl border-l-4 border-sunset bg-white/60 p-4 text-[15px] leading-relaxed text-forest/85">
              <Icon name="clock" size={22} className="mt-0.5 shrink-0 text-sunset" />
              {t(T.route.why)}
            </p>
          </Reveal>
          <GetThere />
          <p className="mt-6 flex items-start gap-2.5 text-[15px] leading-relaxed text-forest/75">
            <Icon name="jeep" size={20} className="mt-0.5 shrink-0 text-forest" />
            {t(T.route.returnText)}
          </p>
          <div className="mt-6">
            <Cta variant="dark" href={SITE.campMapUrl} target="_blank">
              <Icon name="pin" size={18} /> {t(T.route.openMap)}
            </Cta>
          </div>
        </div>
        <Reveal className="lg:sticky lg:top-24 lg:self-start">
          <TopoMap />
        </Reveal>
      </div>
    </section>
  );
}
