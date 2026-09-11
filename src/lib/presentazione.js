export const SOGLIA_ROTELLA = 40;
export const FADE_OUT_MS = 1000;
export const VUOTO_MS = 1000;
export const FADE_IN_MS = 1000;
export const DURATA_CAMBIO_MS = FADE_OUT_MS + VUOTO_MS + FADE_IN_MS;
export const APERTURA_BLOB_MS = 2000;
export const APERTURA_ATTESA_MS = 1000;
export const APERTURA_TITOLO_MS = 2000;
export const APERTURA_PAUSA_MS = 1000;
export const APERTURA_RESTO_MS = 2000;

const FINE_BLOB = APERTURA_BLOB_MS;
const FINE_ATTESA = FINE_BLOB + APERTURA_ATTESA_MS;
const FINE_TITOLO = FINE_ATTESA + APERTURA_TITOLO_MS;
const FINE_PAUSA = FINE_TITOLO + APERTURA_PAUSA_MS;
const FINE_RESTO = FINE_PAUSA + APERTURA_RESTO_MS;

/**
 * @param {number} elapsedMs
 * @returns {'blob' | 'attesa' | 'titolo' | 'pausa' | 'resto' | 'pronto'}
 */
export function faseApertura(elapsedMs) {
  if (elapsedMs < FINE_BLOB) return 'blob';
  if (elapsedMs < FINE_ATTESA) return 'attesa';
  if (elapsedMs < FINE_TITOLO) return 'titolo';
  if (elapsedMs < FINE_PAUSA) return 'pausa';
  if (elapsedMs < FINE_RESTO) return 'resto';
  return 'pronto';
}

/**
 * @param {number} elapsedMs
 * @returns {'esce' | 'vuoto' | 'entra' | 'fermo'}
 */
export function faseCambio(elapsedMs) {
  if (elapsedMs < FADE_OUT_MS) return 'esce';
  if (elapsedMs < FADE_OUT_MS + VUOTO_MS) return 'vuoto';
  if (elapsedMs < DURATA_CAMBIO_MS) return 'entra';
  return 'fermo';
}

/**
 * @param {number} indice
 * @param {number} direzione
 * @param {number} n
 */
export function indiceDopoScorrimento(indice, direzione, n) {
  const passo = direzione > 0 ? 1 : direzione < 0 ? -1 : 0;
  const prossimo = indice + passo;
  if (prossimo < 0) return 0;
  if (prossimo >= n) return n - 1;
  return prossimo;
}

/**
 * @param {number} deltaY
 * @param {number} [soglia]
 */
export function direzioneDaDelta(deltaY, soglia = SOGLIA_ROTELLA) {
  if (deltaY >= soglia) return 1;
  if (deltaY <= -soglia) return -1;
  return 0;
}

/**
 * @param {HTMLElement} el
 * @param {boolean} visibile
 */
function visibilita(el, visibile) {
  el.setAttribute('aria-hidden', visibile ? 'false' : 'true');
  el.inert = !visibile;
}

/**
 * @param {HTMLElement} root
 */
export function mountPresentazione(root) {
  const schermate = [...root.querySelectorAll('.testi > .schermata')];
  if (schermate.length === 0) return;

  let indice = Math.max(
    0,
    schermate.findIndex((el) => el.classList.contains('attiva')),
  );
  const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let fermo = !ridotto && root.classList.contains('apertura');
  let acc = 0;
  let toccoY = 0;

  const prima = schermate[0];
  const titolo = prima?.querySelector('.titolo-apertura');
  const resto = prima ? [...prima.querySelectorAll('.resto-apertura')] : [];

  const apriIngresso = () => {
    if (!root.classList.contains('apertura')) return;
    if (titolo) titolo.inert = false;
    for (const el of resto) el.inert = false;
    root.classList.remove('apertura');
    fermo = false;
  };

  if (fermo) {
    if (titolo) titolo.inert = true;
    for (const el of resto) el.inert = true;
    window.setTimeout(() => {
      if (titolo) titolo.inert = false;
    }, FINE_ATTESA);
    window.setTimeout(() => {
      for (const el of resto) el.inert = false;
    }, FINE_PAUSA);
    window.setTimeout(apriIngresso, FINE_RESTO);
  }

  const spegniTutte = () => {
    for (const el of schermate) {
      el.classList.remove('attiva', 'esce');
      visibilita(el, false);
    }
  };

  const accendi = (prossimo) => {
    spegniTutte();
    const el = schermate[prossimo];
    visibilita(el, true);
    el.classList.add('attiva', 'entra');
    indice = prossimo;
  };

  schermate.forEach((el, i) => {
    const attiva = i === indice;
    el.classList.toggle('attiva', attiva);
    visibilita(el, attiva);
  });

  const vai = (direzione) => {
    if (fermo) return;
    const prossimo = indiceDopoScorrimento(indice, direzione, schermate.length);
    if (prossimo === indice) return;
    fermo = true;
    acc = 0;
    const uscente = schermate[indice];
    uscente.classList.remove('attiva');
    uscente.classList.add('esce');
    visibilita(uscente, false);
    window.setTimeout(() => {
      uscente.classList.remove('esce');
      window.setTimeout(() => {
        accendi(prossimo);
        window.setTimeout(() => {
          fermo = false;
        }, FADE_IN_MS);
      }, VUOTO_MS);
    }, FADE_OUT_MS);
  };

  const suRotella = (evento) => {
    evento.preventDefault();
    acc += evento.deltaY;
    const direzione = direzioneDaDelta(acc);
    if (direzione) vai(direzione);
  };

  window.addEventListener('wheel', suRotella, { passive: false });

  root.addEventListener(
    'touchstart',
    (evento) => {
      toccoY = evento.touches[0]?.clientY ?? 0;
    },
    { passive: true },
  );

  root.addEventListener(
    'touchend',
    (evento) => {
      const fine = evento.changedTouches[0]?.clientY ?? toccoY;
      const direzione = direzioneDaDelta(toccoY - fine, 48);
      if (direzione) vai(direzione);
    },
    { passive: true },
  );

  window.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowDown' || evento.key === 'PageDown') {
      evento.preventDefault();
      vai(1);
    }
    if (evento.key === ' ') {
      if (evento.target instanceof HTMLAnchorElement) return;
      evento.preventDefault();
      vai(1);
    }
    if (evento.key === 'ArrowUp' || evento.key === 'PageUp') {
      evento.preventDefault();
      vai(-1);
    }
  });
}
