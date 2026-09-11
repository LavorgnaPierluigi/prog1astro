export const NERO_PRIMA_GIOCO_MS = 2200;
export const FINE_PARTITA_MS = 5000;

export const LINGUE = [
  { id: 'italiano', etichetta: 'italiano', colore: 0xf6d05a },
  { id: 'inglese', etichetta: 'inglese', colore: 0x73c3ee },
];

export function linguaDaId(id) {
  return LINGUE.find((l) => l.id === id) ?? LINGUE[0];
}
