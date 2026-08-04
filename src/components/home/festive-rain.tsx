'use client';

import { useEffect, useState } from 'react';

const EMOJI = ['🪢', '🍫', '🟠', '🎁', '🌼'];

/** Long enough to be noticed on arrival, short enough not to become wallpaper. */
const RUN_FOR_MS = 20_000;

const DESKTOP_COUNT = 22;
const MOBILE_COUNT = 9;

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  emoji: string;
}

function build(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 9 + Math.random() * 7,
    size: 18 + Math.random() * 14,
    emoji: EMOJI[Math.floor(Math.random() * EMOJI.length)]!,
  }));
}

/**
 * A light shower of rakhis, chocolates and laddus over the hero.
 *
 * Three deliberate limits:
 *
 * It stops after twenty seconds. Something that falls forever stops being
 * festive by the third visit and quietly drains a phone battery in the
 * meantime.
 *
 * It never renders on the server. Every particle's position comes from
 * Math.random(), so the server and the browser would disagree on all of them
 * and React would report a hydration mismatch.
 *
 * It respects prefers-reduced-motion by not mounting at all, rather than by
 * hiding itself in CSS — for someone who gets motion sick, an animation that
 * runs invisibly is still work the browser is doing.
 */
export function FestiveRain() {
  const [particles, setParticles] = useState<Particle[] | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const count = window.matchMedia('(min-width: 768px)').matches
      ? DESKTOP_COUNT
      : MOBILE_COUNT;

    setParticles(build(count));

    const timer = setTimeout(() => setParticles(null), RUN_FOR_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!particles) return null;

  return (
    <div
      aria-hidden
      // fixed + overflow-hidden: a particle drifting past the right edge would
      // otherwise widen the page and give the whole site a horizontal scrollbar.
      // z-10 keeps it under the sticky header (z-40) so nothing rains over the menu.
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
    >
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="festive-particle absolute top-0 select-none"
          style={{
            left: `${particle.left}%`,
            fontSize: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          {particle.emoji}
        </span>
      ))}
    </div>
  );
}
