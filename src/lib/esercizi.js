export const TIPI = ['tessere', 'sillabe', 'buchi'];
const TIPI_LUNGHE = ['sillabe', 'buchi'];
const MAX_LETTERE_TESSERE = 5;

function mescolaLista(elenco, casuale = Math.random) {
  const mazzo = [...elenco];
  for (let i = mazzo.length - 1; i > 0; i--) {
    const j = Math.floor(casuale() * (i + 1));
    [mazzo[i], mazzo[j]] = [mazzo[j], mazzo[i]];
  }
  return mazzo;
}

export function tipiPerMazzo(parole, casuale = Math.random) {
  const n = parole.length;
  const lunghe = [];
  while (lunghe.length < n) lunghe.push(...mescolaLista(TIPI_LUNGHE, casuale));
  let i = 0;
  return parole.map((p) => {
    const testo = typeof p === 'string' ? p : p.risposta;
    if ([...testo].length <= MAX_LETTERE_TESSERE) return 'tessere';
    return lunghe[i++];
  });
}

export function stessaSillabe(testo, attese) {
  const pulisci = (s) => String(s)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return pulisci(testo) === pulisci(attese);
}

export function partiSillabe(sillabe) {
  return String(sillabe)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .split('-')
    .filter(Boolean);
}

export function scegliBuchi(parola, casuale = Math.random) {
  const n = [...parola].length;
  let quanti = n <= 4 ? 1 : n <= 7 ? 2 : 3;
  if (quanti >= n) quanti = Math.max(1, n - 1);
  return mescolaLista([...Array(n).keys()], casuale).slice(0, quanti).sort((a, b) => a - b);
}

export function mostraBuchi(parola, indici) {
  const set = new Set(indici);
  return [...parola].map((ch, i) => (set.has(i) ? '_' : ch)).join('');
}

export function mescolaLettere(parola, casuale = Math.random) {
  let miste = mescolaLista([...parola], casuale);
  if (miste.join('') === parola && parola.length >= 2) {
    miste = [parola[1], parola[0], ...[...parola].slice(2)];
  }
  return miste;
}

export function lettereAiutoBuchi(parola, indici, casuale = Math.random) {
  const mancanti = indici.map((i) => [...parola][i] ?? '').join('');
  return mescolaLettere(mancanti, casuale);
}

export function provaCompleta(turno, {
  testoTessere = '',
  lettereSillabe = [],
  lettereBuchi = [],
  buchiIndici = [],
} = {}) {
  if (!turno) return false;
  if (turno.tipo === 'tessere') return testoTessere.length === turno.risposta.length;
  if (turno.tipo === 'buchi') return buchiIndici.every((i) => Boolean(lettereBuchi[i]));
  const attese = partiSillabe(turno.sillabe);
  if (stessaSillabe(lettereSillabe.join('-'), turno.sillabe)) return true;
  const unite = lettereSillabe.join('');
  const piena = attese.join('').length;
  return unite.length >= piena;
}
