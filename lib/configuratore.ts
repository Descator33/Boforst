/**
 * Configuratore dolci — modello dati e logica pura.
 *
 * Matrice 2026-10-22: il configuratore espone una base (Nuvola) e una
 * selezione chiusa di ricette. I quattro componenti restano nello stato e
 * nell'URL, ma una SKU è valida soltanto se compare in `combinazioni`.
 *
 * Grammatura, peso e ordine minimo — prima proprietà della singola
 * combinazione — restano proprietà della BASE: la scelta della ricetta non
 * cambia la logistica.
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
export type Combinazione = {
  base: string;
  farcitura: string;
  credenza: string;
  finitura: string;
};

export type Dataset = {
  versione: string;
  linea: string;
  fonte: string;
  unita_quantita: string;
  basi: Base[];
  farciture: Farcitura[];
  credenza: Credenza[];
  finiture: Finitura[];
  combinazioni: Combinazione[];
};

/** Un prodotto configurato: i 4 componenti di una ricetta presente in
 * `combinazioni`. */
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
const COMBINAZIONI = new Map(
  DATASET.combinazioni.map((c) => [
    `${c.base}--${c.farcitura}--${c.credenza}--${c.finitura}`,
    c,
  ]),
);

export const baseDi = (id: string): Base | null => BASI.get(id) ?? null;
export const farcituraVoce = (id: string): Farcitura | null =>
  FARCITURE.get(id) ?? null;
export const credenzaVoce = (id: string): Credenza | null =>
  CREDENZA.get(id) ?? null;
export const finituraVoce = (id: string): Finitura | null =>
  FINITURE.get(id) ?? null;

/** Opzioni disponibili al passo 3, filtrate dalla ricetta scelta. */
export const credenzePer = (base: string, farcitura: string): Credenza[] =>
  DATASET.combinazioni
    .filter((c) => c.base === base && c.farcitura === farcitura)
    .map((c) => CREDENZA.get(c.credenza))
    .filter((c): c is Credenza => Boolean(c));

/** Opzioni disponibili al passo 4. Oggi la matrice ha una sola finitura,
 * ma resta una funzione: il flusso non dovrà cambiare se il listino la
 * allargherà. */
export const finiturePer = (
  base: string,
  farcitura: string,
  credenza: string,
): Finitura[] =>
  DATASET.combinazioni
    .filter(
      (c) =>
        c.base === base && c.farcitura === farcitura && c.credenza === credenza,
    )
    .map((c) => FINITURE.get(c.finitura))
    .filter((f): f is Finitura => Boolean(f));

/* --------------------------- le funzioni pure ---------------------------- */

/** Costruisce il prodotto soltanto quando la quadrupla è prevista dalla
 * matrice chiusa. */
export const prodotto = (
  base: string,
  farcitura: string,
  credenza: string,
  finitura: string,
): Prodotto | null => {
  const sku = `${base}--${farcitura}--${credenza}--${finitura}`;
  if (!COMBINAZIONI.has(sku)) return null;
  return {
    sku,
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
    peso_kg: Math.round(pedane * b.peso_pedana_kg * 100) / 100,
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
  if (!Number.isSafeInteger(s.pedane) || s.pedane < 1 || s.pedane > 10000)
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
    return {
      tipo: "render",
      base: null,
      farcitura: null,
      credenza: null,
      prodotto: null,
    };

  const base = BASI.get(idBase);
  /* base inesistente: capita spesso con link salvati prima del 2026-08-28
     (bomba, golosone, intriko…, uscite dal configuratore) — si riparte dal
     passo 1 con l'avviso discreto, non un 404 */
  if (!base)
    return {
      tipo: "redirect",
      destinazione: `/configuratore/${sceltaCompatibile([]).join("/")}?nd=1`,
    };

  if (!idFarcitura)
    return {
      tipo: "render",
      base,
      farcitura: null,
      credenza: null,
      prodotto: null,
    };

  const farcitura = FARCITURE.get(idFarcitura);
  if (
    !farcitura ||
    !DATASET.combinazioni.some(
      (c) => c.base === base.id && c.farcitura === idFarcitura,
    )
  )
    return { tipo: "redirect", destinazione: `/configuratore/${base.id}?nd=1` };

  if (!idCredenza)
    return { tipo: "render", base, farcitura, credenza: null, prodotto: null };

  const credenza = CREDENZA.get(idCredenza);
  if (
    !credenza ||
    !DATASET.combinazioni.some(
      (c) =>
        c.base === base.id &&
        c.farcitura === farcitura.id &&
        c.credenza === idCredenza,
    )
  )
    return {
      tipo: "redirect",
      destinazione: `/configuratore/${base.id}/${farcitura.id}?nd=1`,
    };

  if (!idFinitura)
    return { tipo: "render", base, farcitura, credenza, prodotto: null };

  const finitura = FINITURE.get(idFinitura);
  if (!finitura || !prodotto(base.id, farcitura.id, credenza.id, finitura.id))
    return {
      tipo: "redirect",
      destinazione: `/configuratore/${sceltaCompatibile([base.id, farcitura.id, credenza.id]).join("/")}?nd=1`,
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
    prodotto: prodotto(base.id, farcitura.id, credenza.id, finitura.id),
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
    base &&
    idFarcitura &&
    DATASET.combinazioni.some(
      (c) => c.base === base.id && c.farcitura === idFarcitura,
    )
      ? (FARCITURE.get(idFarcitura) ?? null)
      : null;
  const credenza =
    farcitura &&
    idCredenza &&
    DATASET.combinazioni.some(
      (c) =>
        c.base === base!.id &&
        c.farcitura === farcitura.id &&
        c.credenza === idCredenza,
    )
      ? (CREDENZA.get(idCredenza) ?? null)
      : null;
  const finitura =
    credenza && idFinitura ? (FINITURE.get(idFinitura) ?? null) : null;

  return {
    base,
    farcitura,
    credenza,
    prodotto:
      base && farcitura && credenza && finitura
        ? prodotto(base.id, farcitura.id, credenza.id, finitura.id)
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

/** Conserva solo suffissi compatibili; le opzioni uniche sono già incluse. */
export function sceltaCompatibile(segmenti: string[]): string[] {
  const risultato: string[] = [];
  for (let i = 0; i < 4; i++) {
    const compatibili = DATASET.combinazioni.filter((c) =>
      [c.base, c.farcitura, c.credenza, c.finitura]
        .slice(0, i)
        .every((v, n) => v === risultato[n]),
    );
    const opzioni = [
      ...new Set(
        compatibili.map(
          (c) => [c.base, c.farcitura, c.credenza, c.finitura][i],
        ),
      ),
    ];
    const proposta = segmenti[i];
    if (proposta && opzioni.includes(proposta)) risultato.push(proposta);
    else if (opzioni.length === 1) risultato.push(opzioni[0]);
    else break;
  }
  return risultato;
}
