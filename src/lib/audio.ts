/* Site sound, built with the Web Audio API. Off by default (browsers only allow
 * sound after a click).
 *
 * Real recordings dropped into src/assets/sounds/ (see lib/soundFiles.ts) are
 * used automatically; anything missing falls back to the generated sound:
 *  - wind     : filtered noise with slow gusts (always, quietly)
 *  - engines  : the convoy in the hero — idles in Koti, revs while the jeeps drive
 *               with your scroll, silent once parked at the camp.
 *               uaz-idle / uaz-drive loops (crossfaded + pitched by speed), or a synth
 *  - gravel   : tyres on gravel while moving — gravel.mp3 or filtered noise
 *  - birds    : only at the top of the site (hero) and in the camp by day.
 *               birds/*.mp3 clear songs (one-shots, panned) over birds-ambience.mp3,
 *               or synthesized chirps when there are no files
 *  - night    : the birds fade out in the camp at night; an owl calls (owl.mp3 or synth)
 *  - campfire : low rumble + random crackles, louder as night falls in the camp */
import { useSyncExternalStore } from 'react';
import { scrollState } from './scrollState';
import { SOUND_FILES } from './soundFiles';
import { ROUTE_LENGTH } from '../three/world';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let crackleTimer = 0;
let birdTimer = 0;
let raf = 0;
/** 0…1 how much birdsong / owl the current part of the page should have (set in tick) */
let birdLevel = 0;
let owlLevel = 0;
/** pauses the bird ambience stream (set once the player exists) */
let pauseRecording: (() => void) | null = null;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/* ---------- on/off state shared by every sound button ---------- */
let soundOn = false;
const subs = new Set<() => void>();
export function useSoundOn() {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => soundOn,
  );
}

/* ---------- helpers ---------- */
function noiseBuffer(c: AudioContext, seconds = 4, brown = false) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    } else d[i] = w;
  }
  return buf;
}

function loopNoise(c: AudioContext, seconds: number, brown: boolean) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, seconds, brown);
  src.loop = true;
  src.start();
  return src;
}

/** soft saturation for a gritty engine tone */
function saturation(amount: number) {
  const n = 1024;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = Math.tanh(x * amount);
  }
  return curve;
}

/** fetch + decode a recording, downmixed to mono (half the memory; we pan ourselves) */
async function loadBuffer(c: AudioContext, url?: string): Promise<AudioBuffer | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await c.decodeAudioData(await res.arrayBuffer());
    if (buf.numberOfChannels === 1) return buf;
    const mono = c.createBuffer(1, buf.length, buf.sampleRate);
    const out = mono.getChannelData(0);
    for (let ch = 0; ch < buf.numberOfChannels; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < d.length; i++) out[i] += d[i] / buf.numberOfChannels;
    }
    return mono;
  } catch {
    return null;
  }
}

/** Turn any clip into a click-free loop: the tail is crossfaded into the head. */
function makeSeamless(c: AudioContext, buf: AudioBuffer, fadeSeconds = 0.3) {
  const L = buf.length;
  const X = Math.min(Math.floor(fadeSeconds * buf.sampleRate), Math.floor(L / 4));
  if (X < 16) return buf;
  const out = c.createBuffer(1, L - X, buf.sampleRate);
  const src = buf.getChannelData(0);
  const dst = out.getChannelData(0);
  for (let i = 0; i < L - X; i++) {
    if (i < X) {
      const t = i / X;
      dst[i] = src[i] * Math.sin((t * Math.PI) / 2) + src[L - X + i] * Math.cos((t * Math.PI) / 2);
    } else dst[i] = src[i];
  }
  return out;
}

function loopSource(c: AudioContext, buf: AudioBuffer, dest: AudioNode) {
  const s = c.createBufferSource();
  s.buffer = buf;
  s.loop = true;
  s.connect(dest);
  s.start(c.currentTime, Math.random() * buf.duration * 0.5); // random start → less repetitive
  return s;
}

function build() {
  const c = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  ctx = c;
  const out = c.createGain();
  master = out;
  out.gain.value = 0;
  out.connect(c.destination);

  /* ---------------------------------------------------------- wind */
  const windFilter = c.createBiquadFilter();
  windFilter.type = 'bandpass';
  windFilter.frequency.value = 500;
  windFilter.Q.value = 0.6;
  const windGain = c.createGain();
  windGain.gain.value = 0.5;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 300;
  lfo.connect(lfoGain).connect(windFilter.frequency);
  const lfo2 = c.createOscillator();
  lfo2.frequency.value = 0.05;
  const lfo2Gain = c.createGain();
  lfo2Gain.gain.value = 0.25;
  lfo2.connect(lfo2Gain).connect(windGain.gain);
  loopNoise(c, 6, true).connect(windFilter).connect(windGain).connect(master);
  lfo.start();
  lfo2.start();

  /* ---------------------------------------------------------- engines */
  const engineGain = c.createGain();
  engineGain.gain.value = 0;
  engineGain.connect(master);

  // --- generated engine (fallback): detuned sawtooths + sub square, burble, saturation
  const synthEngine = c.createGain();
  synthEngine.connect(engineGain);
  const tone = c.createGain();
  tone.gain.value = 0.32;
  const oscA = c.createOscillator();
  oscA.type = 'sawtooth';
  const oscB = c.createOscillator();
  oscB.type = 'sawtooth';
  oscB.detune.value = 18;
  const sub = c.createOscillator();
  sub.type = 'square';
  const subGain = c.createGain();
  subGain.gain.value = 0.45;
  oscA.connect(tone);
  oscB.connect(tone);
  sub.connect(subGain).connect(tone);
  const burble = c.createGain();
  burble.gain.value = 0.75;
  const burbleLfo = c.createOscillator();
  const burbleDepth = c.createGain();
  burbleDepth.gain.value = 0.25;
  burbleLfo.connect(burbleDepth).connect(burble.gain);
  const shaper = c.createWaveShaper();
  shaper.curve = saturation(2.6);
  shaper.oversample = '2x';
  const engineFilter = c.createBiquadFilter();
  engineFilter.type = 'lowpass';
  engineFilter.Q.value = 1.4;
  tone.connect(burble).connect(shaper).connect(engineFilter).connect(synthEngine);
  const exhaustFilter = c.createBiquadFilter();
  exhaustFilter.type = 'bandpass';
  exhaustFilter.frequency.value = 110;
  exhaustFilter.Q.value = 0.9;
  const exhaustGain = c.createGain();
  exhaustGain.gain.value = 0.55;
  loopNoise(c, 3, true).connect(exhaustFilter).connect(exhaustGain).connect(synthEngine);
  [oscA, oscB, sub, burbleLfo].forEach((o) => o.start());

  // --- recorded UAZ (uaz-idle / uaz-drive): two loops crossfaded by throttle
  const wantSamples = !!(SOUND_FILES.uazIdle || SOUND_FILES.uazDrive);
  const engineRec = {
    state: wantSamples ? ('loading' as 'loading' | 'ready' | 'failed') : ('failed' as 'loading' | 'ready' | 'failed'),
    single: false,
    idle: null as AudioBufferSourceNode | null,
    drive: null as AudioBufferSourceNode | null,
    gIdle: c.createGain(),
    gDrive: c.createGain(),
  };
  engineRec.gIdle.connect(engineGain);
  engineRec.gDrive.connect(engineGain);
  engineRec.gIdle.gain.value = 0;
  engineRec.gDrive.gain.value = 0;
  synthEngine.gain.value = wantSamples ? 0 : 1; // no synth flash while recordings load
  if (wantSamples) {
    Promise.all([loadBuffer(c, SOUND_FILES.uazIdle), loadBuffer(c, SOUND_FILES.uazDrive)]).then(([bi, bd]) => {
      const idleBuf = bi || bd;
      const driveBuf = bd || bi;
      if (!idleBuf || !driveBuf) {
        engineRec.state = 'failed';
        return;
      }
      engineRec.single = !bi || !bd;
      engineRec.idle = loopSource(c, makeSeamless(c, idleBuf), engineRec.gIdle);
      engineRec.drive = loopSource(c, makeSeamless(c, driveBuf), engineRec.gDrive);
      engineRec.state = 'ready';
    });
  }
  // engine start (one-shot, once per visit)
  let startBuf: AudioBuffer | null = null;
  let startPending = !!SOUND_FILES.uazStart;
  let startedOnce = false;
  let holdEngineUntil = 0;
  if (startPending) loadBuffer(c, SOUND_FILES.uazStart).then((b) => ((startBuf = b), (startPending = false)));

  // --- tyres on gravel / mud (only while moving)
  const gravelFilter = c.createBiquadFilter();
  gravelFilter.type = 'bandpass';
  gravelFilter.frequency.value = 2200;
  gravelFilter.Q.value = 0.7;
  const gravelGain = c.createGain();
  gravelGain.gain.value = 0;
  loopNoise(c, 2, false).connect(gravelFilter).connect(gravelGain).connect(master);
  const gravelRec = c.createGain();
  gravelRec.gain.value = 0;
  gravelRec.connect(master);
  let gravelReady = false;
  loadBuffer(c, SOUND_FILES.gravel).then((b) => {
    if (!b) return;
    loopSource(c, makeSeamless(c, b), gravelRec);
    gravelReady = true;
  });

  /* ---------------------------------------------------------- campfire */
  const fireGain = c.createGain();
  fireGain.gain.value = 0;
  fireGain.connect(master);
  const rumbleFilter = c.createBiquadFilter();
  rumbleFilter.type = 'lowpass';
  rumbleFilter.frequency.value = 260;
  const rumbleGain = c.createGain();
  rumbleGain.gain.value = 0.9;
  loopNoise(c, 4, true).connect(rumbleFilter).connect(rumbleGain).connect(fireGain);
  const crackleBuf = noiseBuffer(c, 0.05);
  const crackle = () => {
    if (!ctx) return;
    const src = c.createBufferSource();
    src.buffer = crackleBuf;
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 1500 + Math.random() * 3000;
    const g = c.createGain();
    const t = c.currentTime;
    g.gain.setValueAtTime(0.15 + Math.random() * 0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03 + Math.random() * 0.06);
    src.connect(f).connect(g).connect(fireGain);
    src.start(t);
    crackleTimer = window.setTimeout(crackle, 40 + Math.random() * 380);
  };
  crackle();

  /* ---------------------------------------------------------- birds */
  // bus with a short forest echo (songs + generated birds)
  const birdGain = c.createGain();
  birdGain.gain.value = 0;
  birdGain.connect(master);
  const echo = c.createDelay(1);
  echo.delayTime.value = 0.23;
  const echoFeedback = c.createGain();
  echoFeedback.gain.value = 0.28;
  const echoTone = c.createBiquadFilter();
  echoTone.type = 'lowpass';
  echoTone.frequency.value = 3000;
  const echoWet = c.createGain();
  echoWet.gain.value = 0.3;
  birdGain.connect(echo);
  // the owl has its own channel so it can call at night while the birds are silent
  const owlGain = c.createGain();
  owlGain.gain.value = 0;
  owlGain.connect(master);
  owlGain.connect(echo);
  echo.connect(echoTone).connect(echoFeedback).connect(echo);
  echo.connect(echoWet).connect(master);

  /** play a recorded one-shot, panned, on a bus */
  const playClip = (buf: AudioBuffer, t: number, pan: number, gain: number, bus: AudioNode, rate = 1) => {
    const s = c.createBufferSource();
    s.buffer = buf;
    s.playbackRate.value = rate;
    const g = c.createGain();
    g.gain.value = gain;
    const p = c.createStereoPanner();
    p.pan.value = pan;
    s.connect(g).connect(p).connect(bus);
    s.start(t);
    s.onended = () => {
      s.disconnect();
      g.disconnect();
      p.disconnect();
    };
    return s;
  };

  // --- recorded bird songs (birds/*): loaded in the background, played one at a time
  const songs: AudioBuffer[] = [];
  SOUND_FILES.birdSongs.forEach((url) => loadBuffer(c, url).then((b) => b && songs.push(b)));
  let songsPlaying = 0;
  let lastSong = -1;
  let nextSongAt = 0;
  const playSong = (t: number, pan: number) => {
    let i = Math.floor(Math.random() * songs.length);
    if (songs.length > 1 && i === lastSong) i = (i + 1) % songs.length;
    lastSong = i;
    songsPlaying++;
    const s = playClip(songs[i], t, pan, rnd(0.5, 1), birdGain, rnd(0.97, 1.03));
    s.addEventListener('ended', () => songsPlaying--);
  };

  // --- recorded owl
  let owlBuf: AudioBuffer | null = null;
  loadBuffer(c, SOUND_FILES.owl).then((b) => (owlBuf = b));

  // --- generated birds (fallback when there are no recordings)
  const voice = (
    t0: number,
    dur: number,
    peak: number,
    pan: number,
    freq: (p: AudioParam) => void,
    opts: { type?: OscillatorType; lp?: number; fm?: { rate: number; depth: number }; bus?: AudioNode } = {},
  ) => {
    const o = c.createOscillator();
    o.type = opts.type ?? 'sine';
    freq(o.frequency);
    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(peak, t0 + Math.min(0.02, dur * 0.3));
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    const panner = c.createStereoPanner();
    panner.pan.value = pan;
    let out: AudioNode = o;
    if (opts.lp) {
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = opts.lp;
      o.connect(f);
      out = f;
    }
    let fmLfo: OscillatorNode | null = null;
    if (opts.fm) {
      fmLfo = c.createOscillator();
      fmLfo.frequency.value = opts.fm.rate;
      const depth = c.createGain();
      depth.gain.value = opts.fm.depth;
      fmLfo.connect(depth).connect(o.frequency);
      fmLfo.start(t0);
      fmLfo.stop(t0 + dur + 0.05);
    }
    out.connect(env).connect(panner).connect(opts.bus ?? birdGain);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
    o.onended = () => {
      o.disconnect();
      env.disconnect();
      panner.disconnect();
      fmLfo?.disconnect();
    };
  };
  const chirps = (t: number, pan: number) => {
    const n = Math.floor(rnd(2, 6));
    const base = rnd(3000, 4600);
    const up = Math.random() < 0.5;
    for (let i = 0; i < n; i++) {
      const d = rnd(0.05, 0.09);
      const f0 = base * rnd(0.95, 1.05);
      voice(t, d, rnd(0.05, 0.09), pan, (p) => {
        p.setValueAtTime(up ? f0 * 0.8 : f0 * 1.2, t);
        p.exponentialRampToValueAtTime(up ? f0 * 1.2 : f0 * 0.8, t + d);
      });
      t += d + rnd(0.05, 0.12);
    }
  };
  const trill = (t: number, pan: number) => {
    const d = rnd(0.45, 0.9);
    const f0 = rnd(3800, 5200);
    voice(t, d, rnd(0.04, 0.07), pan, (p) => {
      p.setValueAtTime(f0, t);
      p.linearRampToValueAtTime(f0 * rnd(0.85, 1.1), t + d);
    }, { fm: { rate: rnd(26, 42), depth: rnd(350, 650) } });
  };
  const NOTES = [1500, 1700, 1900, 2000, 2250, 2500];
  const whistle = (t: number, pan: number) => {
    const n = Math.floor(rnd(3, 6));
    let f = NOTES[Math.floor(Math.random() * NOTES.length)];
    for (let i = 0; i < n; i++) {
      const d = rnd(0.1, 0.22);
      const next = NOTES[Math.floor(Math.random() * NOTES.length)];
      const from = f;
      voice(t, d, rnd(0.05, 0.08), pan, (p) => {
        p.setValueAtTime(from, t);
        p.linearRampToValueAtTime(next, t + d);
      }, { fm: { rate: 6, depth: 25 } });
      f = next;
      t += d + rnd(0.02, 0.08);
    }
  };
  let lastCuckoo = 0;
  const cuckoo = (t: number, pan: number) => {
    const reps = Math.floor(rnd(2, 4));
    for (let i = 0; i < reps; i++) {
      voice(t, 0.26, 0.06, pan, (p) => p.setValueAtTime(760, t), { type: 'triangle', lp: 1400 });
      voice(t + 0.36, 0.34, 0.05, pan, (p) => p.setValueAtTime(610, t + 0.36), { type: 'triangle', lp: 1400 });
      t += 1.1;
    }
  };
  let lastOwl = 0;
  const owl = (t: number, pan: number) => {
    if (owlBuf) {
      playClip(owlBuf, t, pan, 0.9, owlGain);
      return;
    }
    [
      [0, 0.42],
      [0.75, 0.16],
      [0.98, 0.5],
    ].forEach(([at, d]) =>
      voice(t + at, d, 0.08, pan, (p) => {
        p.setValueAtTime(400, t + at);
        p.linearRampToValueAtTime(355, t + at + d);
      }, { type: 'triangle', lp: 650, bus: owlGain }),
    );
  };

  /* ---- bird ambience recording (birds-ambience.*), two <audio> elements
   *      crossfading so the loop point is never heard. Streams, so it stays
   *      light on memory even on phones. */
  const recGain = c.createGain();
  recGain.gain.value = 0;
  recGain.connect(master);
  const XF = 3; // crossfade seconds
  const recording = (() => {
    const url = SOUND_FILES.birdsAmbience;
    const state = { active: false, playing: false, swapAt: 0, cur: 0 };
    if (!url) return { ...state, setPlaying: (_: boolean) => {}, update: () => {} };
    const players = [0, 1].map(() => {
      const el = new Audio(url);
      el.preload = 'auto';
      el.crossOrigin = 'anonymous';
      const g = c.createGain();
      g.gain.value = 0;
      c.createMediaElementSource(el).connect(g).connect(recGain);
      el.addEventListener('error', () => {
        state.active = false; // file missing / unsupported → generated birds
      });
      return { el, g };
    });
    state.active = true;
    // unlock both elements inside the user's click (needed on iOS)
    players.forEach((p, i) =>
      p.el
        .play()
        .then(() => {
          if (i === 1) p.el.pause();
        })
        .catch(() => {}),
    );
    players[0].g.gain.setTargetAtTime(1, c.currentTime, 0.8);
    state.playing = true;
    return {
      get active() {
        return state.active;
      },
      setPlaying(on: boolean) {
        if (on === state.playing || !state.active) return;
        state.playing = on;
        const p = players[state.cur];
        if (on) p.el.play().catch(() => {});
        else players.forEach((x) => x.el.pause());
      },
      /** called every frame: start the other copy XF seconds before the end */
      update() {
        if (!state.active || !state.playing) return;
        const a = players[state.cur];
        const d = a.el.duration;
        if (!isFinite(d) || d < XF * 3) return;
        if (d - a.el.currentTime < XF && performance.now() > state.swapAt) {
          const next = state.cur ^ 1;
          const b = players[next];
          b.el.currentTime = 0;
          b.el.play().catch(() => {});
          b.g.gain.setTargetAtTime(1, c.currentTime, XF / 3);
          a.g.gain.setTargetAtTime(0, c.currentTime, XF / 3);
          window.setTimeout(() => a.el.pause(), XF * 1000 + 500);
          state.cur = next;
          state.swapAt = performance.now() + XF * 1000 + 1000;
        }
      },
    };
  })();
  pauseRecording = () => recording.setPlaying(false);

  /* ---- bird scheduler: recorded songs > generated birds; owl at night */
  const scheduleBirds = () => {
    birdTimer = window.setTimeout(scheduleBirds, rnd(250, 700));
    if (!ctx || !soundOn || ctx.state !== 'running') return;
    const now = performance.now();
    const t = c.currentTime + 0.03;
    const pan = rnd(-0.8, 0.8);
    if (songs.length) {
      if (birdLevel > 0.05 && now >= nextSongAt && songsPlaying < 2) {
        playSong(t, pan);
        // denser at the very top of the site, sparser while driving / at dusk
        nextSongAt = now + rnd(1500, 6000) * (1.6 - birdLevel * 0.8);
      }
    } else if (!recording.active && birdLevel > 0.05 && Math.random() < birdLevel * 0.5) {
      const r = Math.random();
      if (r < 0.42) chirps(t, pan);
      else if (r < 0.66) trill(t, pan);
      else if (r < 0.9 || now - lastCuckoo < 12000) whistle(t, pan);
      else {
        cuckoo(t, pan * 0.5);
        lastCuckoo = now;
      }
    }
    if (owlLevel > 0.3 && now - lastOwl > rnd(7000, 15000)) {
      owl(t, pan);
      lastOwl = now;
    }
  };
  scheduleBirds();

  /* ---------------------------------------------------------- follow the page */
  // Same easing as the 3D convoy (see three/Jeep.tsx), so the engine revs exactly
  // while the jeeps are moving — also works for the no-3D fallback.
  let u = Math.min(1, Math.max(0, (scrollState.hero - 0.06) / 0.84));
  let load = 0;
  let last = performance.now();
  let bump = 0;
  let quietSince = performance.now();
  const tick = () => {
    if (!ctx) return;
    const now = performance.now();
    const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
    last = now;
    const t = c.currentTime;
    const mode = scrollState.mode;

    const target = mode === 'camp' ? 1 : Math.min(1, Math.max(0, (scrollState.hero - 0.06) / 0.84));
    const prev = u;
    u += (target - u) * (1 - Math.exp(-1.6 * dt));
    const speed = (Math.abs(u - prev) * ROUTE_LENGTH) / dt; // world units per second
    const throttle = Math.min(1, speed / 30);
    load += (throttle - load) * (1 - Math.exp(-(throttle > load ? 5 : 2) * dt));

    // engines run in the hero; they switch off once parked at the camp
    const parked = u > 0.995 && load < 0.04;
    const engineOn = mode === 'hero' && !parked;
    const wobble = Math.sin(now * 0.004) * 0.025 + Math.sin(now * 0.011) * 0.015; // terrain load
    const recorded = engineRec.state === 'ready';

    // one-time engine start when the engine first comes on
    if (engineOn && soundOn && !startedOnce && !startPending && (recorded || engineRec.state === 'failed')) {
      startedOnce = true;
      if (startBuf) {
        playClip(startBuf, t + 0.02, 0, 1, out);
        holdEngineUntil = now + startBuf.duration * 650; // idle fades in near the end of the start
      }
    }
    const hold = now < holdEngineUntil || (engineOn && (startPending || engineRec.state === 'loading'));

    if (recorded) {
      // equal-power crossfade idle → drive, pitch rises with speed
      const x = load;
      engineRec.gIdle.gain.setTargetAtTime(Math.cos((x * Math.PI) / 2), t, 0.08);
      engineRec.gDrive.gain.setTargetAtTime(Math.sin((x * Math.PI) / 2), t, 0.08);
      const w = 1 + wobble * 0.4;
      engineRec.idle!.playbackRate.setTargetAtTime((engineRec.single ? 0.8 + 0.15 * x : 1 + 0.1 * x) * w, t, 0.1);
      engineRec.drive!.playbackRate.setTargetAtTime((engineRec.single ? 0.9 + 0.45 * x : 0.85 + 0.4 * x) * w, t, 0.1);
      synthEngine.gain.setTargetAtTime(0, t, 0.2);
    } else {
      const f = (27 + 68 * load) * (1 + wobble * (0.4 + load));
      oscA.frequency.setTargetAtTime(f, t, 0.07);
      oscB.frequency.setTargetAtTime(f, t, 0.07);
      sub.frequency.setTargetAtTime(f / 2, t, 0.07);
      burbleLfo.frequency.setTargetAtTime(f / 4, t, 0.1);
      engineFilter.frequency.setTargetAtTime(220 + 1100 * load, t, 0.08);
      exhaustFilter.frequency.setTargetAtTime(90 + 120 * load, t, 0.1);
      synthEngine.gain.setTargetAtTime(engineRec.state === 'failed' ? 1 : 0, t, 0.2);
    }
    const engineLevel = recorded ? 0.45 + 0.35 * load : 0.2 + 0.6 * load;
    engineGain.gain.setTargetAtTime(engineOn && !hold ? engineLevel : 0, t, engineOn ? 0.15 : 0.6);

    // gravel crunch with random bumps (recording or noise)
    bump += (Math.random() - bump) * 0.15;
    const crunch = engineOn ? load * (0.12 + bump * 0.18) : 0;
    gravelGain.gain.setTargetAtTime(gravelReady ? 0 : crunch, t, 0.05);
    gravelRec.gain.setTargetAtTime(gravelReady ? crunch * 3.2 : 0, t, 0.08);
    // quieter wind while the engines are loud
    windGain.gain.setTargetAtTime(engineOn ? 0.5 - 0.25 * load : 0.5, t, 0.3);
    // campfire
    fireGain.gain.setTargetAtTime(mode === 'camp' ? 0.25 + scrollState.camp * 0.75 : 0.05, t, 0.4);
    // birds: top of the site (quieter once the engines run) and the camp by day; owl at night
    birdLevel =
      mode === 'hero'
        ? (1 - 0.5 * smooth(0.03, 0.12, scrollState.hero)) * (1 - 0.45 * load)
        : mode === 'camp'
          ? 1 - smooth(0.45, 0.75, scrollState.camp)
          : 0;
    owlLevel = mode === 'camp' ? smooth(0.7, 0.9, scrollState.camp) : 0;
    const songsOrSynth = songs.length > 0 || !recording.active;
    birdGain.gain.setTargetAtTime(songsOrSynth ? birdLevel * 0.9 : 0, t, 0.5);
    // ambience bed: full on its own, softer under clear songs
    recGain.gain.setTargetAtTime(recording.active ? birdLevel * (songs.length ? 0.35 : 0.85) : 0, t, 0.6);
    // pause the stream where there are no birds (other sections), resume when needed
    if (recording.active) {
      if (birdLevel > 0.02 && soundOn) {
        quietSince = now;
        recording.setPlaying(true);
      } else if (now - quietSince > (soundOn ? 3000 : 1200)) recording.setPlaying(false); // after the fade-out
      recording.update();
    }
    owlGain.gain.setTargetAtTime(owlLevel, t, 0.5);

    raf = requestAnimationFrame(tick);
  };
  tick();

  // pause the sound when the tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else if (soundOn) ctx.resume();
  });
}

export function setAmbientSound(on: boolean) {
  soundOn = on;
  subs.forEach((f) => f());
  if (on) {
    if (!ctx) build();
    ctx?.resume();
    master?.gain.setTargetAtTime(0.35, ctx!.currentTime, 0.6);
  } else if (ctx && master) {
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    window.setTimeout(() => {
      if (!soundOn) pauseRecording?.();
    }, 1200);
    const c = ctx;
    window.setTimeout(() => {
      if (!soundOn) c.suspend();
    }, 1500);
  }
}

export function disposeAudio() {
  clearTimeout(crackleTimer);
  clearTimeout(birdTimer);
  cancelAnimationFrame(raf);
  ctx?.close();
  ctx = null;
}
