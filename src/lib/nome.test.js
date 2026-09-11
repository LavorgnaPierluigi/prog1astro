import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { permutazioneNome, permutazioneIndici, progressoComposizione, destinazioniLettere, visibileInizia, PAUSA_INIZIA_S } from './nome.js';

describe('nome BLUBLINO', () => {
  it('compare con le stesse lettere, ma non già in ordine', () => {
    const miste = permutazioneNome('BLUBLINO', () => 0);
    assert.equal(miste.length, 8);
    assert.deepEqual([...miste].sort(), [...'BLUBLINO'].sort());
    assert.notEqual(miste, 'BLUBLINO');
  });

  it('ogni lettera parte da un posto diverso', () => {
    const idx = permutazioneIndici(8, () => 0);
    assert.equal(idx.length, 8);
    assert.deepEqual([...idx].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7]);
    assert.notDeepEqual(idx, [0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it('resta mescolato due secondi, poi in quattro secondi si mette a posto', () => {
    assert.equal(progressoComposizione(0), 0);
    assert.equal(progressoComposizione(1.99), 0);
    assert.equal(progressoComposizione(2), 0);
    assert.ok(progressoComposizione(4) > 0 && progressoComposizione(4) < 1);
    assert.equal(progressoComposizione(6), 1);
    assert.equal(progressoComposizione(8), 1);
  });

  it('ogni lettera mescolata sa in quale posto deve arrivare', () => {
    const dest = destinazioniLettere('OLNIBULB', 'BLUBLINO');
    const ricomposta = Array(8);
    [...'OLNIBULB'].forEach((ch, i) => {
      ricomposta[dest[i]] = ch;
    });
    assert.equal(ricomposta.join(''), 'BLUBLINO');
    assert.notDeepEqual(
      dest.map((d, i) => i === d),
      Array(8).fill(true),
    );
  });

  it('INIZIA compare due secondi dopo che BLUBLINO è a posto', () => {
    assert.equal(PAUSA_INIZIA_S, 2);
    assert.equal(visibileInizia(0), false);
    assert.equal(visibileInizia(6), false);
    assert.equal(visibileInizia(7.99), false);
    assert.equal(visibileInizia(8), true);
  });
});
