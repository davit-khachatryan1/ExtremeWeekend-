/* Small motion helpers: split-text reveal, fade-up reveal, counters,
 * magnetic buttons and the mud-splash CTA. All respect reduced motion. */
import {
  createElement, useEffect, useRef, useState, type CSSProperties, type ElementType, type MouseEvent,
  type ReactNode,
} from 'react';
import { gsap } from '../lib/smooth';
import { isFinePointer, prefersReducedMotion } from '../lib/device';
import { num } from '../lib/format';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/** true once the element has entered the viewport */
export function useInView<T extends Element>(opts: IntersectionObserverInit = { rootMargin: '0px 0px -12% 0px' }) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setInView(true);
        io.disconnect();
      }
    }, opts);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, inView] as const;
}

/* ----------------------------------------------------------- SplitReveal */
export function SplitReveal({
  text,
  as = 'h2',
  className,
  delay = 0,
  stagger = 0.016,
  immediate = false,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  /** animate on mount instead of on scroll */
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const chars = el.querySelectorAll('.split-char');
    gsap.set(chars, { yPercent: 115, rotate: 5 });
    const play = () =>
      gsap.to(chars, { yPercent: 0, rotate: 0, duration: 1.05, ease: 'expo.out', stagger, delay, overwrite: true });
    if (immediate) {
      play();
      return;
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          play();
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text, delay, stagger, immediate]);

  const words = text.split(' ');
  return createElement(
    as,
    { ref, className, 'aria-label': text },
    words.map((w, i) => (
      <span key={`${text}-${i}`}>
        <span className="split-word" aria-hidden="true">
          {Array.from(w).map((c, j) => (
            <span key={j} className="split-char">
              {c}
            </span>
          ))}
        </span>
        {i < words.length - 1 ? ' ' : null}
      </span>
    )),
  );
}

/* ----------------------------------------------------------- Reveal (fade up) */
export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
  style?: CSSProperties;
}) {
  const [ref, inView] = useInView<HTMLElement>();
  const reduce = prefersReducedMotion();
  return createElement(
    as,
    {
      ref,
      className: cx(
        'transition-[opacity,translate] duration-[1100ms] ease-[cubic-bezier(.16,1,.3,1)]',
        inView || reduce ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className,
      ),
      style: { transitionDelay: `${delay}ms`, ...style },
    },
    children,
  );
}

/* ----------------------------------------------------------- Counter */
export function Counter({ value, prefix = '', suffix = '', className }: { value: number; prefix?: string; suffix?: string; className?: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  const out = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!inView || !out.current) return;
    if (prefersReducedMotion()) {
      out.current.textContent = num(value);
      return;
    }
    const o = { v: 0 };
    const tw = gsap.to(o, {
      v: value,
      duration: 2.2,
      ease: 'power3.out',
      onUpdate: () => {
        if (out.current) out.current.textContent = num(o.v);
      },
    });
    return () => {
      tw.kill();
    };
  }, [inView, value]);
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{`${prefix}${value}${suffix}`}</span>
      <span aria-hidden="true">
        {prefix}
        <span ref={out}>0</span>
        {suffix}
      </span>
    </span>
  );
}

/* ----------------------------------------------------------- Magnetic */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !isFinePointer() || prefersReducedMotion()) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength]);
  return ref;
}

/* ----------------------------------------------------------- Mud splash */
const MUD = ['#4A3626', '#5e4430', '#7a5a3c', '#b08a62', '#d9b98f', '#E8772E'];
export function splash(host: HTMLElement, clientX: number, clientY: number, n = 16) {
  if (prefersReducedMotion()) return;
  const r = host.getBoundingClientRect();
  const x0 = clientX - r.left;
  const y0 = clientY - r.top;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('span');
    const size = 3 + Math.random() * 8;
    p.style.cssText = `position:absolute;left:${x0}px;top:${y0}px;width:${size}px;height:${size * (0.7 + Math.random() * 0.6)}px;border-radius:50%;background:${MUD[(Math.random() * MUD.length) | 0]};pointer-events:none;z-index:2;`;
    host.appendChild(p);
    const a = Math.random() * Math.PI * 2;
    const d = 24 + Math.random() * 56;
    const tl = gsap.timeline({ onComplete: () => p.remove() });
    tl.to(p, { x: Math.cos(a) * d, duration: 0.7 + Math.random() * 0.3, ease: 'power2.out' }, 0)
      .to(p, { y: Math.sin(a) * d * 0.7 - 18, duration: 0.35, ease: 'power2.out' }, 0)
      .to(p, { y: `+=${30 + Math.random() * 30}`, duration: 0.5, ease: 'power2.in' }, 0.35)
      .to(p, { opacity: 0, scale: 0.4, duration: 0.35 }, 0.6);
  }
}

type CtaProps = {
  children: ReactNode;
  href?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  variant?: 'primary' | 'ghost' | 'dark' | 'light';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  target?: string;
  ariaLabel?: string;
};

/** Magnetic CTA with a mud-splash burst on hover. */
export function Cta({ children, href, onClick, variant = 'primary', className, type = 'button', disabled, target, ariaLabel }: CtaProps) {
  const ref = useMagnetic<HTMLElement>(0.3);
  const base =
    'relative inline-flex select-none items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold tracking-wide transition-[background,color,box-shadow,transform] duration-300 disabled:opacity-50 disabled:pointer-events-none';
  const look = {
    primary: 'bg-sunset text-forest shadow-[0_10px_30px_-10px_rgba(232,119,46,.8)] hover:bg-sunset-2',
    ghost: 'border border-offwhite/40 text-offwhite backdrop-blur-sm hover:bg-offwhite hover:text-forest',
    dark: 'bg-forest text-offwhite hover:bg-forest-2',
    light: 'bg-offwhite text-forest hover:bg-white',
  }[variant];
  const enter = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && ref.current) splash(ref.current, e.clientX, e.clientY);
  };
  const props = {
    ref,
    className: cx(base, look, className),
    onPointerEnter: enter,
    onClick,
    'aria-label': ariaLabel,
    'data-cursor': 'hover',
  };
  if (href)
    return createElement('a', { ...props, href, target, rel: target === '_blank' ? 'noopener noreferrer' : undefined }, children);
  return createElement('button', { ...props, type, disabled }, children);
}

/* ----------------------------------------------------------- Section header */
export function SectionHead({
  eyebrow,
  title,
  lead,
  align = 'left',
  tone = 'light',
  className,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <div className={cx(align === 'center' && 'mx-auto text-center', 'max-w-4xl', className)}>
      <Reveal>
        <p
          className={cx(
            'mb-4 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.22em]',
            tone === 'light' ? 'text-sunset' : 'text-sunset',
          )}
        >
          <span className="h-px w-8 bg-current" aria-hidden="true" />
          {eyebrow}
        </p>
      </Reveal>
      <SplitReveal
        text={title}
        className={cx(
          'font-display text-[clamp(40px,7vw,96px)] uppercase leading-[0.92]',
          tone === 'light' ? 'text-offwhite' : 'text-forest',
        )}
      />
      {lead && (
        <Reveal delay={150}>
          <p className={cx('mt-6 max-w-2xl text-lg leading-relaxed', align === 'center' && 'mx-auto', tone === 'light' ? 'text-offwhite/80' : 'text-forest/80')}>
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}
