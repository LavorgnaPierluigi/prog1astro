export const NOME_GIOCO = 'BLUBLINO';
export const PAUSA_NOME_S = 2;
export const SPOSTAMENTO_NOME_S = 4;
export const PAUSA_INIZIA_S = 2;
export const SLOT_NOME_EM = 1.1;

/** Per ogni lettera della parola mescolata, l’indice in cui deve arrivare. */
export function destinazioniLettere(miste, corretta = NOME_GIOCO) {
  const usati = new Set();
  return [...miste].map((ch) => {
    for (let j = 0; j < corretta.length; j++) {
      if (corretta[j] === ch && !usati.has(j)) {
        usati.add(j);
        return j;
      }
    }
    return 0;
  });
}

export function permutazioneIndici(n, casuale = Math.random) {
  const idx = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(casuale() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  if (n >= 2 && idx.every((v, i) => v === i)) {
    [idx[0], idx[1]] = [idx[1], idx[0]];
  }
  return idx;
}

export function permutazioneNome(parola = NOME_GIOCO, casuale = Math.random) {
  const lettere = [...parola];
  return permutazioneIndici(lettere.length, casuale).map((i) => lettere[i]).join('');
}

/** Tempo in secondi da quando il nome è comparso. 0 = ancora mescolato, 1 = a posto. */
export function progressoComposizione(elapsedS) {
  if (elapsedS < PAUSA_NOME_S) return 0;
  const u = (elapsedS - PAUSA_NOME_S) / SPOSTAMENTO_NOME_S;
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return u * u * (3 - 2 * u);
}

/** Due secondi dopo che il nome è a posto. */
export function visibileInizia(elapsedS) {
  return elapsedS >= PAUSA_NOME_S + SPOSTAMENTO_NOME_S + PAUSA_INIZIA_S;
}
