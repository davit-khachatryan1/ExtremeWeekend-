/* Everything below the hero, loaded as a separate file right after the first
 * screen has painted — keeps the first download small on phones. The sections
 * are added a couple at a time while the browser is idle, so no single step
 * blocks the page (they are far below the 4-screen-tall hero). */
import { useEffect, useState } from 'react';
import { StickyBook } from '../components/StickyBook';
import { Booking } from './Booking';
import { CampSection } from './Camp';
import { Faq } from './Faq';
import { Footer } from './Footer';
import { Gallery, Reviews } from './Gallery';
import { Bring, Families, Included, Safety, Season } from './Info';
import { Itinerary } from './Itinerary';
import { Packages } from './Packages';
import { Quest } from './Quest';
import { RouteSection } from './RouteMap';
import { Numbers, Why } from './Why';

const SECTIONS = [Why, Numbers, RouteSection, Itinerary, Quest, CampSection, Packages, Included, Bring, Season, Families, Safety, Gallery, Reviews, Faq, Booking];

type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };

export default function BelowFold() {
  const [count, setCount] = useState(2);
  useEffect(() => {
    if (count >= SECTIONS.length) return;
    const w = window as IdleWindow;
    const next = () => setCount((c) => Math.min(SECTIONS.length, c + 2));
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(next, { timeout: 400 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(next, 40);
    return () => clearTimeout(id);
  }, [count]);
  return (
    <>
      {SECTIONS.slice(0, count).map((Section, i) => (
        <Section key={i} />
      ))}
    </>
  );
}

/** Footer + mobile "Book" bar (outside <main>). */
export function Tail({ ready }: { ready: boolean }) {
  return (
    <>
      <Footer />
      <StickyBook ready={ready} />
    </>
  );
}
