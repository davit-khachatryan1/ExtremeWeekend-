/* Photo / video slot. Shows the real file when one is set in content.ts,
 * otherwise an illustrated placeholder so the layout is ready to swap. */
import { cx } from './motion';
import { Icon } from './Icon';

const TONES: Record<string, { bg: string; icon: string; sky: string; hill: string; hill2: string }> = {
  mud: { bg: 'from-[#5e4430] to-[#2b1f16]', icon: 'jeep', sky: '#c9a27a', hill: '#4a3626', hill2: '#2e2219' },
  river: { bg: 'from-[#4a7a8c] to-[#173444]', icon: 'waves', sky: '#9cc3cf', hill: '#2d5a36', hill2: '#173a24' },
  fire: { bg: 'from-[#3a1d10] to-[#0b1426]', icon: 'fire', sky: '#e8772e', hill: '#1d1a24', hill2: '#0b0f18' },
  sunrise: { bg: 'from-[#f29a55] to-[#5a3d6e]', icon: 'sunrise', sky: '#ffd49c', hill: '#3d2d4c', hill2: '#1f1830' },
  quest: { bg: 'from-[#0f2a1d] to-[#1f3a5f]', icon: 'puzzle', sky: '#5b8c3a', hill: '#153626', hill2: '#0b1426' },
  meadow: { bg: 'from-[#86a94e] to-[#2d5a36]', icon: 'flower', sky: '#cfe3ec', hill: '#5b8c3a', hill2: '#2f5a22' },
  food: { bg: 'from-[#9a3b26] to-[#3a1d10]', icon: 'food', sky: '#e8772e', hill: '#5a2c1c', hill2: '#2b140b' },
  stars: { bg: 'from-[#121e36] to-[#02050d]', icon: 'star', sky: '#3a4a80', hill: '#0f1834', hill2: '#050a14' },
  flag: { bg: 'from-[#5b8c3a] to-[#0f2a1d]', icon: 'flag', sky: '#cfe3ec', hill: '#2d5a36', hill2: '#153626' },
  trees: { bg: 'from-[#2d5a36] to-[#0f2a1d]', icon: 'trees', sky: '#86a94e', hill: '#1c4628', hill2: '#0f2a1d' },
  waves: { bg: 'from-[#4a7a8c] to-[#173444]', icon: 'waves', sky: '#9cc3cf', hill: '#2d5a36', hill2: '#173a24' },
  mountain: { bg: 'from-[#8f8273] to-[#2a3d6e]', icon: 'mountain', sky: '#cfe3ec', hill: '#6d5f4f', hill2: '#3d342b' },
  flower: { bg: 'from-[#86a94e] to-[#2d5a36]', icon: 'flower', sky: '#cfe3ec', hill: '#5b8c3a', hill2: '#2f5a22' },
  tent: { bg: 'from-[#e8772e] to-[#3d2d4c]', icon: 'tent', sky: '#f3d6ad', hill: '#5b8c3a', hill2: '#2d5a36' },
};

export function Media({
  image,
  video,
  tone,
  alt,
  label,
  className,
}: {
  image?: string;
  video?: string;
  tone: string;
  alt: string;
  /** small text in the placeholder (e.g. "Photo coming soon") */
  label?: string;
  className?: string;
}) {
  if (video)
    return (
      <video
        className={cx('h-full w-full object-cover', className)}
        src={video}
        poster={image || undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        aria-label={alt}
      />
    );
  if (image) return <img className={cx('h-full w-full object-cover', className)} src={image} alt={alt} loading="lazy" decoding="async" />;
  const t = TONES[tone] || TONES.meadow;
  return (
    <div role="img" aria-label={alt} className={cx('relative h-full w-full overflow-hidden bg-gradient-to-br', t.bg, className)}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx="300" cy="80" r="38" fill={t.sky} opacity="0.55" />
        <path d="M0 210 L70 140 L120 180 L190 100 L260 170 L320 120 L400 190 V300 H0Z" fill={t.hill} opacity="0.9" />
        <path d="M0 250 L90 200 L160 235 L240 190 L320 230 L400 210 V300 H0Z" fill={t.hill2} />
        <path d="M30 280 C120 250 200 270 260 248 S360 230 400 236" stroke="#E8772E" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" fill="none" opacity="0.9" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-offwhite/85">
        <Icon name={t.icon} size={40} strokeWidth={1.4} />
        {label && <span className="rounded-full bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.18em]">{label}</span>}
      </div>
    </div>
  );
}
