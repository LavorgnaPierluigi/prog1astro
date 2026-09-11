import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SALITA_S, SCOPPIO_S, faseBollicina, nomeVisibile, uSalita } from './bollicina.js';

describe('bollicina intro', () => {
  it('prima sale, poi scoppia, poi compare il nome', () => {
    assert.equal(faseBollicina(0.2), 'salita');
    assert.equal(faseBollicina(SALITA_S + 0.1), 'scoppio');
    assert.equal(faseBollicina(SALITA_S + SCOPPIO_S + 0.05), 'nome');
  });

  it('il nome non c’è finché la goccia non è scoppiata', () => {
    assert.equal(nomeVisibile(0.5), false);
    assert.equal(nomeVisibile(SALITA_S + SCOPPIO_S - 0.05), false);
    assert.equal(nomeVisibile(SALITA_S + SCOPPIO_S + 0.05), true);
  });

  it('la salita parte da zero e arriva a uno', () => {
    assert.equal(uSalita(0), 0);
    assert.equal(uSalita(SALITA_S), 1);
    assert.ok(uSalita(0.5) > 0 && uSalita(0.5) < 1);
  });
});
