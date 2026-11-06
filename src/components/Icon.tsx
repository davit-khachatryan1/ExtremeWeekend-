/* One place for every icon used on the site (lucide + a few custom ones). */
import {
  ArrowRight, BatteryCharging, BookOpen, BriefcaseMedical, Building2, Bus, CalendarDays, Camera, CarFront, Check,
  ChevronDown, CircleHelp, Clock, CloudRain, Compass, CreditCard, Drone, ExternalLink, Flag, Flame, Flower2,
  Footprints, Gift, Glasses, IdCard, Languages, Mail, MapPin, Medal, Menu, Minus, Mountain, MountainSnow,
  Navigation, Phone, Pill, Plus, Puzzle, Radio, Shirt, ShieldCheck, ShowerHead, Signal, Sparkles, Star, Sun,
  Sunrise, Moon, Tent, TentTree, Toilet, Trees, Trophy, Umbrella, Users, Utensils, Baby, Volume2, VolumeX, Waves,
  WineOff, X, type LucideProps,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

type P = { size?: number; className?: string; strokeWidth?: number };

const svg = (paths: React.ReactNode) =>
  function Custom({ size = 24, className, strokeWidth = 1.75 }: P) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        {paths}
      </svg>
    );
  };

/* side view of a UAZ-style jeep */
export const JeepIcon = svg(
  <>
    <path d="M2.5 15.5v-3.2l1.6-.8 1.9-4.5h7.2l1.3 4.3h4.6l2.4 1.6v2.6h-1.6" />
    <path d="M9.2 15.5h5.6" />
    <circle cx="6.8" cy="15.8" r="2.1" />
    <circle cx="17" cy="15.8" r="2.1" />
    <path d="M7.4 7.3v3.9M10.8 7.3v4.2" />
    <path d="M1.8 11.5h1.4" />
  </>,
);
export const HorseIcon = svg(
  <>
    <path d="M7 21v-4.5c0-2.4 1.1-4 2.2-5.6L7.6 7.6l3.1 1.2 1.6-4.3 1.2 2.6c3.2.6 5.6 3.4 5.9 6.8l-1.6 1.1-2.7-1.6-1.5 2.4V21" />
    <path d="M14.6 9.6h.01" />
  </>,
);
export const TelegramIcon = svg(
  <>
    <path d="M21.2 4.1 2.9 11.2c-.8.3-.8 1.5.1 1.8l4.4 1.4 1.7 5.2c.2.7 1.1.9 1.6.4l2.5-2.4 4.6 3.4c.6.5 1.5.1 1.7-.7l3-14.1c.2-.9-.7-1.6-1.3-1.1Z" />
    <path d="m7.4 14.4 9.8-7" />
  </>,
);
export const InstagramIcon = svg(
  <>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.5 6.5h.01" />
  </>,
);
export const FacebookIcon = svg(<path d="M15 3h-2.4A4.6 4.6 0 0 0 8 7.6V10H5.5v4H8v7h4v-7h3l1-4h-4V7.9c0-.5.4-.9.9-.9H15Z" />);
export const TikTokIcon = svg(
  <>
    <path d="M14 3v11.6a3.6 3.6 0 1 1-3.6-3.6" />
    <path d="M14 3c.6 3 2.6 5 5.6 5.3" />
  </>,
);
export const CompassMark = svg(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5Z" />
  </>,
);

const MAP: Record<string, ComponentType<LucideProps> | ComponentType<P>> = {
  arrow: ArrowRight, battery: BatteryCharging, book: BookOpen, firstaid: BriefcaseMedical, building: Building2,
  bus: Bus, calendar: CalendarDays, camera: Camera, car: CarFront, check: Check, chevron: ChevronDown,
  help: CircleHelp, clock: Clock, rain: CloudRain, compass: Compass, card: CreditCard, drone: Drone,
  external: ExternalLink, flag: Flag, fire: Flame, flower: Flower2, hike: Footprints, gift: Gift, glasses: Glasses,
  id: IdCard, language: Languages, mail: Mail, pin: MapPin, medal: Medal, menu: Menu, minus: Minus,
  mountain: Mountain, mountainSnow: MountainSnow, gps: Navigation, phone: Phone, pill: Pill, plus: Plus,
  puzzle: Puzzle, radio: Radio, jacket: Shirt, shield: ShieldCheck, shower: ShowerHead, signal: Signal,
  sparkles: Sparkles, star: Star, sun: Sun, sunrise: Sunrise, moon: Moon, tent: Tent, canopy: TentTree,
  toilet: Toilet, trees: Trees, trophy: Trophy, umbrella: Umbrella, users: Users, food: Utensils, baby: Baby,
  soundOn: Volume2, soundOff: VolumeX, waves: Waves, noAlcohol: WineOff, x: X, shoes: Footprints,
  jeep: JeepIcon, horse: HorseIcon, telegram: TelegramIcon, instagram: InstagramIcon, facebook: FacebookIcon,
  tiktok: TikTokIcon, driver: JeepIcon, briefing: Users,
};

export function Icon({ name, size = 22, className, strokeWidth = 1.75 }: { name: string } & P) {
  const C = (MAP[name] || Sparkles) as ComponentType<SVGProps<SVGSVGElement> & P>;
  return <C size={size} className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
