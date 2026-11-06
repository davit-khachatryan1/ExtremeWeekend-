/* Small compass cursor (desktop only). The needle points where you move. */
import { useEffect, useRef } from 'react';
import { isFinePointer, prefersReducedMotion } from '../lib/device';

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const needle = useRef<SVGGElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return;
    document.documentElement.classList.add('has-cursor');
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let cx = x, cy = y, angle = 0, targetAngle = 0, hover = 0, hoverT = 0, visible = false;
    let raf = 0;
    const move = (e: PointerEvent) => {
      const dx = e.clientX - x, dy = e.clientY - y;
      if (dx * dx + dy * dy > 4) targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      x = e.clientX;
      y = e.clientY;
      const el = e.target as HTMLElement | null;
      hoverT = el?.closest('a,button,[data-cursor="hover"],label,summary,select') ? 1 : 0;
      if (!visible && dot.current) {
        visible = true;
        dot.current.style.opacity = '1';
      }
    };
    const leave = () => {
      visible = false;
      if (dot.current) dot.current.style.opacity = '0';
    };
    const tick = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      let d = targetAngle - angle;
      d = ((d + 540) % 360) - 180;
      angle += d * 0.12;
      hover += (hoverT - hover) * 0.15;
      if (dot.current) dot.current.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) scale(${1 + hover * 0.5})`;
      if (needle.current) needle.current.style.transform = `rotate(${angle}deg)`;
      if (ring.current) ring.current.style.opacity = String(0.35 + hover * 0.65);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    raf = requestAnimationFrame(tick);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (typeof window !== 'undefined' && (!isFinePointer() || prefersReducedMotion())) return null;
  return (
    <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[110] opacity-0 transition-opacity duration-300" aria-hidden="true">
      <div ref={ring} className="absolute inset-0 rounded-full border border-sunset/80 bg-forest/30 backdrop-blur-[2px]" />
      <svg width="34" height="34" viewBox="0 0 34 34" className="relative block">
        <circle cx="17" cy="17" r="12.5" fill="none" stroke="#F4F1EA" strokeOpacity=".55" strokeWidth="1" />
        {[0, 90, 180, 270].map((a) => (
          <line key={a} x1="17" y1="3.5" x2="17" y2="6" stroke="#F4F1EA" strokeOpacity=".7" strokeWidth="1.2" transform={`rotate(${a} 17 17)`} />
        ))}
        <g ref={needle} style={{ transformOrigin: '17px 17px' }}>
          <path d="M17 7 L19.6 17 L17 15.6 L14.4 17 Z" fill="#E8772E" />
          <path d="M17 27 L19.6 17 L17 18.4 L14.4 17 Z" fill="#F4F1EA" />
        </g>
        <circle cx="17" cy="17" r="1.4" fill="#0F2A1D" />
      </svg>
    </div>
  );
}
