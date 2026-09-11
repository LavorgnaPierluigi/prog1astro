import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SCALA_GIOCO, notaSottofondo } from './suoni.js';

describe('musica di sottofondo', () => {
  it('resta su note calme, senza salti acuti', () => {
    assert.equal(SCALA_GIOCO.length, 5);
    for (const hz of SCALA_GIOCO) {
      assert.ok(hz >= 180 && hz <= 480);
    }
    for (let i = 0; i < 16; i++) {
      const hz = notaSottofondo(i);
      assert.ok(SCALA_GIOCO.includes(hz));
      assert.ok(hz >= 180 && hz <= 480);
    }
  });
});
