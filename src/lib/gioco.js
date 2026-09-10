/**
 * @typedef {{ sinistra: string, destra: string, risposta: string }} Coppia
 * @typedef {{
 *   mazzo: Coppia[],
 *   indice: number,
 *   serieGiuste: number,
 *   serieSbagli: number,
 *   umore: number,
 *   fase: 'play' | 'win' | 'lose' | 'esausta',
 *   giusta?: boolean,
 * }} Partita
 */

export function normalizza(testo) {
  return String(testo)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function stessaParola(a, b) {
  return normalizza(a) === normalizza(b);
}

export function mescola(elenco, casuale = Math.random) {
  const mazzo = [...elenco];
  for (let i = mazzo.length - 1; i > 0; i--) {
    const j = Math.floor(casuale() * (i + 1));
    [mazzo[i], mazzo[j]] = [mazzo[j], mazzo[i]];
  }
  return mazzo;
}

export function nuovaPartita(coppie, casuale = Math.random) {
  return {
    mazzo: mescola(coppie, casuale),
    indice: 0,
    serieGiuste: 0,
    serieSbagli: 0,
    umore: 0,
    fase: 'play',
  };
}

export function coppiaCorrente(partita) {
  return partita.mazzo[partita.indice];
}

export function rispondi(partita, testo) {
  if (partita.fase !== 'play') return { ...partita, giusta: false };

  const giusta = stessaParola(testo, coppiaCorrente(partita).risposta);
  const dopo = {
    ...partita,
    mazzo: partita.mazzo,
    giusta,
  };

  if (giusta) {
    dopo.serieGiuste = partita.serieGiuste + 1;
    dopo.serieSbagli = 0;
    dopo.umore = Math.min(10, partita.umore + 1);
    if (dopo.serieGiuste >= 10) {
      dopo.fase = 'win';
      return dopo;
    }
  } else {
    dopo.serieSbagli = partita.serieSbagli + 1;
    dopo.serieGiuste = 0;
    dopo.umore = Math.max(-10, partita.umore - 1);
    if (dopo.serieSbagli >= 10) {
      dopo.fase = 'lose';
      return dopo;
    }
  }

  dopo.indice = partita.indice + 1;
  if (dopo.indice >= dopo.mazzo.length) dopo.fase = 'esausta';
  return dopo;
}
