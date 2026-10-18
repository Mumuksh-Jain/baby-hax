/**
 * Sound Engine for Pip's Bedtime Website
 * Uses Web Audio API to synthesize gentle, nostalgic toy sounds.
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
 * 1. Psst, Pip? — Soft whispery chime
 */
export function playPsstSound() {
  if (!soundEnabled) return;
  playTone({ freq: 880, type: 'sine', duration: 0.18, gain: 0.4 });
  setTimeout(() => {
    playTone({ freq: 1174.66, type: 'sine', duration: 0.3, gain: 0.45 });
  }, 90);
}

/**
 * 2. Poke Pip — Soft cartoon toy pop & varying reaction tones
 */
export function playPipPokeSound(variant = 0) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const pitches = [
    { start: 350, end: 720, dur: 0.16 }, // Curious squeak up
    { start: 680, end: 280, dur: 0.22 }, // Clumsy slide down
    { start: 440, end: 554, dur: 0.18 }, // Playful double pop
    { start: 523.25, end: 783.99, dur: 0.25 }, // Little surprise chirp
  ];
  const p = pitches[variant % pitches.length];

  playTone({ freq: p.start, pitchEnd: p.end, type: 'triangle', duration: p.dur, gain: 0.45 });
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
 * 4. Moon Toggle — Cozy bedtime chord swell
 */
export function playMoonSound(isNightlight) {
  if (!soundEnabled) return;
  const baseFreqs = isNightlight
    ? [392.0, 493.88, 587.33, 783.99] // G major chord for cozy nightlight on
    : [523.25, 659.25, 783.99, 1046.5]; // C major chord for daytime warm nursery

  baseFreqs.forEach((freq, idx) => {
    setTimeout(() => {
      playTone({ freq, type: 'sine', duration: 0.5, gain: 0.35 });
    }, idx * 70);
  });
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
      playTone({ freq, type: 'triangle', duration: 0.09, gain: 0.3 });
    }, i * 65);
  });
}
