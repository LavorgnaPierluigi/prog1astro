/** @type {AudioContext | null} */
let ctx = null;

/** Do-Re-Mi-Sol-La, nella zona calma della voce. */
export const SCALA_GIOCO = [261.63, 293.66, 329.63, 392.0, 440.0];

const MOTIVO = [0, 2, 1, 4, 2, 3, 0, 2];
const PASSO_MUSICA_MS = 1400;

export function notaSottofondo(passo) {
  return SCALA_GIOCO[MOTIVO[((passo % MOTIVO.length) + MOTIVO.length) % MOTIVO.length]];
}

function audio() {
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function svegliaAudio() {
  audio();
}

function rumore(ac, durata) {
  const n = Math.floor(ac.sampleRate * durata);
  const buf = ac.createBuffer(1, n, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  return src;
}

/** Piccolo soffio d’aria, quando il blob rimpicciolisce. */
export function soffio() {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime;
  const src = rumore(ac, 0.32);
  const filtro = ac.createBiquadFilter();
  filtro.type = 'bandpass';
  filtro.frequency.setValueAtTime(1400, t0);
  filtro.frequency.exponentialRampToValueAtTime(700, t0 + 0.28);
  filtro.Q.value = 0.7;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
  src.connect(filtro);
  filtro.connect(gain);
  gain.connect(ac.destination);
  src.start(t0);
  src.stop(t0 + 0.32);
}

/** Ingurgito umido, quando il blob ingrandisce e risucchia. */
export function ingurgito() {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime;
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(210, t0);
  osc.frequency.exponentialRampToValueAtTime(48, t0 + 0.42);
  const oscGain = ac.createGain();
  oscGain.gain.setValueAtTime(0.0001, t0);
  oscGain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.04);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.45);

  const src = rumore(ac, 0.38);
  const filtro = ac.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.setValueAtTime(900, t0);
  filtro.frequency.exponentialRampToValueAtTime(180, t0 + 0.35);
  const noiseGain = ac.createGain();
  noiseGain.gain.setValueAtTime(0.0001, t0);
  noiseGain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.05);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.38);

  osc.connect(oscGain);
  oscGain.connect(ac.destination);
  src.connect(filtro);
  filtro.connect(noiseGain);
  noiseGain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + 0.46);
  src.start(t0);
  src.stop(t0 + 0.38);
}

/** @type {{ attivo: boolean, gain: GainNode | null, timer: number, passo: number }} */
const musica = {
  attivo: false,
  gain: null,
  timer: 0,
  passo: 0,
};

function suonaPassoMusica() {
  if (!musica.attivo) return;
  const ac = audio();
  if (!ac || !musica.gain) return;
  const t0 = ac.currentTime;
  const dur = PASSO_MUSICA_MS / 1000;
  const freq = notaSottofondo(musica.passo);
  const voce = (hz, vol) => {
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(hz, t0);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.92);
    osc.connect(g);
    g.connect(musica.gain);
    osc.start(t0);
    osc.stop(t0 + dur);
  };
  voce(freq, 0.55);
  voce(freq * 0.5, 0.22);
  musica.passo += 1;
  musica.timer = globalThis.setTimeout(suonaPassoMusica, PASSO_MUSICA_MS);
}

export function avviaMusica() {
  const ac = audio();
  if (!ac) return;
  fermaMusica();
  musica.attivo = true;
  musica.passo = 0;
  musica.gain = ac.createGain();
  musica.gain.gain.setValueAtTime(0.0001, ac.currentTime);
  musica.gain.gain.exponentialRampToValueAtTime(0.05, ac.currentTime + 2.6);
  musica.gain.connect(ac.destination);
  suonaPassoMusica();
}

export function fermaMusica() {
  musica.attivo = false;
  if (musica.timer) {
    globalThis.clearTimeout(musica.timer);
    musica.timer = 0;
  }
  if (!musica.gain || !ctx) {
    musica.gain = null;
    return;
  }
  const ac = ctx;
  const g = musica.gain;
  g.gain.cancelScheduledValues(ac.currentTime);
  g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.7);
  musica.gain = null;
}

function battito(ac, t, vol) {
  const src = rumore(ac, 0.09);
  const filtro = ac.createBiquadFilter();
  filtro.type = 'bandpass';
  filtro.frequency.setValueAtTime(1600, t);
  filtro.Q.value = 0.85;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  src.connect(filtro);
  filtro.connect(gain);
  gain.connect(ac.destination);
  src.start(t);
  src.stop(t + 0.09);
}

/** Applausi morbidi, insieme ai fuochi di YOU WIN. */
export function applausi() {
  const ac = audio();
  if (!ac) return;
  fermaMusica();
  const t0 = ac.currentTime;
  for (let i = 0; i < 18; i++) {
    const t = t0 + 0.06 + i * 0.16 + (i % 3) * 0.03;
    battito(ac, t, 0.07 + (i % 4) * 0.012);
  }
}

/** Accordo che scende, piano, per GAME OVER. */
export function sconfitta() {
  const ac = audio();
  if (!ac) return;
  fermaMusica();
  const t0 = ac.currentTime;
  const note = [329.63, 293.66, 261.63];
  note.forEach((hz, i) => {
    const t = t0 + i * 0.55;
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(hz, t);
    osc.frequency.exponentialRampToValueAtTime(hz * 0.92, t + 1.1);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.35);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 1.4);
  });
}
