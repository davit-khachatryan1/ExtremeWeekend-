/* Booking selection shared between Packages, Calculator, Dates and the form. */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { ADDONS, PACKAGES, SEASON, SITE, type AddonId, type PackageId } from '../config/content';

export interface BookingState {
  packageId: PackageId;
  people: number;
  /** quantity per add-on (tent sets, horse riders, drone 0/1 or people) */
  addons: Record<AddonId, number>;
  /** 'YYYY-MM-DD' of a departure Saturday, or 'custom' */
  date: string;
}

interface Ctx extends BookingState {
  set: (p: Partial<BookingState>) => void;
  setAddon: (id: AddonId, qty: number) => void;
}

const BookingCtx = createContext<Ctx | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>({
    packageId: '2day',
    people: 2,
    addons: { tent: 0, horse: 0, drone: 0 },
    date: '',
  });
  const value = useMemo<Ctx>(
    () => ({
      ...state,
      set: (p) => setState((s) => ({ ...s, ...p })),
      setAddon: (id, qty) => setState((s) => ({ ...s, addons: { ...s.addons, [id]: Math.max(0, qty) } })),
    }),
    [state],
  );
  return <BookingCtx.Provider value={value}>{children}</BookingCtx.Provider>;
}

export function useBooking() {
  const c = useContext(BookingCtx);
  if (!c) throw new Error('useBooking outside BookingProvider');
  return c;
}

/** Total / deposit for a selection. total = null when the package is "on request". */
export function computeTotal(s: BookingState) {
  const pkg = PACKAGES.find((p) => p.id === s.packageId)!;
  const base = pkg.price == null ? null : pkg.price * s.people;
  let addons = 0;
  for (const a of ADDONS) {
    const qty = s.addons[a.id] || 0;
    if (!qty) continue;
    addons += a.unit === 'group' ? a.price : a.price * qty;
  }
  const total = base == null ? null : base + addons;
  const deposit = total == null ? null : Math.round((total * SITE.booking.depositPercent) / 100 / 100) * 100;
  return { pkg, base, addons, total, deposit };
}

/* ---------- Departures (every Saturday in season, from today) ---------- */
export interface Departure {
  date: string; // Saturday, YYYY-MM-DD
  day: Date;
  seatsLeft: number;
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function upcomingDepartures(count = SEASON.showCount, from = new Date()): Departure[] {
  const out: Departure[] = [];
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() + 1); // never today
  // move to next Saturday
  while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
  let guard = 0;
  while (out.length < count && guard++ < 120) {
    const m = d.getMonth() + 1;
    const key = iso(d);
    if (m >= SEASON.startMonth && m <= SEASON.endMonth && !SEASON.skipDates.includes(key)) {
      out.push({ date: key, day: new Date(d), seatsLeft: Math.max(0, SEASON.capacity - (SEASON.seatsTaken[key] || 0)) });
    }
    d.setDate(d.getDate() + 7);
  }
  return out;
}
