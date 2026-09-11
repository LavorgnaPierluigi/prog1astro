import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  mostraBuchi,
  mescolaLettere,
  partiSillabe,
  stessaSillabe,
  scegliBuchi,
  tipiPerMazzo,
  lettereAiutoBuchi,
  provaCompleta,
} from './esercizi.js';

describe('tipiPerMazzo', () => {
  it('mette tessere solo sulle parole di al massimo cinque lettere', () => {
    const parole = [
      { risposta: 'casa', sillabe: 'ca-sa' },
      { risposta: 'finestra', sillabe: 'fi-ne-stra' },
      { risposta: 'quaderno', sillabe: 'qua-der-no' },
      { risposta: 'gatto', sillabe: 'gat-to' },
      { risposta: 'bicicletta', sillabe: 'bi-ci-clet-ta' },
      { risposta: 'colazione', sillabe: 'co-la-zio-ne' },
    ];
    const tipi = tipiPerMazzo(parole, () => 0);
    assert.equal(tipi.length, 6);
    for (let i = 0; i < parole.length; i++) {
      if (parole[i].risposta.length <= 5) assert.equal(tipi[i], 'tessere');
      else assert.ok(tipi[i] === 'sillabe' || tipi[i] === 'buchi');
    }
    const altri = tipi.filter((t) => t !== 'tessere');
    assert.ok(altri.includes('sillabe'));
    assert.ok(altri.includes('buchi'));
  });
});

describe('partiSillabe', () => {
  it('spezza la parola nel numero giusto di sillabe', () => {
    assert.deepEqual(partiSillabe('ca-sa'), ['ca', 'sa']);
    assert.deepEqual(partiSillabe('al-be-ro'), ['al', 'be', 'ro']);
    assert.deepEqual(partiSillabe('pan-ta-lo-ne'), ['pan', 'ta', 'lo', 'ne']);
  });
});

describe('stessaSillabe', () => {
  it('accetta le sillabe già spezzate, unite con il trattino', () => {
    assert.equal(stessaSillabe('ca-sa', 'ca-sa'), true);
    assert.equal(stessaSillabe(['ca', 'sa'].join('-'), 'ca-sa'), true);
    assert.equal(stessaSillabe('CASA', 'ca-sa'), false);
    assert.equal(stessaSillabe('ca-ne', 'ca-sa'), false);
    assert.equal(stessaSillabe('ca', 'ca-sa'), false);
    assert.equal(stessaSillabe('casa', 'ca-sa'), false);
  });
});

describe('scegliBuchi', () => {
  it('lascia vedere almeno una lettera', () => {
    const indici = scegliBuchi('casa', () => 0);
    assert.ok(indici.length >= 1);
    assert.ok(indici.length < 4);
    assert.equal(new Set(indici).size, indici.length);
  });
});

describe('lettereAiutoBuchi', () => {
  it('mette sopra le lettere mancanti, ma mischiate', () => {
    const parola = 'finestra';
    const indici = [0, 2, 5];
    const originali = indici.map((i) => parola[i]).join('');
    const aiuto = lettereAiutoBuchi(parola, indici, () => 0);
    assert.deepEqual([...aiuto].sort(), [...originali].sort());
    assert.notEqual(aiuto.join(''), originali);
  });
});

describe('mostraBuchi', () => {
  it('mette il vuoto al posto delle lettere tolte', () => {
    assert.equal(mostraBuchi('casa', [1, 3]), 'c_s_');
  });
});

describe('mescolaLettere', () => {
  it('tiene le stesse lettere in un altro ordine', () => {
    const miste = mescolaLettere('casa', () => 0);
    assert.deepEqual([...miste].sort(), [...'casa'].sort());
    assert.notEqual(miste.join(''), 'casa');
  });
});

describe('provaCompleta', () => {
  it('nelle tessere aspetta che tutti i posti siano pieni', () => {
    const t = { tipo: 'tessere', risposta: 'casa' };
    assert.equal(provaCompleta(t, { testoTessere: 'cas' }), false);
    assert.equal(provaCompleta(t, { testoTessere: 'casa' }), true);
  });

  it('nei buchi aspetta che ogni vuoto abbia una lettera', () => {
    const t = { tipo: 'buchi', risposta: 'casa' };
    assert.equal(provaCompleta(t, { buchiIndici: [1, 3], lettereBuchi: ['c', '', 's', ''] }), false);
    assert.equal(provaCompleta(t, { buchiIndici: [1, 3], lettereBuchi: ['c', 'a', 's', 'a'] }), true);
  });

  it('nelle sillabe è pronta quando ci sono tutte le lettere, anche spezzate male', () => {
    const t = { tipo: 'sillabe', risposta: 'casa', sillabe: 'ca-sa' };
    assert.equal(provaCompleta(t, { lettereSillabe: ['ca', ''] }), false);
    assert.equal(provaCompleta(t, { lettereSillabe: ['ca', 'sa'] }), true);
    assert.equal(provaCompleta(t, { lettereSillabe: ['ca', 'ne'] }), true);
    assert.equal(provaCompleta(t, { lettereSillabe: ['cas', 'a'] }), true);
    const lunga = { tipo: 'sillabe', risposta: 'cioccolato', sillabe: 'cioc-co-la-to' };
    assert.equal(provaCompleta(lunga, { lettereSillabe: ['cio', 'cco', 'la', ''] }), false);
    assert.equal(provaCompleta(lunga, { lettereSillabe: ['cio', 'cco', 'la', 'to'] }), true);
    assert.equal(provaCompleta(lunga, { lettereSillabe: ['cioccolato', '', '', ''] }), true);
  });
});
