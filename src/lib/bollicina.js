export const SALITA_S = 1.15;
export const SCOPPIO_S = 1.2;

export function faseBollicina(elapsedS) {
  if (elapsedS < 0) return 'attesa';
  if (elapsedS < SALITA_S) return 'salita';
  if (elapsedS < SALITA_S + SCOPPIO_S) return 'scoppio';
  return 'nome';
}

/** @param {number} elapsedS */
export function uSalita(elapsedS) {
  const u = elapsedS / SALITA_S;
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return u * u * (3 - 2 * u);
}

export function nomeVisibile(elapsedS) {
  return faseBollicina(elapsedS) === 'nome';
}
