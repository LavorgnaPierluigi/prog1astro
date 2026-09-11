import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  direzioneDaDelta,
  indiceDopoScorrimento,
  faseCambio,
  faseApertura,
  FADE_OUT_MS,
  VUOTO_MS,
  FADE_IN_MS,
  DURATA_CAMBIO_MS,
  APERTURA_BLOB_MS,
  APERTURA_ATTESA_MS,
  APERTURA_TITOLO_MS,
  APERTURA_PAUSA_MS,
  APERTURA_RESTO_MS,
} from './presentazione.js';

describe('scorrimento della presentazione', () => {
  it('avanza di uno e non oltrepassa l’ultimo testo', () => {
    assert.equal(indiceDopoScorrimento(0, 1, 4), 1);
    assert.equal(indiceDopoScorrimento(3, 1, 4), 3);
  });

  it('torna indietro e non va sotto il primo testo', () => {
    assert.equal(indiceDopoScorrimento(2, -1, 4), 1);
    assert.equal(indiceDopoScorrimento(0, -1, 4), 0);
  });

  it('una rotella piccola non cambia testo; una rotella chiara sì', () => {
    assert.equal(direzioneDaDelta(12), 0);
    assert.equal(direzioneDaDelta(80), 1);
    assert.equal(direzioneDaDelta(-80), -1);
  });

  it('dopo lo scroll il testo esce un secondo, resta vuoto un secondo, poi entra un secondo', () => {
    assert.equal(FADE_OUT_MS, 1000);
    assert.equal(VUOTO_MS, 1000);
    assert.equal(FADE_IN_MS, 1000);
    assert.equal(DURATA_CAMBIO_MS, 3000);
    assert.equal(faseCambio(0), 'esce');
    assert.equal(faseCambio(999), 'esce');
    assert.equal(faseCambio(1000), 'vuoto');
    assert.equal(faseCambio(1999), 'vuoto');
    assert.equal(faseCambio(2000), 'entra');
    assert.equal(faseCambio(2999), 'entra');
    assert.equal(faseCambio(3000), 'fermo');
  });
});

describe('apertura della prima schermata', () => {
  it('il blob entra in due secondi, poi un secondo di attesa, poi BLUBLINO in due secondi, poi una pausa, poi il resto', () => {
    assert.equal(APERTURA_BLOB_MS, 2000);
    assert.equal(APERTURA_ATTESA_MS, 1000);
    assert.equal(APERTURA_TITOLO_MS, 2000);
    assert.equal(APERTURA_PAUSA_MS, 1000);
    assert.equal(APERTURA_RESTO_MS, 2000);
    assert.equal(faseApertura(0), 'blob');
    assert.equal(faseApertura(1999), 'blob');
    assert.equal(faseApertura(2000), 'attesa');
    assert.equal(faseApertura(2999), 'attesa');
    assert.equal(faseApertura(3000), 'titolo');
    assert.equal(faseApertura(4999), 'titolo');
    assert.equal(faseApertura(5000), 'pausa');
    assert.equal(faseApertura(5999), 'pausa');
    assert.equal(faseApertura(6000), 'resto');
    assert.equal(faseApertura(7999), 'resto');
    assert.equal(faseApertura(8000), 'pronto');
  });
});
