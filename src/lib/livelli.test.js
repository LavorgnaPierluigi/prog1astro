import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FINE_PARTITA_MS, LINGUE, linguaDaId } from './livelli.js';

describe('lingue di gioco', () => {
  it('ha italiano e inglese', () => {
    assert.equal(LINGUE.length, 2);
    assert.deepEqual(LINGUE.map((l) => l.id), ['italiano', 'inglese']);
  });

  it('trova una lingua dall’id', () => {
    assert.equal(linguaDaId('inglese').id, 'inglese');
    assert.equal(linguaDaId('no').id, 'italiano');
  });

  it('dopo you win o game over aspetta cinque secondi', () => {
    assert.equal(FINE_PARTITA_MS, 5000);
  });
});
