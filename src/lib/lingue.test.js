import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { posBlobLingua, uSeparazione } from './lingue.js';
import { LINGUE, linguaDaId } from './livelli.js';

describe('lingue', () => {
  it('ha italiano e inglese, colori distinti', () => {
    assert.equal(LINGUE.length, 2);
    assert.deepEqual(LINGUE.map((l) => l.id), ['italiano', 'inglese']);
    assert.equal(LINGUE[0].colore, 0xf6d05a);
    assert.equal(LINGUE[1].colore, 0x73c3ee);
    assert.notEqual(LINGUE[0].colore, LINGUE[1].colore);
  });

  it('trova una lingua dall’id', () => {
    assert.equal(linguaDaId('inglese').etichetta, 'inglese');
    assert.equal(linguaDaId('no').id, 'italiano');
  });
});

describe('separazione dei blob', () => {
  it('parte da zero e arriva a uno', () => {
    assert.equal(uSeparazione(-1), 0);
    assert.equal(uSeparazione(0), 0);
    assert.equal(uSeparazione(1400), 1);
    assert.ok(uSeparazione(700) > 0 && uSeparazione(700) < 1);
  });

  it('il blob sinistro va in basso a sinistra, il destro in basso a destra', () => {
    const sx = posBlobLingua(1, -1, { x: 0, y: 0 }, 1.6, 1.1);
    const dx = posBlobLingua(1, 1, { x: 0, y: 0 }, 1.6, 1.1);
    assert.ok(sx.x < 0);
    assert.ok(dx.x > 0);
    assert.ok(sx.y < 0);
    assert.ok(dx.y < 0);
    assert.deepEqual(posBlobLingua(0, -1, { x: 0, y: 0 }, 1.6, 1.1), { x: 0, y: 0 });
  });
});
