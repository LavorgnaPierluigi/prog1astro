import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { unisciBase } from './percorso.js';

describe('percorsi del sito', () => {
  it('in locale resta sulla radice; su GitHub Pages mette il nome del repo', () => {
    assert.equal(unisciBase('/', 'gioco'), '/gioco');
    assert.equal(unisciBase('/', ''), '/');
    assert.equal(unisciBase('/prog1astro', 'gioco'), '/prog1astro/gioco');
    assert.equal(unisciBase('/prog1astro/', 'gioco'), '/prog1astro/gioco');
    assert.equal(unisciBase('/prog1astro', ''), '/prog1astro/');
    assert.equal(unisciBase('/prog1astro/', 'favicon.svg'), '/prog1astro/favicon.svg');
  });
});
