export const SEPARAZIONE_MS = 1400;

export function uSeparazione(elapsedMs, durata = SEPARAZIONE_MS) {
  const u = elapsedMs / durata;
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return 1 - (1 - u) ** 3;
}

/**
 * @param {number} u
 * @param {-1 | 1} lato
 * @param {{ x: number, y: number }} origine
 * @param {number} distX
 * @param {number} distY
 */
export function posBlobLingua(u, lato, origine, distX, distY) {
  return {
    x: origine.x + lato * distX * u,
    y: origine.y - distY * u,
  };
}

export function etichetteVisibili(u) {
  return u >= 1;
}
