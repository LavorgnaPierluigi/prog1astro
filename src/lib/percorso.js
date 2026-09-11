/**
 * Unisce la radice del sito (locale `/` o `/prog1astro` su GitHub Pages) a un percorso.
 * @param {string} [base]
 * @param {string} [coda]
 */
export function unisciBase(base = '/', coda = '') {
  const radice = String(base).replace(/\/+$/, '');
  const pezzo = String(coda).replace(/^\/+/, '');
  if (!pezzo) return radice ? `${radice}/` : '/';
  return `${radice}/${pezzo}`;
}

/**
 * @param {string} [coda]
 */
export function percorso(coda = '') {
  return unisciBase(import.meta.env?.BASE_URL ?? '/', coda);
}
