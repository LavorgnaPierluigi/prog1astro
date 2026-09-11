import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PAROLE_IT } from './parole.js';
import {
  mescola,
  normalizza,
  nuovaPartita,
  parolaCorrente,
  rispondi,
  stessaParola,
} from './gioco.js';

const mini = [
  { risposta: 'casa', sillabe: 'ca-sa' },
  { risposta: 'cane', sillabe: 'ca-ne' },
  { risposta: 'gatto', sillabe: 'gat-to' },
];

describe('normalizza', () => {
  it('ignora maiuscole e accenti', () => {
    assert.equal(normalizza('Città'), 'citta');
    assert.equal(normalizza('  CASA  '), 'casa');
  });
});

describe('stessaParola', () => {
  it('accetta casa e CASA', () => {
    assert.equal(stessaParola('casa', 'CASA'), true);
  });

  it('accetta la parola senza accento', () => {
    assert.equal(stessaParola('citta', 'città'), true);
  });

  it('rifiuta una parola diversa', () => {
    assert.equal(stessaParola('casa', 'cane'), false);
  });
});

describe('mescola', () => {
  it('tiene le stesse parole in un altro ordine', () => {
    const miste = mescola(mini, () => 0);
    assert.deepEqual(
      [...miste].sort((a, b) => a.risposta.localeCompare(b.risposta)),
      [...mini].sort((a, b) => a.risposta.localeCompare(b.risposta)),
    );
    assert.notDeepEqual(miste.map((c) => c.risposta), mini.map((c) => c.risposta));
  });
});

describe('partita', () => {
  it('parte dalla prima parola del mazzo mescolato', () => {
    const partita = nuovaPartita(mini, () => 0);
    assert.equal(partita.fase, 'play');
    assert.equal(parolaCorrente(partita).risposta, mescola(mini, () => 0)[0].risposta);
    assert.ok(['tessere', 'sillabe', 'buchi'].includes(parolaCorrente(partita).tipo));
  });

  it('una risposta giusta rimpicciolisce e alza la serie', () => {
    const partita = nuovaPartita(mini, () => 0);
    const turno = parolaCorrente(partita);
    const testo = turno.tipo === 'sillabe' ? turno.sillabe : turno.risposta;
    const dopo = rispondi(partita, testo);
    assert.equal(dopo.giusta, true);
    assert.equal(dopo.serieGiuste, 1);
    assert.equal(dopo.serieSbagli, 0);
    assert.equal(dopo.umore, 1);
    assert.equal(dopo.fase, 'play');
    assert.equal(dopo.indice, 1);
  });

  it('una risposta sbagliata ingrandisce e spezza la serie delle giuste', () => {
    const partita = nuovaPartita(mini, () => 0);
    const turno = parolaCorrente(partita);
    const testo = turno.tipo === 'sillabe' ? turno.sillabe : turno.risposta;
    const dopoGiusta = rispondi(partita, testo);
    const dopoSbagliata = rispondi(dopoGiusta, 'no');
    assert.equal(dopoSbagliata.giusta, false);
    assert.equal(dopoSbagliata.serieGiuste, 0);
    assert.equal(dopoSbagliata.serieSbagli, 1);
    assert.equal(dopoSbagliata.umore, 0);
  });

  it('dieci giuste di fila fanno you win', () => {
    const parole = Array.from({ length: 12 }, (_, i) => ({
      risposta: `ok${i}`,
      sillabe: `o-k${i}`,
    }));
    let partita = nuovaPartita(parole, () => 0);
    for (let i = 0; i < 9; i++) {
      const t = parolaCorrente(partita);
      partita = rispondi(partita, t.tipo === 'sillabe' ? t.sillabe : t.risposta);
    }
    assert.equal(partita.fase, 'play');
    const ultimo = parolaCorrente(partita);
    partita = rispondi(partita, ultimo.tipo === 'sillabe' ? ultimo.sillabe : ultimo.risposta);
    assert.equal(partita.fase, 'win');
    assert.equal(partita.serieGiuste, 10);
  });

  it('dieci sbagliate di fila fanno game over', () => {
    const parole = Array.from({ length: 12 }, (_, i) => ({
      risposta: `ok${i}`,
      sillabe: `o-k${i}`,
    }));
    let partita = nuovaPartita(parole, () => 0);
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
    const t0 = parolaCorrente(partita);
    partita = rispondi(partita, t0.tipo === 'sillabe' ? t0.sillabe : t0.risposta);
    partita = rispondi(partita, 'no');
    const t2 = parolaCorrente(partita);
    partita = rispondi(partita, t2.tipo === 'sillabe' ? t2.sillabe : t2.risposta);
    assert.equal(partita.fase, 'esausta');
  });

  it('le tessere usano parole di al massimo cinque lettere', () => {
    const partita = nuovaPartita(PAROLE_IT, () => 0.3);
    const tessere = partita.mazzo.filter((p) => p.tipo === 'tessere');
    assert.ok(tessere.length > 0);
    for (const p of tessere) assert.ok(p.risposta.length <= 5, p.risposta);
  });
});

describe('elenco italiano', () => {
  it('sono 50 parole con le sillabe', () => {
    assert.equal(PAROLE_IT.length, 50);
    for (const p of PAROLE_IT) {
      assert.match(p.risposta, /^[a-zàèéìòù]+$/i);
      assert.equal(p.sillabe.replace(/-/g, ''), p.risposta);
    }
  });
});
