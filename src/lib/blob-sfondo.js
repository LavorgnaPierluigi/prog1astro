export const BLOB_FEELING = {
  deform: 0.18,
  speed: 0.22,
  stretch: 0.16,
};

export const BLOB_PRESENTAZIONE = [
  { id: 'miele', colore: 0xf6d05a, diametroPx: 280, x: 0.14, y: 0.22, derivaX: 0.22, derivaY: 0.20, derivaT: 0.42 },
  { id: 'cielo', colore: 0x73c3ee, diametroPx: 220, x: 0.88, y: 0.52, derivaX: 0.22, derivaY: 0.18, derivaT: 0.36 },
  { id: 'lilla', colore: 0xc9b0d8, diametroPx: 170, x: 0.22, y: 0.84, derivaX: 0.18, derivaY: 0.22, derivaT: 0.48 },
];

/**
 * Stessa rotazione della sfera del gioco.
 * @param {number} t
 * @param {number} [fase]
 */
export function rotazioneBlob(t, fase = 0) {
  return {
    x: Math.sin(t * 0.22 + fase) * 0.22,
    y: t * 0.18 + fase,
    z: Math.cos(t * 0.17 + fase) * 0.12,
  };
}

/**
 * Spostamento piano sul nero, in frazione della schermata visibile.
 * @param {number} t
 * @param {{ derivaX: number, derivaY: number, derivaT: number }} conf
 * @param {number} [fase]
 */
export function derivaBlob(t, conf, fase = 0) {
  return {
    x: Math.sin(t * conf.derivaT + fase) * conf.derivaX,
    y: Math.cos(t * conf.derivaT * 0.82 + fase * 1.3) * conf.derivaY,
  };
}
