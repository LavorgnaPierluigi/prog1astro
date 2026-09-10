import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { COPPIE } from '../data/coppie.js';
import {
  coppiaCorrente,
  mescola,
  normalizza,
  nuovaPartita,
  rispondi,
  stessaParola,
} from './gioco.js';

const mini = [
  { sinistra: 'credito', destra: 'identità', risposta: 'carta' },
  { sinistra: 'nero', destra: 'bianco', risposta: 'oro' },
  { sinistra: 'lattea', destra: 'mezzo', risposta: 'via' },
];

describe('normalizza', () => {
  it('ignora maiuscole e accenti', () => {
    assert.equal(normalizza('Città'), 'citta');
    assert.equal(normalizza('  CARTA  '), 'carta');
  });
});

describe('stessaParola', () => {
  it('accetta carta e CARTA', () => {
    assert.equal(stessaParola('carta', 'CARTA'), true);
  });

  it('accetta la parola senza accento', () => {
    assert.equal(stessaParola('citta', 'città'), true);
  });

  it('rifiuta una parola diversa', () => {
    assert.equal(stessaParola('carta', 'chiave'), false);
  });
});

describe('mescola', () => {
  it('tiene le stesse coppie in un altro ordine', () => {
    const miste = mescola(mini, () => 0);
    assert.deepEqual(
      [...miste].sort((a, b) => a.risposta.localeCompare(b.risposta)),
      [...mini].sort((a, b) => a.risposta.localeCompare(b.risposta)),
    );
    assert.notDeepEqual(miste.map((c) => c.risposta), mini.map((c) => c.risposta));
  });
});

describe('partita', () => {
  it('parte dalla prima coppia del mazzo mescolato', () => {
    const partita = nuovaPartita(mini, () => 0);
    assert.equal(partita.fase, 'play');
    assert.equal(coppiaCorrente(partita).risposta, mescola(mini, () => 0)[0].risposta);
  });

  it('una risposta giusta rimpicciolisce e alza la serie', () => {
    const partita = nuovaPartita(mini, () => 0);
    const dopo = rispondi(partita, coppiaCorrente(partita).risposta);
    assert.equal(dopo.giusta, true);
    assert.equal(dopo.serieGiuste, 1);
    assert.equal(dopo.serieSbagli, 0);
    assert.equal(dopo.umore, 1);
    assert.equal(dopo.fase, 'play');
    assert.equal(dopo.indice, 1);
  });

  it('una risposta sbagliata ingrandisce e spezza la serie delle giuste', () => {
    const partita = nuovaPartita(mini, () => 0);
    const dopoGiusta = rispondi(partita, coppiaCorrente(partita).risposta);
    const dopoSbagliata = rispondi(dopoGiusta, 'no');
    assert.equal(dopoSbagliata.giusta, false);
    assert.equal(dopoSbagliata.serieGiuste, 0);
    assert.equal(dopoSbagliata.serieSbagli, 1);
    assert.equal(dopoSbagliata.umore, 0);
  });

  it('dieci giuste di fila fanno you win', () => {
    const coppie = Array.from({ length: 12 }, (_, i) => ({
      sinistra: 'a',
      destra: 'b',
      risposta: `ok${i}`,
    }));
    let partita = nuovaPartita(coppie, () => 0);
    for (let i = 0; i < 9; i++) {
      partita = rispondi(partita, coppiaCorrente(partita).risposta);
    }
    assert.equal(partita.fase, 'play');
    partita = rispondi(partita, coppiaCorrente(partita).risposta);
    assert.equal(partita.fase, 'win');
    assert.equal(partita.serieGiuste, 10);
  });

  it('dieci sbagliate di fila fanno game over', () => {
    const coppie = Array.from({ length: 12 }, (_, i) => ({
      sinistra: 'a',
      destra: 'b',
      risposta: `ok${i}`,
    }));
    let partita = nuovaPartita(coppie, () => 0);
    for (let i = 0; i < 9; i++) {
      partita = rispondi(partita, 'no');
    }
    assert.equal(partita.fase, 'play');
    partita = rispondi(partita, 'no');
    assert.equal(partita.fase, 'lose');
    assert.equal(partita.serieSbagli, 10);
  });

  it('se il mazzo finisce senza serie da dieci la partita è esausta', () => {
    let partita = nuovaPartita(mini, () => 0);
    partita = rispondi(partita, coppiaCorrente(partita).risposta);
    partita = rispondi(partita, 'no');
    partita = rispondi(partita, coppiaCorrente(partita).risposta);
    assert.equal(partita.fase, 'esausta');
  });
});

describe('coppie', () => {
  it('sono 50, ciascuna con una risposta di sole lettere', () => {
    assert.equal(COPPIE.length, 50);
    for (const coppia of COPPIE) {
      assert.match(coppia.risposta, /^[a-zàèéìòù]+$/i);
      assert.ok(coppia.sinistra);
      assert.ok(coppia.destra);
    }
  });
});
