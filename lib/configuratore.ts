/**
 * Configuratore dolci — modello dati e logica pura.
 *
 * Refactor 2026-08-28: il configuratore non seleziona più da una matrice
 * sparsa e chiusa di SKU dichiarate a mano. Il prodotto è ora composto da
 * QUATTRO componenti indipendenti — base, farcitura, dalla credenza,
 * finitura — tutti a scelta singola e obbligatoria, e OGNI combinazione fra
 * loro è una SKU valida: 3 basi × 3 farciture × 6 voci di credenza ×
 * 4 finiture = 216 prodotti, un prodotto cartesiano aperto, non una lista
 * curata. Il dataset (lib/configuratore/dati-dolci.json) resta l'unica
 * fonte di verità sui VOCABOLARI (quali basi/farciture/credenza/finiture
 * esistono), ma non elenca più le combinazioni: costruirle è compito di
 * questo modulo.
 *
 * Grammatura, peso e ordine minimo — prima proprietà della singola
 * combinazione — sono ora proprietà della BASE: con 216 combinazioni aperte
 * non sono più curabili SKU per SKU, e la scelta di farcitura/credenza/
 * finitura resta puramente compositiva (non cambia la logistica).
 *
 * Le funzioni pure (prodotto, quantita, validaStato) restano condivise alla
 * lettera tra client e Server Action: la traduzione mostrata accanto al
 * campo e quella scritta nel payload escono dalla stessa fonte, mai da due
 * implementazioni.
 */

import dati from "./configuratore/dati-dolci.json";

/* ------------------------------- tipi ---------------------------------- */

export type Packaging = {
  vassoi_per_cartone: number | null;
  pezzi_per_vassoio: number | null;
  peso_cartone_kg: number | null;
  cartone_dichiarato_a_peso: boolean;
  pezzi_per_cartone: number;
  cartoni_per_pedana: number;
  cartoni_per_strato: number | null;
  strati_per_pedana: number | null;
  pezzi_per_pedana: number;
  /** la stringa del foglio, conservata come prova della trascrizione */
  testo_originale: string;
};

export type Base = {
  id: string;
  nome: string;
  diametro_cm: number;
  modalita_uso: string;
  packaging: Packaging;
  /** logistica del prodotto finito: farcitura/credenza/finitura sono
   *  compositive, non cambiano grammatura né catena di imballo */
  grammatura_gr: number;
  peso_cartone_kg: number;
  peso_pedana_kg: number;
  ordine_minimo_pedane: number | null;
  ordine_minimo_pezzi: number | null;
};

export type Farcitura = { id: string; nome: string };
export type Credenza = { id: string; nome: string };
export type Finitura = { id: string; nome: string };

export type Dataset = {
  versione: string;
  linea: string;
  fonte: string;
  unita_quantita: string;
  basi: Base[];
  farciture: Farcitura[];
  credenza: Credenza[];
  finiture: Finitura[];
};

/** Un prodotto configurato: i 4 componenti scelti, sempre validi se i 4 id
 *  esistono nei rispettivi vocabolari — non c'è più un lookup che possa
 *  fallire "per combinazione mancante". */
export type Prodotto = {
  sku: string;
  base: string;
  farcitura: string;
  credenza: string;
  finitura: string;
};

/** Traduzione di una quantità lungo la catena logistica. */
export type Quantita = {
  pedane: number;
  cartoni: number;
  pezzi: number;
  peso_kg: number;
};

export const DATASET = dati as Dataset;

/* ------------------------- indici precomputati -------------------------- */

const BASI = new Map(DATASET.basi.map((b) => [b.id, b]));
const FARCITURE = new Map(DATASET.farciture.map((f) => [f.id, f]));
const CREDENZA = new Map(DATASET.credenza.map((c) => [c.id, c]));
const FINITURE = new Map(DATASET.finiture.map((f) => [f.id, f]));

export const baseDi = (id: string): Base | null => BASI.get(id) ?? null;
export const farcituraVoce = (id: string): Farcitura | null =>
  FARCITURE.get(id) ?? null;
export const credenzaVoce = (id: string): Credenza | null =>
  CREDENZA.get(id) ?? null;
export const finituraVoce = (id: string): Finitura | null =>
  FINITURE.get(id) ?? null;

/* --------------------------- le funzioni pure ---------------------------- */

/** Costruisce il prodotto se i 4 id esistono nei vocabolari; altrimenti
 *  null. Nessuna combinazione è esclusa: è il prodotto cartesiano aperto
 *  richiesto dal 2026-08-28. */
export const prodotto = (
  base: string,
  farcitura: string,
  credenza: string,
  finitura: string
): Prodotto | null => {
  if (
    !BASI.has(base) ||
    !FARCITURE.has(farcitura) ||
    !CREDENZA.has(credenza) ||
    !FINITURE.has(finitura)
  )
    return null;
  return {
    sku: `${base}--${farcitura}--${credenza}--${finitura}`,
    base,
    farcitura,
    credenza,
    finitura,
  };
};

/** Conversione della quantità lungo la catena logistica. Grammatura e pesi
 *  vivono sulla base: farcitura/credenza/finitura non li cambiano. */
export const quantita = (base: string, pedane: number): Quantita | null => {
  const b = BASI.get(base);
  if (!b) return null;
  const p = b.packaging;
  return {
    pedane,
    cartoni: pedane * p.cartoni_per_pedana,
    pezzi: pedane * p.pezzi_per_pedana,
    peso_kg: Math.round(pedane * b.peso_pedana_kg),
  };
};

export type StatoConfiguratore = {
  base: string;
  farcitura: string;
  credenza: string;
  finitura: string;
  pedane: number;
};

export type EsitoValidazione =
  | { ok: true; sku: string; quantita: Quantita }
  | { ok: false; errore: "COMBINAZIONE_INESISTENTE" }
  | { ok: false; errore: "QUANTITA_NON_VALIDA" }
  | {
      ok: false;
      errore: "SOTTO_ORDINE_MINIMO";
      minimo_pedane: number;
      minimo_pezzi: number | null;
    };

/** Validazione dello stato completo, prima dell'invio. Va richiamata anche
 *  lato server alla ricezione, con lo stesso dataset: un URL costruito a
 *  mano o un client rimasto aperto attraverso un deploy non devono entrare
 *  nel gestionale.
 *
 *  La quantità è in pedane INTERE: mezze pedane non esistono nella catena
 *  descritta dal foglio. Il minimo, dove dichiarato, è della base. */
export const validaStato = (s: StatoConfiguratore): EsitoValidazione => {
  const p = prodotto(s.base, s.farcitura, s.credenza, s.finitura);
  if (!p) return { ok: false, errore: "COMBINAZIONE_INESISTENTE" };
  if (!Number.isInteger(s.pedane) || s.pedane < 1)
    return { ok: false, errore: "QUANTITA_NON_VALIDA" };
  const b = BASI.get(s.base)!;
  if (b.ordine_minimo_pedane != null && s.pedane < b.ordine_minimo_pedane)
    return {
      ok: false,
      errore: "SOTTO_ORDINE_MINIMO",
      minimo_pedane: b.ordine_minimo_pedane,
      minimo_pezzi: b.ordine_minimo_pezzi,
    };
  return { ok: true, sku: p.sku, quantita: quantita(s.base, s.pedane)! };
};

/* --------------------------- parsing dell'URL --------------------------- */

/** Esito del parsing dei segmenti di
 *  /configuratore/[[...scelta]]. `render` porta lo stato iniziale (ognuno
 *  dei 4 componenti, quando presente); `redirect` normalizza gli URL
 *  sporchi (id fuori vocabolario, segmenti in eccesso) senza mai mostrare
 *  un errore tecnico. */
export type EsitoParse =
  | {
      tipo: "render";
      base: Base | null;
      farcitura: Farcitura | null;
      credenza: Credenza | null;
      prodotto: Prodotto | null;
    }
  | { tipo: "redirect"; destinazione: string };

export function parseScelta(scelta: string[] | undefined): EsitoParse {
  const [idBase, idFarcitura, idCredenza, idFinitura, ...resto] = scelta ?? [];

  if (!idBase)
    return { tipo: "render", base: null, farcitura: null, credenza: null, prodotto: null };

  const base = BASI.get(idBase);
  /* base inesistente: capita spesso con link salvati prima del 2026-08-28
     (bomba, golosone, intriko…, uscite dal configuratore) — si riparte dal
     passo 1 con l'avviso discreto, non un 404 */
  if (!base) return { tipo: "redirect", destinazione: "/configuratore?nd=1" };

  if (!idFarcitura)
    return { tipo: "render", base, farcitura: null, credenza: null, prodotto: null };

  const farcitura = FARCITURE.get(idFarcitura);
  if (!farcitura)
    return { tipo: "redirect", destinazione: `/configuratore/${base.id}?nd=1` };

  if (!idCredenza)
    return { tipo: "render", base, farcitura, credenza: null, prodotto: null };

  const credenza = CREDENZA.get(idCredenza);
  if (!credenza)
    return {
      tipo: "redirect",
      destinazione: `/configuratore/${base.id}/${farcitura.id}?nd=1`,
    };

  if (!idFinitura)
    return { tipo: "render", base, farcitura, credenza, prodotto: null };

  const finitura = FINITURE.get(idFinitura);
  if (!finitura)
    return {
      tipo: "redirect",
      destinazione: `/configuratore/${base.id}/${farcitura.id}/${credenza.id}?nd=1`,
    };

  /* segmenti in eccesso: si tengono i primi quattro e si normalizza */
  if (resto.length > 0)
    return {
      tipo: "redirect",
      destinazione: `/configuratore/${base.id}/${farcitura.id}/${credenza.id}/${finitura.id}`,
    };

  return {
    tipo: "render",
    base,
    farcitura,
    credenza,
    prodotto: {
      sku: `${base.id}--${farcitura.id}--${credenza.id}--${finitura.id}`,
      base: base.id,
      farcitura: farcitura.id,
      credenza: credenza.id,
      finitura: finitura.id,
    },
  };
}

/** Parsing tollerante per il client: dal pathname allo stato, senza
 *  redirect (il client naviga solo verso URL canonici). Il pathname arriva
 *  col prefisso lingua (/fi/configuratore/…): si parte dal segmento
 *  "configuratore", ovunque stia. */
export function statoDaPathname(pathname: string): {
  base: Base | null;
  farcitura: Farcitura | null;
  credenza: Credenza | null;
  prodotto: Prodotto | null;
} {
  const tutti = pathname.split("/").filter(Boolean);
  const daConfiguratore = tutti.indexOf("configuratore");
  const segmenti = daConfiguratore >= 0 ? tutti.slice(daConfiguratore + 1) : [];
  const [idBase, idFarcitura, idCredenza, idFinitura] = segmenti;

  const base = idBase ? (BASI.get(idBase) ?? null) : null;
  const farcitura =
    base && idFarcitura ? (FARCITURE.get(idFarcitura) ?? null) : null;
  const credenza =
    farcitura && idCredenza ? (CREDENZA.get(idCredenza) ?? null) : null;
  const finitura =
    credenza && idFinitura ? (FINITURE.get(idFinitura) ?? null) : null;

  return {
    base,
    farcitura,
    credenza,
    prodotto:
      base && farcitura && credenza && finitura
        ? {
            sku: `${base.id}--${farcitura.id}--${credenza.id}--${finitura.id}`,
            base: base.id,
            farcitura: farcitura.id,
            credenza: credenza.id,
            finitura: finitura.id,
          }
        : null,
  };
}

/*
 * Le foto del configuratore arrivano SOLO dalle cartelle di
 * public/img/configuratore/ (una per base, per farcitura, per voce di
 * credenza, per finitura, per ogni stato del prodotto). Il prebuild genera
 * il manifest chiave → URL letto da lib/configuratore/foto.ts; le mappe
 * scendono ai client component come prop. L'assenza della chiave significa
 * "foto non ancora arrivata" e la UI ripiega sullo stato precedente o sul
 * placeholder tipografico — mai la foto di un'altra scelta.
 */

/** Stato visibile del prodotto (base, base--farcitura,
 *  base--farcitura--credenza, sku completo) → URL foto. */
export type FotoStati = Record<string, string>;

/** Id farcitura → URL della foto dell'ingrediente DA SOLO (tessere del
 *  passo 2). */
export type FotoFarciture = Record<string, string>;

/** Id voce di credenza → URL della foto dell'ingrediente DA SOLO (tessere
 *  del passo 3). */
export type FotoCredenza = Record<string, string>;

/** Id finitura → URL della foto della finitura DA SOLA (tessere del
 *  passo 4). */
export type FotoFinitura = Record<string, string>;

/* La formattazione dei numeri (3.360 / 3,360 / 3 360) è passata a
   lib/i18n/lingue.ts: cambia con la lingua della pagina, e questo
   modulo resta neutro. */
