/* Stima del valore di casa (bozza 20/11/2026).
 * Il numero lo calcola questo codice, non un'AI: quotazione della zona x metri quadri x correzioni.
 * DATI PROVVISORI: intervalli OMI abitazioni civili, 1° semestre 2026, come riportati da kwpropertiesmilano.com
 * (Prati, Della Vittoria), media Prati-Trionfale da dellevittorie.it, e per Aurelio, Balduina, Trionfale alto,
 * Monte Mario e Flaminio gli intervalli OMI 1° sem. 2026 riportati nelle ricerche del 20/11. Da verificare sul portale OMI
 * dell'Agenzia delle Entrate e da far confermare a iHouse prima di pubblicare.
 * Le correzioni (piano, stato, esterni) sono regole d'esperienza: vanno tarate sulle vendite vere di iHouse.
 */
(function (root) {
  const ZONE = {   // in ordine di distanza dall'Urbe (Via Candia)
    prati:     {nome: 'Prati e Borgo',                 min: 4900, max: 6800},  // OMI Prati (Cola di Rienzo); Borgo: VERIFICARE
    trionfale: {nome: 'Trionfale (Candia, Ottaviano)', min: 3800, max: 5500},  // da media 4.656 €/mq, ±18%: VERIFICARE
    vittoria:  {nome: 'Della Vittoria / Mazzini',      min: 4000, max: 5700},
    aurelio:   {nome: 'Aurelio (Gregorio VII)',        min: 3300, max: 4700},  // OMI Aurelio Gregorio VII
    balduina:  {nome: 'Balduina e Medaglie d\'Oro',    min: 3200, max: 4400},  // OMI Balduina Giovenale (Belsito 3.000-4.300)
    igea:      {nome: 'Trionfale alto (Igea, Fani)',   min: 2850, max: 4200},  // OMI Trionfale Igea
    montemario:{nome: 'Monte Mario',                   min: 2400, max: 3400},  // OMI Monte Mario Alto
    flaminio:  {nome: 'Flaminio',                      min: 4900, max: 7100},  // OMI Flaminio Porta del Popolo
  };
  // Dove cade la casa nell'intervallo OMI, secondo lo stato
  const STATO = {ristrutturare: 0.10, buono: 0.50, ristrutturato: 0.85};
  const PIANO = {terra: 0.92, basso: 1.00, alto: 1.04, attico: 1.10};
  const SENZA_ASCENSORE_ALTO = 0.90;     // dal 3° piano in su senza ascensore
  const ESTERNI = {balcone: 0.02, terrazzo: 0.06, box: 0.05, cantina: 0.01};
  const MARGINE = 0.08;                  // ± sull'importo: è una stima, non una perizia
  const MQ_MIN = 20, MQ_MAX = 600;

  // Solo chiavi scritte qui: 'constructor', 'toString', '__proto__' & co. danno undefined, non una funzione
  const voce = (tab, k) => (typeof k === 'string' && Object.prototype.hasOwnProperty.call(tab, k)) ? tab[k] : undefined;

  function arrotonda(x) { return Math.round(x / 5000) * 5000; }

  /** d = {zona, mq, piano, ascensore (bool), stato, esterni: [..]}
   *  Ritorna {da, a, mq_prezzo} oppure {errore} se i dati non bastano. Mai un numero inventato. */
  function stima(d) {
    const z = voce(ZONE, d && d.zona);
    if (!z) return {errore: 'zona'};
    const mq = Number(d.mq);
    if (!Number.isFinite(mq) || mq < MQ_MIN || mq > MQ_MAX) return {errore: 'mq'};
    const posizione = voce(STATO, d.stato);
    if (posizione === undefined) return {errore: 'stato'};
    let k = voce(PIANO, d.piano);
    if (k === undefined) return {errore: 'piano'};
    if ((d.piano === 'alto' || d.piano === 'attico') && d.ascensore === false) k *= SENZA_ASCENSORE_ALTO;
    const extra = [...new Set(Array.isArray(d.esterni) ? d.esterni : [])].reduce((s, e) => s + (voce(ESTERNI, e) || 0), 0);  // solo voci note: 'toString' & co. non contano
    const euroMq = (z.min + (z.max - z.min) * posizione) * k * (1 + extra);
    const centro = euroMq * mq;
    return {da: arrotonda(centro * (1 - MARGINE)), a: arrotonda(centro * (1 + MARGINE)), mq_prezzo: Math.round(euroMq / 50) * 50};
  }

  const api = {stima, ZONE, MQ_MIN, MQ_MAX};
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Stima = api;
})(this);
