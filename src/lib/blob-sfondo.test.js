import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BLOB_PRESENTAZIONE, rotazioneBlob, derivaBlob } from './blob-sfondo.js';

describe('blob di sfondo della presentazione', () => {
  it('sono tre, con i colori del gioco: miele, cielo, lilla', () => {
    assert.equal(BLOB_PRESENTAZIONE.length, 3);
    assert.equal(BLOB_PRESENTAZIONE[0].colore, 0xf6d05a);
    assert.equal(BLOB_PRESENTAZIONE[1].colore, 0x73c3ee);
    assert.equal(BLOB_PRESENTAZIONE[2].colore, 0xc9b0d8);
  });

  it('si spostano piano e ruotano come la sfera del gioco', () => {
    for (const b of BLOB_PRESENTAZIONE) {
      assert.ok(b.derivaX > 0.08);
      assert.ok(b.derivaY > 0.08);
      assert.ok(b.derivaT > 0);
    }
    const ferma = rotazioneBlob(0);
    const dopo = rotazioneBlob(1);
    assert.equal(ferma.y, 0);
    assert.equal(dopo.y, 0.18);
    const miele = BLOB_PRESENTAZIONE[0];
    const a = derivaBlob(0, miele, 0);
    const b = derivaBlob(2, miele, 0);
    assert.notEqual(a.x, b.x);
    assert.notEqual(a.y, b.y);
  });
});
