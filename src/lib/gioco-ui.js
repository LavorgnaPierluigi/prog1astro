import { COPPIE } from '../data/coppie.js';
import { coppiaCorrente, nuovaPartita, rispondi } from './gioco.js';

const RESPIRO_MS = 1500;
const LETTERA = /^[a-zàèéìòù]$/i;

/**
 * @param {{
 *   onIntroClick: (fn: () => void) => void,
 *   setIntroClickEnabled: (v: boolean) => void,
 *   setUmore: (n: number) => void,
 *   risucchia: (els: Element[]) => void,
 *   sparisci: () => void,
 *   esplodi: () => void,
 *   resetta: () => void,
 * }} sfera
 * @param {HTMLElement} root
 */
export function avviaGioco(sfera, root) {
  const riga = root.querySelector('.riga');
  const sx = root.querySelector('.sx');
  const dx = root.querySelector('.dx');
  const puntini = root.querySelector('.puntini');
  const campo = root.querySelector('.campo');
  const fine = root.querySelector('.fine');
  if (!riga || !sx || !dx || !puntini || !campo || !fine) return;

  let partita = null;
  let inRespiro = false;
  let lettere = '';

  function disegnaPuntini(risposta) {
    puntini.replaceChildren();
    for (let i = 0; i < risposta.length; i++) {
      const slot = document.createElement('span');
      slot.className = lettere[i] ? 'slot' : 'slot vuoto';
      slot.textContent = lettere[i] ?? '';
      puntini.append(slot);
    }
  }

  function mostraIngresso() {
    partita = null;
    inRespiro = false;
    lettere = '';
    riga.hidden = true;
    fine.hidden = true;
    fine.textContent = '';
    campo.value = '';
    campo.disabled = true;
    sx.style.opacity = '';
    dx.style.opacity = '';
    riga.classList.remove('via', 'succhiate');
    sfera.resetta();
    sfera.setIntroClickEnabled(true);
  }

  function mostraCoppia() {
    const coppia = coppiaCorrente(partita);
    lettere = '';
    campo.value = '';
    campo.maxLength = coppia.risposta.length;
    sx.textContent = coppia.sinistra;
    dx.textContent = coppia.destra;
    sx.style.opacity = '';
    dx.style.opacity = '';
    riga.classList.remove('via', 'succhiate');
    disegnaPuntini(coppia.risposta);
    riga.hidden = false;
    campo.disabled = false;
    campo.focus();
    inRespiro = false;
  }

  function inizia() {
    partita = nuovaPartita(COPPIE);
    fine.hidden = true;
    sfera.setIntroClickEnabled(false);
    mostraCoppia();
  }

  function chiudiPartita() {
    riga.hidden = true;
    campo.disabled = true;
    if (partita.fase === 'win') {
      sfera.sparisci();
      fine.textContent = 'you win';
    } else if (partita.fase === 'lose') {
      sfera.esplodi();
      fine.textContent = 'game over';
    } else {
      mostraIngresso();
      return;
    }
    window.setTimeout(() => {
      fine.hidden = false;
    }, 650);
  }

  function dopoRespiro() {
    if (!partita) return;
    if (partita.fase !== 'play') {
      chiudiPartita();
      return;
    }
    mostraCoppia();
  }

  function conferma() {
    if (!partita || partita.fase !== 'play' || inRespiro) return;
    const coppia = coppiaCorrente(partita);
    if (lettere.length !== coppia.risposta.length) return;
    inRespiro = true;
    campo.disabled = true;
    partita = rispondi(partita, lettere);
    sfera.setUmore(partita.umore);
    if (partita.giusta) {
      riga.classList.add('via');
    } else {
      riga.classList.add('succhiate');
      sfera.risucchia([sx, dx]);
      window.setTimeout(() => {
        sx.style.opacity = '0';
        dx.style.opacity = '0';
      }, 40);
    }
    window.setTimeout(dopoRespiro, RESPIRO_MS);
  }

  campo.addEventListener('input', () => {
    if (!partita || inRespiro) return;
    const max = coppiaCorrente(partita).risposta.length;
    lettere = [...campo.value].filter((ch) => LETTERA.test(ch)).join('').slice(0, max);
    campo.value = lettere;
    disegnaPuntini(coppiaCorrente(partita).risposta);
  });

  campo.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    conferma();
  });

  window.addEventListener('keydown', (e) => {
    if (!partita || partita.fase !== 'play' || inRespiro) return;
    const t = e.target;
    if (t === campo) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      conferma();
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
      lettere = lettere.slice(0, -1);
      campo.value = lettere;
      disegnaPuntini(coppiaCorrente(partita).risposta);
      return;
    }
    if (e.key.length !== 1 || !LETTERA.test(e.key)) return;
    e.preventDefault();
    const max = coppiaCorrente(partita).risposta.length;
    if (lettere.length >= max) return;
    lettere += e.key;
    campo.value = lettere;
    disegnaPuntini(coppiaCorrente(partita).risposta);
  });

  riga.addEventListener('click', () => {
    if (!campo.disabled) campo.focus();
  });

  window.addEventListener('pointerdown', () => {
    if (!partita) return;
    if (partita.fase !== 'win' && partita.fase !== 'lose') return;
    if (fine.hidden) return;
    mostraIngresso();
  });

  sfera.onIntroClick(inizia);
  mostraIngresso();
}
