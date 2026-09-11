import { parolaCorrente, nuovaPartita, rispondi } from './gioco.js';
import { mescolaLettere, partiSillabe, scegliBuchi, lettereAiutoBuchi, provaCompleta } from './esercizi.js';
import { FINE_PARTITA_MS, NERO_PRIMA_GIOCO_MS, linguaDaId } from './livelli.js';
import { mountFuochi } from './fuochi.js';
import { PAROLE_EN, PAROLE_IT } from './parole.js';
import { applausi, avviaMusica, fermaMusica, ingurgito, sconfitta, soffio, svegliaAudio } from './suoni.js';
import {
  NOME_GIOCO,
  permutazioneNome,
  destinazioniLettere,
  progressoComposizione,
  SLOT_NOME_EM,
  PAUSA_INIZIA_S,
} from './nome.js';

const RESPIRO_MS = 1500;
const VIBRA_MS = 620;
const RISUCCHIO_MS = 520;
const CRESCITA_DOPO_MS = 900;
const LETTERA = /^[a-zàèéìòù]$/i;

/**
 * @param {any} sfera
 * @param {HTMLElement} root
 */
export function avviaGioco(sfera, root) {
  const esercizio = root.querySelector('.esercizio');
  const tessereBox = root.querySelector('.tessere');
  const riga = root.querySelector('.riga');
  const sx = root.querySelector('.sx');
  const dx = root.querySelector('.dx');
  const puntini = root.querySelector('.puntini');
  const parolaProva = root.querySelector('.parola-prova');
  const campo = root.querySelector('.campo');
  const fine = root.querySelector('.fine');
  const nome = root.querySelector('.nome-gioco');
  const scrittaInizia = root.querySelector('.inizia');
  const scelta = root.querySelector('#scelta');
  const etichette = root.querySelector('.scelta-etichette');
  const fuochiEl = root.querySelector('#fuochi');
  const indietro = root.querySelector('.indietro');
  if (!esercizio || !riga || !sx || !dx || !puntini || !campo || !fine) return;

  let partita = null;
  let inRespiro = false;
  let lettere = '';
  /** @type {number[]} */
  let buchiIndici = [];
  /** @type {string[]} */
  let lettereBuchi = [];
  /** @type {string[]} */
  let atteseSillabe = [];
  /** @type {string[]} */
  let lettereSillabe = [];
  let indiceSillaba = 0;
  /** @type {string[]} */
  let aiutiBuchi = [];
  let vista = 'intro';
  let timerFine = 0;
  /** @type {null | HTMLElement} */
  let tesseraPresa = null;
  const fuochi = fuochiEl ? mountFuochi(fuochiEl) : { start() {}, stop() {} };
  /** @type {number[]} */
  let timeriRespiro = [];
  let timerNome = 0;
  let rafNome = 0;

  function fermaFine() {
    if (timerFine) {
      window.clearTimeout(timerFine);
      timerFine = 0;
    }
    fuochi.stop();
  }

  function fermaRespiro() {
    for (const id of timeriRespiro) window.clearTimeout(id);
    timeriRespiro = [];
  }

  function dopo(ms, fn) {
    const id = window.setTimeout(fn, ms);
    timeriRespiro.push(id);
  }

  function fermaNome() {
    if (timerNome) {
      window.clearTimeout(timerNome);
      timerNome = 0;
    }
    if (rafNome) {
      window.cancelAnimationFrame(rafNome);
      rafNome = 0;
    }
    nascondiInizia();
  }

  function nascondiInizia() {
    if (!scrittaInizia) return;
    scrittaInizia.hidden = true;
    scrittaInizia.classList.remove('pronto');
    scrittaInizia.setAttribute('aria-hidden', 'true');
  }

  function mostraInizia() {
    if (!scrittaInizia || vista !== 'intro') return;
    scrittaInizia.hidden = false;
    scrittaInizia.removeAttribute('aria-hidden');
    void scrittaInizia.offsetWidth;
    scrittaInizia.classList.add('pronto');
  }

  function nascondiEtichette() {
    if (!etichette) return;
    etichette.classList.remove('pronto');
    etichette.setAttribute('aria-hidden', 'true');
  }

  function posizionaEtichette(punti) {
    if (!etichette) return;
    for (const p of punti) {
      const btn = etichette.querySelector(`[data-livello="${p.id}"]`);
      if (!btn) continue;
      btn.style.left = `${p.x}px`;
      btn.style.top = `${p.y}px`;
    }
  }

  function mostraEtichette(punti) {
    posizionaEtichette(punti);
    if (!etichette) return;
    etichette.classList.add('pronto');
    etichette.removeAttribute('aria-hidden');
  }

  function chiudiScelta() {
    nascondiEtichette();
    if (scelta) scelta.hidden = true;
    sfera.chiudiLingue();
  }

  function turno() {
    return partita ? parolaCorrente(partita) : null;
  }

  function testoDaSlotTessere() {
    return [...puntini.querySelectorAll('.slot')]
      .map((slot) => slot.querySelector('.tessera')?.textContent ?? '')
      .join('');
  }

  function pulisciTessere() {
    if (tessereBox) tessereBox.replaceChildren();
    tesseraPresa = null;
  }

  function disegnaTessere(risposta) {
    if (!tessereBox) return;
    pulisciTessere();
    for (const ch of mescolaLettere(risposta)) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'tessera';
      el.textContent = ch;
      tessereBox.append(el);
    }
  }

  function disegnaAiutiBuchi() {
    if (!tessereBox) return;
    tessereBox.replaceChildren();
    for (const ch of aiutiBuchi) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'tessera aiuto';
      el.textContent = ch;
      tessereBox.append(el);
    }
  }

  function usaAiuto(ch) {
    const i = aiutiBuchi.findIndex((l) => l.toLowerCase() === ch.toLowerCase());
    if (i < 0) return;
    aiutiBuchi.splice(i, 1);
    disegnaAiutiBuchi();
  }

  function rendiAiuto(ch) {
    if (!ch) return;
    aiutiBuchi.push(ch);
    disegnaAiutiBuchi();
  }

  function mettiLetteraBuco(ch) {
    const t = turno();
    if (!t || t.tipo !== 'buchi') return false;
    const vuoto = buchiIndici.find((i) => !lettereBuchi[i]);
    if (vuoto == null) return false;
    lettereBuchi[vuoto] = ch;
    usaAiuto(ch);
    disegnaSlotBuchi(t.risposta);
    provaSeCompleta();
    return true;
  }

  function disegnaSlotTessere(n) {
    puntini.replaceChildren();
    for (let i = 0; i < n; i++) {
      const slot = document.createElement('span');
      slot.className = 'slot vuoto';
      puntini.append(slot);
    }
  }

  function disegnaSlotSillabe() {
    puntini.replaceChildren();
    atteseSillabe.forEach((_, i) => {
      const slot = document.createElement('span');
      const testo = lettereSillabe[i] ?? '';
      slot.className = 'slot';
      if (!testo) slot.classList.add('vuoto');
      if (i === indiceSillaba) slot.classList.add('attuale');
      slot.style.setProperty('--lettere', String(Math.max(3, testo.length)));
      slot.textContent = testo;
      puntini.append(slot);
    });
  }

  function vaiSillaba(delta) {
    const prossimo = indiceSillaba + delta;
    if (prossimo < 0 || prossimo >= atteseSillabe.length) return;
    indiceSillaba = prossimo;
    disegnaSlotSillabe();
  }

  function aggiungiLetteraSillaba(ch) {
    const i = indiceSillaba;
    if (!atteseSillabe[i]) return;
    lettereSillabe[i] = (lettereSillabe[i] ?? '') + ch;
    disegnaSlotSillabe();
    provaSeCompleta();
  }

  function togliLetteraSillaba() {
    let i = indiceSillaba;
    while (i > 0 && !(lettereSillabe[i] ?? '')) i -= 1;
    indiceSillaba = i;
    const cur = lettereSillabe[i] ?? '';
    if (!cur) {
      disegnaSlotSillabe();
      return;
    }
    lettereSillabe[i] = cur.slice(0, -1);
    disegnaSlotSillabe();
  }

  function disegnaSlotBuchi(risposta) {
    puntini.replaceChildren();
    const chars = [...risposta];
    for (let i = 0; i < chars.length; i++) {
      const slot = document.createElement('span');
      const buco = buchiIndici.includes(i);
      const ch = lettereBuchi[i];
      if (!buco) {
        slot.className = 'slot fisso';
        slot.textContent = chars[i];
      } else if (ch) {
        slot.className = 'slot';
        slot.textContent = ch;
      } else {
        slot.className = 'slot vuoto';
      }
      puntini.append(slot);
    }
  }

  function mostraIngresso() {
    fermaFine();
    fermaRespiro();
    fermaNome();
    partita = null;
    inRespiro = false;
    lettere = '';
    buchiIndici = [];
    lettereBuchi = [];
    atteseSillabe = [];
    lettereSillabe = [];
    indiceSillaba = 0;
    aiutiBuchi = [];
    vista = 'intro';
    chiudiScelta();
    esercizio.hidden = true;
    fine.hidden = true;
    fine.textContent = '';
    campo.value = '';
    campo.disabled = true;
    sx.style.opacity = '';
    dx.style.opacity = '';
    esercizio.classList.remove('via', 'succhiate', 'errore');
    pulisciTessere();
    if (indietro) indietro.hidden = true;
    if (nome) {
      nome.classList.remove('pronto');
      nome.classList.add('via');
      nome.setAttribute('aria-hidden', 'true');
      nome.replaceChildren();
      nome.style.left = '';
      nome.style.top = '';
    }
    sfera.resetta();
    sfera.setIntroClickEnabled(true);
    fermaMusica();
  }

  function mostraTurno() {
    const t = turno();
    if (!t) return;
    lettere = '';
    campo.value = '';
    sx.style.opacity = '';
    dx.textContent = '';
    esercizio.classList.remove('via', 'succhiate', 'errore');
    esercizio.hidden = false;
    esercizio.dataset.tipo = t.tipo ?? '';
    if (tessereBox) {
      tessereBox.hidden = t.tipo !== 'tessere' && t.tipo !== 'buchi';
      tessereBox.style.opacity = '';
    }
    if (parolaProva) {
      const mostraParola = t.tipo === 'sillabe';
      parolaProva.hidden = !mostraParola;
      parolaProva.textContent = mostraParola ? t.risposta : '';
      parolaProva.style.opacity = '';
    }
    puntini.hidden = false;
    puntini.style.opacity = '';
    pulisciTessere();

    if (t.tipo === 'tessere') {
      sx.textContent = '';
      campo.disabled = true;
      disegnaTessere(t.risposta);
      disegnaSlotTessere(t.risposta.length);
    } else if (t.tipo === 'sillabe') {
      sx.textContent = '';
      atteseSillabe = partiSillabe(t.sillabe);
      lettereSillabe = atteseSillabe.map(() => '');
      indiceSillaba = 0;
      campo.disabled = false;
      campo.maxLength = 40;
      disegnaSlotSillabe();
      campo.focus();
    } else {
      buchiIndici = scegliBuchi(t.risposta);
      const chars = [...t.risposta];
      lettereBuchi = chars.map((ch, i) => (buchiIndici.includes(i) ? '' : ch));
      aiutiBuchi = lettereAiutoBuchi(t.risposta, buchiIndici);
      sx.textContent = '';
      campo.disabled = false;
      campo.maxLength = t.risposta.length;
      disegnaAiutiBuchi();
      disegnaSlotBuchi(t.risposta);
      campo.focus();
    }
    inRespiro = false;
  }

  function apriScelta() {
    fermaFine();
    vista = 'scelta';
    fine.hidden = true;
    fine.textContent = '';
    esercizio.hidden = true;
    nascondiEtichette();
    fermaNome();
    if (nome) {
      nome.classList.remove('pronto');
      nome.classList.add('via');
      nome.setAttribute('aria-hidden', 'true');
    }
    if (scelta) scelta.hidden = false;
    sfera.apriLingue({
      onScelta(id) {
        scegliLingua(id);
      },
      onFerme(punti) {
        if (vista !== 'scelta') return;
        mostraEtichette(punti);
      },
    });
  }

  function scegliLingua(id) {
    if (vista !== 'scelta') return;
    vista = 'nero';
    chiudiScelta();
    sfera.nascondiPerScelta();
    svegliaAudio();
    const liv = linguaDaId(id);
    const mazzo = liv.id === 'inglese' ? PAROLE_EN : PAROLE_IT;
    window.setTimeout(() => iniziaPartita(liv.colore, mazzo), NERO_PRIMA_GIOCO_MS);
  }

  function iniziaPartita(colore, mazzo) {
    vista = 'play';
    partita = nuovaPartita(mazzo);
    fine.hidden = true;
    sfera.preparaPartita(colore);
    if (indietro) indietro.hidden = false;
    mostraTurno();
    avviaMusica();
  }

  function inizia() {
    apriScelta();
  }

  function tornaAScelta() {
    fermaFine();
    fermaRespiro();
    partita = null;
    inRespiro = false;
    lettere = '';
    campo.value = '';
    campo.disabled = true;
    esercizio.hidden = true;
    esercizio.classList.remove('via', 'succhiate', 'errore');
    sx.style.opacity = '';
    dx.style.opacity = '';
    pulisciTessere();
    if (indietro) indietro.hidden = true;
    fermaMusica();
    apriScelta();
  }

  function chiudiPartita() {
    esercizio.hidden = true;
    campo.disabled = true;
    if (indietro) indietro.hidden = true;
    if (partita.fase !== 'win' && partita.fase !== 'lose') {
      mostraIngresso();
      return;
    }
    vista = 'fine';
    sfera.esplodi();
    if (timerFine) {
      window.clearTimeout(timerFine);
      timerFine = 0;
    }
    if (partita.fase === 'win') {
      fuochi.start();
      fine.textContent = 'YOU WIN';
      applausi();
    } else {
      fuochi.stop();
      fine.textContent = 'GAME OVER';
      sconfitta();
    }
    fine.hidden = false;
    timerFine = window.setTimeout(tornaAScelta, FINE_PARTITA_MS);
  }

  function dopoRespiro() {
    if (!partita) return;
    if (partita.fase !== 'play') {
      chiudiPartita();
      return;
    }
    mostraTurno();
  }

  function testoRisposta() {
    const t = turno();
    if (!t) return '';
    if (t.tipo === 'tessere') return testoDaSlotTessere();
    if (t.tipo === 'buchi') return lettereBuchi.join('');
    return lettereSillabe.join('-');
  }

  function provaSeCompleta() {
    const t = turno();
    if (!t || !provaCompleta(t, {
      testoTessere: testoDaSlotTessere(),
      lettereSillabe,
      lettereBuchi,
      buchiIndici,
    })) return;
    conferma();
  }

  function conferma() {
    if (!partita || partita.fase !== 'play' || inRespiro) return;
    if (tesseraPresa) {
      const el = tesseraPresa;
      tesseraPresa = null;
      el.classList.remove('presa');
      el.style.left = '';
      el.style.top = '';
      el.style.marginLeft = '';
      el.style.marginTop = '';
      if (tessereBox) tessereBox.append(el);
    }
    const t = turno();
    inRespiro = true;
    campo.disabled = true;
    tesseraPresa = null;
    partita = rispondi(partita, testoRisposta());
    fermaRespiro();
    if (partita.giusta) {
      soffio();
      esercizio.classList.add('via');
      sfera.setUmore(partita.umore);
      dopo(RESPIRO_MS, dopoRespiro);
      return;
    }
    esercizio.classList.add('errore');
    dopo(VIBRA_MS, () => {
      ingurgito();
      esercizio.classList.remove('errore');
      esercizio.classList.add('succhiate');
      const succhia = t?.tipo === 'sillabe' && parolaProva
        ? [parolaProva, puntini]
        : [...(tessereBox ? [tessereBox] : []), puntini];
      sfera.risucchia(succhia);
      window.setTimeout(() => {
        sx.style.opacity = '0';
        if (tessereBox) tessereBox.style.opacity = '0';
        if (parolaProva) parolaProva.style.opacity = '0';
        puntini.style.opacity = '0';
      }, 40);
      dopo(RISUCCHIO_MS, () => {
        sfera.setUmore(partita.umore);
      });
    });
    dopo(VIBRA_MS + RISUCCHIO_MS + CRESCITA_DOPO_MS, dopoRespiro);
  }

  function lasciaTessera(clientX, clientY) {
    if (!tesseraPresa) return;
    const el = tesseraPresa;
    el.style.pointerEvents = 'none';
    const sotto = document.elementFromPoint(clientX, clientY);
    el.style.pointerEvents = '';
    el.classList.remove('presa');
    el.style.left = '';
    el.style.top = '';
    el.style.marginLeft = '';
    el.style.marginTop = '';
    const slot = sotto?.closest('.slot');
    if (slot && puntini.contains(slot)) {
      const gia = slot.querySelector('.tessera');
      if (gia && gia !== el) {
        if (tessereBox) tessereBox.append(gia);
        slot.classList.add('vuoto');
      }
      slot.append(el);
      slot.classList.remove('vuoto');
    } else if (tessereBox) {
      tessereBox.append(el);
    }
    tesseraPresa = null;
    for (const s of puntini.querySelectorAll('.slot')) {
      if (!s.querySelector('.tessera')) s.classList.add('vuoto');
    }
    provaSeCompleta();
  }

  if (tessereBox) {
    tessereBox.addEventListener('pointerdown', (e) => {
      const el = e.target.closest('.tessera');
      if (!el || !partita || inRespiro || turno()?.tipo !== 'tessere') return;
      e.preventDefault();
      tesseraPresa = el;
      document.body.append(el);
      el.classList.add('presa');
      try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.style.marginLeft = `${-el.offsetWidth / 2}px`;
      el.style.marginTop = `${-el.offsetHeight / 2}px`;
    });
    tessereBox.addEventListener('click', (e) => {
      const el = e.target.closest('.tessera.aiuto');
      if (!el || !partita || inRespiro || turno()?.tipo !== 'buchi') return;
      e.preventDefault();
      mettiLetteraBuco(el.textContent);
    });
  }

  puntini.addEventListener('pointerdown', (e) => {
    const t = turno();
    if (t?.tipo === 'sillabe') {
      const slot = e.target.closest('.slot');
      if (!slot || !puntini.contains(slot) || inRespiro) return;
      indiceSillaba = [...puntini.children].indexOf(slot);
      disegnaSlotSillabe();
      return;
    }
    const el = e.target.closest('.tessera');
    if (!el || !partita || inRespiro || turno()?.tipo !== 'tessere') return;
    e.preventDefault();
    const padre = el.closest('.slot');
    if (padre) padre.classList.add('vuoto');
    tesseraPresa = el;
    document.body.append(el);
    el.classList.add('presa');
    try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    el.style.left = `${e.clientX}px`;
    el.style.top = `${e.clientY}px`;
    el.style.marginLeft = `${-el.offsetWidth / 2}px`;
    el.style.marginTop = `${-el.offsetHeight / 2}px`;
  });

  window.addEventListener('pointermove', (e) => {
    if (!tesseraPresa) return;
    tesseraPresa.style.left = `${e.clientX}px`;
    tesseraPresa.style.top = `${e.clientY}px`;
  });

  window.addEventListener('pointerup', (e) => {
    if (!tesseraPresa) return;
    lasciaTessera(e.clientX, e.clientY);
  });

  campo.addEventListener('input', () => {
    const t = turno();
    if (!partita || inRespiro || !t || t.tipo === 'tessere') return;
    if (t.tipo === 'sillabe') {
      const pulito = campo.value
        .split(/[\s-]+/)
        .map((pezzo) => [...pezzo].filter((ch) => LETTERA.test(ch)).join(''));
      lettereSillabe = atteseSillabe.map((_, i) => pulito[i] ?? '');
      if (pulito.length > atteseSillabe.length) {
        const ultimo = atteseSillabe.length - 1;
        lettereSillabe[ultimo] = pulito.slice(ultimo).join('');
      }
      indiceSillaba = Math.max(0, Math.min(pulito.length - 1, atteseSillabe.length - 1));
      disegnaSlotSillabe();
      provaSeCompleta();
      return;
    }
  });

  campo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.preventDefault();
  });

  window.addEventListener('keydown', (e) => {
    if (!partita || partita.fase !== 'play' || inRespiro) return;
    const t = turno();
    if (!t) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      return;
    }
    if (t.tipo === 'tessere') return;
    if (t.tipo === 'sillabe') {
      if (e.key === 'Backspace') {
        e.preventDefault();
        togliLetteraSillaba();
        campo.value = lettereSillabe.join('-');
        return;
      }
      if (e.key === ' ' || e.key === '-' || e.key === 'Tab') {
        e.preventDefault();
        vaiSillaba(1);
        campo.value = lettereSillabe.join('-');
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        vaiSillaba(1);
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        vaiSillaba(-1);
        return;
      }
      if (e.key.length !== 1 || !LETTERA.test(e.key)) return;
      e.preventDefault();
      aggiungiLetteraSillaba(e.key);
      campo.value = lettereSillabe.join('-');
      return;
    }
    if (t.tipo === 'buchi') {
      if (e.key === 'Backspace') {
        e.preventDefault();
        for (let i = buchiIndici.length - 1; i >= 0; i--) {
          const idx = buchiIndici[i];
          if (lettereBuchi[idx]) {
            rendiAiuto(lettereBuchi[idx]);
            lettereBuchi[idx] = '';
            break;
          }
        }
        disegnaSlotBuchi(t.risposta);
        return;
      }
      if (e.key.length !== 1 || !LETTERA.test(e.key)) return;
      e.preventDefault();
      mettiLetteraBuco(e.key);
    }
  });

  esercizio.addEventListener('click', () => {
    if (!campo.disabled) campo.focus();
  });

  if (indietro) {
    indietro.addEventListener('click', () => {
      if (vista !== 'play') return;
      tornaAScelta();
    });
  }

  if (etichette) {
    etichette.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-livello]');
      if (!btn) return;
      scegliLingua(btn.dataset.livello);
    });
  }

  window.addEventListener('resize', () => {
    if (vista !== 'scelta' || !etichette?.classList.contains('pronto')) return;
    posizionaEtichette(sfera.puntiLingue());
  });

  function avviaNome(punto) {
    if (!nome) return;
    fermaNome();
    const miste = permutazioneNome();
    const dest = destinazioniLettere(miste);
    nome.replaceChildren();
    nome.style.width = `${miste.length * SLOT_NOME_EM}em`;
    const x = punto?.x ?? 0;
    const y = punto?.y ?? 0;
    if (x > innerWidth * 0.15 && x < innerWidth * 0.85 && y > innerHeight * 0.08 && y < innerHeight * 0.65) {
      nome.style.left = `${x}px`;
      nome.style.top = `${y}px`;
    } else {
      nome.style.left = '50%';
      nome.style.top = '38%';
    }
    [...miste].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'nome-lettera';
      s.textContent = ch;
      s.dataset.da = String(i);
      s.dataset.a = String(dest[i]);
      s.style.position = 'absolute';
      s.style.top = '0';
      s.style.width = `${SLOT_NOME_EM}em`;
      s.style.height = '1.2em';
      s.style.display = 'flex';
      s.style.alignItems = 'center';
      s.style.justifyContent = 'center';
      s.style.left = `${i * SLOT_NOME_EM}em`;
      nome.append(s);
    });
    nome.style.position = 'fixed';
    nome.style.zIndex = '7';
    nome.style.margin = '0';
    nome.style.transform = 'translate(-50%, -50%)';
    nome.style.pointerEvents = 'none';
    nome.style.height = '1.2em';
    nome.style.opacity = '1';
    nome.style.color = '#f4e6d6';
    nome.style.fontWeight = '700';
    nome.style.fontSize = 'clamp(16px, 2.3vw, 28px)';
    nome.dataset.misto = miste;
    nome.setAttribute('aria-label', NOME_GIOCO);
    nome.classList.remove('via');
    nome.classList.add('pronto');
    nome.removeAttribute('aria-hidden');
    const t0 = performance.now();
    const tickNome = () => {
      const u = progressoComposizione((performance.now() - t0) / 1000);
      for (const s of nome.querySelectorAll('.nome-lettera')) {
        const da = Number(s.dataset.da);
        const a = Number(s.dataset.a);
        s.style.left = `${(da + (a - da) * u) * SLOT_NOME_EM}em`;
      }
      if (u < 1) rafNome = window.requestAnimationFrame(tickNome);
      else {
        rafNome = 0;
        timerNome = window.setTimeout(mostraInizia, PAUSA_INIZIA_S * 1000);
      }
    };
    tickNome();
  }

  sfera.onIntroClick(inizia);
  sfera.onNomePronto((punto) => {
    if (partita || vista !== 'intro') return;
    avviaNome(punto);
  });
  mostraIngresso();
}
