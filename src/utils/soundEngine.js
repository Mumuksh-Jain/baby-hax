/**
 * Sound Engine for Pip's Bedtime Website
 * Integrates:
 * - The uploaded faaahhh audio (fahhhhh.mp3)
 * - The uploaded vocal recording of Twinkle Twinkle Little Star (twinkle_vocal.mp3)
 * - Authentic music-box synthesized fallback
 * - Star collection chimes (single note, complementary two-note, etc.)
 * - Moon chord swells, tactile paper rustle, and cartoon fluster
 * Default is MUTED / Sound OFF until user opts in.
 */

let audioCtx = null;
let masterGain = null;
let soundEnabled = false;

// Cached decoded buffer for uploaded fahhhhh.mp3
let faahAudioBuffer = null;
let isLoadingFaah = false;

// Cached decoded buffer for uploaded twinkle_vocal.mp3
let twinkleVocalBuffer = null;
let isLoadingVocal = false;
let activeVocalSource = null;
let activeVocalGain = null;

// Active melody tracking for safe cancellation and zero leaks
let activeMelodyTimers = [];
let activeMelodyNodes = [];

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.22, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Preload and decode the uploaded fahhhhh.mp3 file
 */
export async function preloadFaahAudio() {
  if (faahAudioBuffer || isLoadingFaah) return faahAudioBuffer;
  isLoadingFaah = true;
  try {
    const ctx = getAudioContext();
    if (!ctx) return null;
    const res = await fetch('/assets/audio/fahhhhh.mp3');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    faahAudioBuffer = await ctx.decodeAudioData(arrayBuffer);
    return faahAudioBuffer;
  } catch (err) {
    console.warn('Could not decode /assets/audio/fahhhhh.mp3, using synthesized fallback:', err);
    return null;
  } finally {
    isLoadingFaah = false;
  }
}

/**
 * Preload and decode the shortened twinkle_vocal_short.mp3 file
 * Audio is pre-trimmed with FFmpeg to a natural musical phrase (~17.45s)
 * with transparent fade-in and smooth 0.5s bedtime fade-out.
 */
export async function preloadTwinkleVocalAudio() {
  if (twinkleVocalBuffer || isLoadingVocal) return twinkleVocalBuffer;
  isLoadingVocal = true;
  try {
    const ctx = getAudioContext();
    if (!ctx) return null;
    const res = await fetch('/assets/audio/twinkle_vocal_short.mp3');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    twinkleVocalBuffer = await ctx.decodeAudioData(arrayBuffer);
    return twinkleVocalBuffer;
  } catch (err) {
    console.warn('Could not decode /assets/audio/twinkle_vocal_short.mp3, will use synthesized fallback:', err);
    return null;
  } finally {
    isLoadingVocal = false;
  }
}

/**
 * Stop any active Twinkle synthesized melody immediately
 */
export function stopTwinkleMelody() {
  activeMelodyTimers.forEach((t) => clearTimeout(t));
  activeMelodyTimers = [];
  activeMelodyNodes.forEach((node) => {
    try {
      node.stop();
      node.disconnect();
    } catch (e) {}
  });
  activeMelodyNodes = [];
}

/**
 * Stop any active vocal recording playback immediately
 */
export function stopVocalLullaby() {
  if (activeVocalSource) {
    try {
      activeVocalSource.onended = null;
      activeVocalSource.stop();
      activeVocalSource.disconnect();
    } catch (e) {}
    activeVocalSource = null;
  }
  if (activeVocalGain) {
    try {
      activeVocalGain.disconnect();
    } catch (e) {}
    activeVocalGain = null;
  }
}

/**
 * Stop all orchestra audio (vocal + synthesized) safely
 */
export function stopAllOrchestraAudio() {
  stopVocalLullaby();
  stopTwinkleMelody();
}

export function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);
  if (soundEnabled) {
    const ctx = getAudioContext();
    if (ctx && masterGain) {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(0.22, ctx.currentTime);
    }
    // Eagerly preload uploaded audio on opt-in
    preloadFaahAudio();
    preloadTwinkleVocalAudio();
  } else {
    // Immediately stop active vocal recording if playing
    stopVocalLullaby();
    // Immediately silence synthesized melody nodes
    activeMelodyNodes.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    });
    activeMelodyNodes = [];
    if (audioCtx && masterGain) {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    }
  }
}

export function isSoundEnabled() {
  return soundEnabled;
}

/**
 * Helper to play a soft envelope-controlled tone
 */
function playTone({ freq, type = 'sine', duration = 0.25, gain = 0.5, detune = 0, pitchEnd = null }) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const noteGain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (detune) {
    osc.detune.setValueAtTime(detune, now);
  }
  if (pitchEnd !== null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(pitchEnd, 10), now + duration);
  }

  // Soft attack and gentle release to prevent clicking
  noteGain.gain.setValueAtTime(0.001, now);
  noteGain.gain.linearRampToValueAtTime(gain, now + 0.03);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(noteGain);
  noteGain.connect(masterGain);

  osc.start(now);
  osc.stop(now + duration);

  osc.onended = () => {
    osc.disconnect();
    noteGain.disconnect();
  };
}

/**
 * Play an authentic music-box comb chime
 */
function playMusicBoxNote(freq, duration = 0.9, gain = 0.38) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;

  // Primary tone (warm fundamental)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, now);

  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.0001, now);
  gain1.gain.linearRampToValueAtTime(gain, now + 0.015);
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc1.connect(gain1);
  gain1.connect(masterGain);

  // Metallic tine strike overtone (2.76x harmonic, decays fast)
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2.76, now);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.0001, now);
  gain2.gain.linearRampToValueAtTime(gain * 0.28, now + 0.008);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

  osc2.connect(gain2);
  gain2.connect(masterGain);

  osc1.start(now);
  osc1.stop(now + duration);
  osc2.start(now);
  osc2.stop(now + 0.25);

  activeMelodyNodes.push(osc1, osc2);

  osc1.onended = () => {
    osc1.disconnect();
    gain1.disconnect();
    activeMelodyNodes = activeMelodyNodes.filter((n) => n !== osc1);
  };
  osc2.onended = () => {
    osc2.disconnect();
    gain2.disconnect();
    activeMelodyNodes = activeMelodyNodes.filter((n) => n !== osc2);
  };
}

/**
 * Traditional Twinkle Twinkle Little Star pitches (C4 - A4)
 */
export const TWINKLE_SEQUENCE = [
  { note: 'C4', freq: 261.63, time: 0, starId: 1, duration: 0.8 },
  { note: 'C4', freq: 261.63, time: 680, starId: 2, duration: 0.8 },
  { note: 'G4', freq: 392.00, time: 1360, starId: 3, duration: 0.8 },
  { note: 'G4', freq: 392.00, time: 2040, starId: 1, duration: 0.8 },
  { note: 'A4', freq: 440.00, time: 2720, starId: 2, duration: 0.8 },
  { note: 'A4', freq: 440.00, time: 3400, starId: 3, duration: 0.8 },
  { note: 'G4', freq: 392.00, time: 4080, starId: 1, duration: 1.2 }, // Half note

  { note: 'F4', freq: 349.23, time: 5360, starId: 2, duration: 0.8 },
  { note: 'F4', freq: 349.23, time: 6040, starId: 3, duration: 0.8 },
  { note: 'E4', freq: 329.63, time: 6720, starId: 1, duration: 0.8 },
  { note: 'E4', freq: 329.63, time: 7400, starId: 2, duration: 0.8 },
  { note: 'D4', freq: 293.66, time: 8080, starId: 3, duration: 0.8 },
  { note: 'D4', freq: 293.66, time: 8760, starId: 1, duration: 0.8 },
  { note: 'C4', freq: 261.63, time: 9440, starId: 2, duration: 1.5 }, // Half note finish
];

export const TWINKLE_TOTAL_DURATION_MS = 11200; // ~11.2 seconds

/**
 * Fallback: Synthesized Twinkle Twinkle melody
 */
export function playTwinkleMelody({ onNoteStart, onComplete } = {}) {
  stopTwinkleMelody();

  TWINKLE_SEQUENCE.forEach((item, index) => {
    const timer = setTimeout(() => {
      if (soundEnabled) {
        playMusicBoxNote(item.freq, item.duration, 0.4);
      }
      if (onNoteStart) {
        onNoteStart(index, item.starId);
      }
    }, item.time);

    activeMelodyTimers.push(timer);
  });

  const completionTimer = setTimeout(() => {
    activeMelodyTimers = [];
    if (onComplete) {
      onComplete();
    }
  }, TWINKLE_TOTAL_DURATION_MS);

  activeMelodyTimers.push(completionTimer);
}

/**
 * PASS 01C.1: Play the uploaded vocal recording of Twinkle Twinkle Little Star
 * Routes through master sound system, respects mute, falls back to synthesized melody if unreadable.
 */
export async function playVocalLullaby({ onEnded } = {}) {
  stopAllOrchestraAudio();

  // Ensure vocal buffer is ready
  if (!twinkleVocalBuffer) {
    await preloadTwinkleVocalAudio();
  }

  const ctx = getAudioContext();
  if (twinkleVocalBuffer && ctx && masterGain) {
    if (soundEnabled) {
      const source = ctx.createBufferSource();
      source.buffer = twinkleVocalBuffer;

      const vocalGain = ctx.createGain();
      vocalGain.gain.setValueAtTime(0.001, ctx.currentTime);
      vocalGain.gain.linearRampToValueAtTime(0.75, ctx.currentTime + 0.04);

      source.connect(vocalGain);
      vocalGain.connect(masterGain);

      activeVocalSource = source;
      activeVocalGain = vocalGain;

      source.onended = () => {
        if (activeVocalSource === source) {
          activeVocalSource = null;
          activeVocalGain = null;
          try {
            source.disconnect();
            vocalGain.disconnect();
          } catch (e) {}
          if (onEnded) onEnded();
        }
      };

      source.start(0);
    }
    return {
      duration: twinkleVocalBuffer.duration,
      isVocal: true,
    };
  }

  // Fallback to synthesized music box
  console.info('Twinkle vocal buffer unavailable; using synthesized music-box fallback.');
  playTwinkleMelody({ onComplete: onEnded });
  return {
    duration: TWINKLE_TOTAL_DURATION_MS / 1000,
    isVocal: false,
  };
}

/**
 * Generate a white noise buffer for breathy synthesis
 */
function createNoiseBuffer(ctx, duration = 1.0) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Synthesized Vocal Sigh Fallback
 */
function playSynthesizedFaah(pitchMultiplier = 1.0) {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;
  const duration = 0.95;

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = createNoiseBuffer(ctx, duration);

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(3200, now);
  noiseFilter.Q.setValueAtTime(1.8, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.08);
  noiseGain.gain.exponentialRampToValueAtTime(0.04, now + 0.35);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);

  noiseSource.start(now);
  noiseSource.stop(now + duration);

  const fundamental = ctx.createOscillator();
  fundamental.type = 'triangle';
  const baseFreq = 310 * pitchMultiplier;
  fundamental.frequency.setValueAtTime(baseFreq, now);
  fundamental.frequency.exponentialRampToValueAtTime(baseFreq * 0.78, now + duration);

  const f1 = ctx.createBiquadFilter();
  f1.type = 'bandpass';
  f1.frequency.setValueAtTime(760, now);
  f1.Q.setValueAtTime(4.5, now);

  const f2 = ctx.createBiquadFilter();
  f2.type = 'bandpass';
  f2.frequency.setValueAtTime(1240, now);
  f2.Q.setValueAtTime(5.0, now);

  const f3 = ctx.createBiquadFilter();
  f3.type = 'bandpass';
  f3.frequency.setValueAtTime(2600, now);
  f3.Q.setValueAtTime(4.0, now);

  const vowelGain = ctx.createGain();
  vowelGain.gain.setValueAtTime(0.0001, now);
  vowelGain.gain.linearRampToValueAtTime(0.42, now + 0.16);
  vowelGain.gain.exponentialRampToValueAtTime(0.28, now + 0.55);
  vowelGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  fundamental.connect(f1);
  fundamental.connect(f2);
  fundamental.connect(f3);

  f1.connect(vowelGain);
  f2.connect(vowelGain);
  f3.connect(vowelGain);

  vowelGain.connect(masterGain);

  fundamental.start(now + 0.04);
  fundamental.stop(now + duration);

  fundamental.onended = () => {
    fundamental.disconnect();
    f1.disconnect();
    f2.disconnect();
    f3.disconnect();
    vowelGain.disconnect();
    noiseSource.disconnect();
    noiseFilter.disconnect();
    noiseGain.disconnect();
  };
}

/**
 * Main "FAAAHHH" Player:
 * Uses the user's uploaded fahhhhh.mp3 audio!
 * Supports pitch scaling for playful character variety.
 */
export function playFaahSound(pitchMultiplier = 1.0) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  if (faahAudioBuffer) {
    const source = ctx.createBufferSource();
    source.buffer = faahAudioBuffer;
    source.playbackRate.setValueAtTime(Math.max(0.6, Math.min(pitchMultiplier, 1.6)), ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.65, ctx.currentTime);

    source.connect(gainNode);
    gainNode.connect(masterGain);

    source.start(0);

    source.onended = () => {
      source.disconnect();
      gainNode.disconnect();
    };
    return;
  }

  // If not yet decoded, trigger preload and play synthesized fallback
  preloadFaahAudio();
  playSynthesizedFaah(pitchMultiplier);
}

/**
 * 1. Psst, Pip? — Soft whispery chime followed by gentle "faaahhh"
 */
export function playPsstSound() {
  if (!soundEnabled) return;
  playTone({ freq: 880, type: 'sine', duration: 0.16, gain: 0.35 });
  setTimeout(() => {
    playTone({ freq: 1174.66, type: 'sine', duration: 0.22, gain: 0.38 });
  }, 80);
  setTimeout(() => {
    playFaahSound(1.0); // Exact uploaded faaahhh sound!
  }, 200);
}

/**
 * 2. Poke Pip — Soft cartoon toy pop accompanied by vocal "faaahhh"
 */
export function playPipPokeSound(variant = 0) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const pitches = [
    { start: 350, end: 720, dur: 0.14, faahPitch: 1.0 }, // Natural faaahhh
    { start: 680, end: 280, dur: 0.18, faahPitch: 0.92 }, // Sleepy deeper faaahhh
    { start: 440, end: 554, dur: 0.16, faahPitch: 1.08 }, // Cheerful higher faaahhh
    { start: 523.25, end: 783.99, dur: 0.22, faahPitch: 0.96 }, // Gentle baby faaahhh
  ];
  const p = pitches[variant % pitches.length];

  playTone({ freq: p.start, pitchEnd: p.end, type: 'triangle', duration: p.dur, gain: 0.38 });

  setTimeout(() => {
    playFaahSound(p.faahPitch);
  }, 100);
}

/**
 * 3. Star 1 Twinkle — Crystalline single music-box chime
 */
const STAR_NOTES = [1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0]; // C6, D6, E6, G6, A6, C7

export function playStarSound(index = 0) {
  if (!soundEnabled) return;
  const freq = STAR_NOTES[index % STAR_NOTES.length];
  playTone({ freq, type: 'sine', duration: 0.35, gain: 0.4 });
  playTone({ freq: freq * 2, type: 'sine', duration: 0.2, gain: 0.15 });
}

/**
 * PASS 01C.1: Complementary two-note chime when Star 2 is collected
 * Harmonic pentatonic interval (E6 1318.51Hz -> G6 1567.98Hz)
 */
export function playStarTwoChime() {
  if (!soundEnabled) return;
  playTone({ freq: 1318.51, type: 'sine', duration: 0.32, gain: 0.38 });
  setTimeout(() => {
    playTone({ freq: 1567.98, type: 'sine', duration: 0.38, gain: 0.42 });
    playTone({ freq: 1567.98 * 2, type: 'sine', duration: 0.22, gain: 0.15 });
  }, 110);
}

/**
 * 4. Moon Toggle — Cozy bedtime chord swell accompanied by nightfall "faaahhh"
 */
export function playMoonSound(isNightlight) {
  if (!soundEnabled) return;
  const baseFreqs = isNightlight
    ? [392.0, 493.88, 587.33, 783.99] // G major chord for cozy nightlight on
    : [523.25, 659.25, 783.99, 1046.5]; // C major chord for daytime warm nursery

  baseFreqs.forEach((freq, idx) => {
    setTimeout(() => {
      playTone({ freq, type: 'sine', duration: 0.5, gain: 0.32 });
    }, idx * 60);
  });

  if (isNightlight) {
    setTimeout(() => {
      playFaahSound(0.95);
    }, 280);
  }
}

/**
 * 5. Tab Switch — Soft tactile paper rustle
 */
export function playTabSound() {
  if (!soundEnabled) return;
  playTone({ freq: 480, pitchEnd: 320, type: 'triangle', duration: 0.08, gain: 0.3 });
  setTimeout(() => {
    playTone({ freq: 620, pitchEnd: 420, type: 'sine', duration: 0.08, gain: 0.25 });
  }, 40);
}

/**
 * 6. Pip Panic Wobble — Cute cartoon fluster
 */
export function playPanicSound() {
  if (!soundEnabled) return;
  [580, 640, 520, 680, 560].forEach((freq, i) => {
    setTimeout(() => {
      playTone({ freq, type: 'triangle', duration: 0.09, gain: 0.28 });
    }, i * 65);
  });
}
