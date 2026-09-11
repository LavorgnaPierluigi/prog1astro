import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PAROLE_EN, PAROLE_IT } from './parole.js';

describe('parole', () => {
  it('ha 50 parole italiane e 50 inglesi, ciascuna con le sillabe', () => {
    assert.equal(PAROLE_IT.length, 50);
    assert.equal(PAROLE_EN.length, 50);
    for (const p of [...PAROLE_IT, ...PAROLE_EN]) {
      assert.match(p.risposta, /^[a-zàèéìòù]+$/i);
      assert.match(p.sillabe, /^[a-zàèéìòù]+(-[a-zàèéìòù]+)+$/i);
      assert.equal(p.sillabe.replace(/-/g, ''), p.risposta);
    }
  });

  it('ha parole corte per le tessere e parole più lunghe per gli altri giochi', () => {
    for (const elenco of [PAROLE_IT, PAROLE_EN]) {
      const corte = elenco.filter((p) => p.risposta.length <= 5);
      const lunghe = elenco.filter((p) => p.risposta.length >= 6);
      assert.ok(corte.length >= 12, 'servono abbastanza parole corte per le tessere');
      assert.ok(lunghe.length >= 12, 'servono abbastanza parole lunghe per sillabe e buchi');
      for (const p of corte) assert.ok(p.risposta.length >= 4, p.risposta);
    }
  });
});
