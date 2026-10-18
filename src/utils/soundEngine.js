/**
 * Sound Engine for Pip's Bedtime Website
 * Uses Web Audio API to synthesize gentle, nostalgic toy sounds and vocal sighs.
 * Zero external audio files, zero network requests, zero clipping.
 * Default is MUTED / Sound OFF until user opts in.
 */

let audioCtx = null;
let masterGain = null;
let soundEnabled = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);
  if (soundEnabled) {
    const ctx = getAudioContext();
    if (ctx && masterGain) {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
    }
  } else {
    // Immediately silence everything
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
  osc.stop(now + duration + 0.05);

  osc.onended = () => {
    osc.disconnect();
    noteGain.disconnect();
  };
}

/**
 * Generate a white noise buffer for breathy/wind/fricative synthesis
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
 * "FAAAHHH" Sleepy Vocal Bedtime Sigh
 * Synthesizes a gentle, breathy baby/storybook vocal sigh:
 * 1. Initial breathy fricative ("f...") via soft high-passed noise.
 * 2. Warm resonant vowel ("...aaahhh...") using acoustic vocal formant filters (F1: 750Hz, F2: 1220Hz, F3: 2600Hz)
 *    over a gentle descending glissando fundamental tone with soft breath shimmer.
 */
export function playFaahSound(pitchMultiplier = 1.0) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;
  const duration = 0.95;

  // 1. Initial soft "f..." breath puff (fricative noise)
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = createNoiseBuffer(ctx, duration);

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(3200, now);
  noiseFilter.Q.setValueAtTime(1.8, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  // Soft gentle "f" swell
  noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.08);
  noiseGain.gain.exponentialRampToValueAtTime(0.04, now + 0.35);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);

  noiseSource.start(now);
  noiseSource.stop(now + duration);

  // 2. Warm Vowel "...aaahhh" Formant Synthesis
  const fundamental = ctx.createOscillator();
  fundamental.type = 'triangle'; // Rich warm harmonics

  const baseFreq = 310 * pitchMultiplier; // Friendly, cozy baby vocal range (~D#4)
  fundamental.frequency.setValueAtTime(baseFreq, now);
  // Gentle downward sigh glide as Pip exhales
  fundamental.frequency.exponentialRampToValueAtTime(baseFreq * 0.78, now + duration);

  // Formant 1: ~750 Hz (Vowel /ɑː/ throat resonance)
  const f1 = ctx.createBiquadFilter();
  f1.type = 'bandpass';
  f1.frequency.setValueAtTime(760, now);
  f1.Q.setValueAtTime(4.5, now);

  // Formant 2: ~1220 Hz (Vowel /ɑː/ oral cavity resonance)
  const f2 = ctx.createBiquadFilter();
  f2.type = 'bandpass';
  f2.frequency.setValueAtTime(1240, now);
  f2.Q.setValueAtTime(5.0, now);

  // Formant 3: ~2600 Hz (Airy brightness)
  const f3 = ctx.createBiquadFilter();
  f3.type = 'bandpass';
  f3.frequency.setValueAtTime(2600, now);
  f3.Q.setValueAtTime(4.0, now);

  const vowelGain = ctx.createGain();
  vowelGain.gain.setValueAtTime(0.0001, now);
  // Crossfade smoothly from "f" into warm "aaah"
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

  // Clean up
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
 * 1. Psst, Pip? — Soft whispery chime followed by gentle sleepy "faaahhh"
 */
export function playPsstSound() {
  if (!soundEnabled) return;
  playTone({ freq: 880, type: 'sine', duration: 0.16, gain: 0.35 });
  setTimeout(() => {
    playTone({ freq: 1174.66, type: 'sine', duration: 0.22, gain: 0.38 });
  }, 80);
  setTimeout(() => {
    playFaahSound(1.05); // Pip sighs "faaahhh~"
  }, 220);
}

/**
 * 2. Poke Pip — Soft cartoon toy pop accompanied by vocal "faaahhh" sigh
 */
export function playPipPokeSound(variant = 0) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const pitches = [
    { start: 350, end: 720, dur: 0.14, faahPitch: 1.0 }, // Curious squeak up
    { start: 680, end: 280, dur: 0.18, faahPitch: 0.88 }, // Clumsy slide down
    { start: 440, end: 554, dur: 0.16, faahPitch: 1.12 }, // Playful double pop
    { start: 523.25, end: 783.99, dur: 0.22, faahPitch: 0.95 }, // Little surprise chirp
  ];
  const p = pitches[variant % pitches.length];

  playTone({ freq: p.start, pitchEnd: p.end, type: 'triangle', duration: p.dur, gain: 0.38 });

  // Play Pip's delightful "faaahhh" vocal breath on poke
  setTimeout(() => {
    playFaahSound(p.faahPitch);
  }, 100);
}

/**
 * 3. Star Twinkle — Crystalline music-box chimes (pentatonic scale)
 */
const STAR_NOTES = [1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0]; // C6, D6, E6, G6, A6, C7

export function playStarSound(index = 0) {
  if (!soundEnabled) return;
  const freq = STAR_NOTES[index % STAR_NOTES.length];
  playTone({ freq, type: 'sine', duration: 0.35, gain: 0.4 });
  // Add harmonic overtone
  playTone({ freq: freq * 2, type: 'sine', duration: 0.2, gain: 0.15 });
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
    // Gentle sleepy "faaaahhh" sigh as nursery lights dim
    setTimeout(() => {
      playFaahSound(0.92);
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
