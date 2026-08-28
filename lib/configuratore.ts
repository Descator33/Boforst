/**
 * Configuratore dolci — modello dati e logica pura.
 *
 * Fonte normativa: public/configuratore-dolci-spec-tecnica.md (seconda
 * revisione). Il dataset (lib/configuratore/dati-dolci.json) è l'unica
 * sorgente di verità su cosa esiste: la matrice è sparsa e chiusa (32 SKU
 * su 900 combinazioni teoriche), il topping è determinato dalla coppia
 * (base, farcitura) e non è mai una scelta, grammatura/pesi/ordine minimo
 * vivono sulla combinazione. Il configuratore non genera combinazioni,
 * le seleziona.
 *
 * Questo modulo è volutamente separato da lib/catalog.ts: quello è il
 * modello UI delle card in home (slug e semantica divergenti), il ponte
 * tra i due è la sola mappa TESSERA_A_BASE, esplicita e revocabile.
 *
 * Le cinque funzioni pure (farcitureDi, combinazione, toppingDi, quantita,
 * validaStato) sono condivise alla lettera tra client e Server Action:
 * la traduzione mostrata accanto al campo e quella scritta nel payload
 * escono dalla stessa moltiplicazione, mai da due implementazioni.
 */

import dati from "./configuratore/dati-dolci.json";

/* ------------------------------- tipi ---------------------------------- */

/** Catena logistica a 4 livelli (vassoio→cartone→strato→pedana) o a 3:
 *  Intriko Midi, Lussekatt e Klejner non hanno il livello vassoio né la
 *  scomposizione in strati. Non è un dato mancante da colmare: è una
 *  configurazione d'imballo diversa, e i campi null lo dicono. */
export type Packaging = {
  vassoi_per_cartone: number | null;
  pezzi_per_vassoio: number | null;
  /** solo Frittelline: il listino dichiara il cartone a peso (2,5 kg),
   *  i 72 pezzi sono derivati dai vassoi */
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

/* I tipi Base e Combinazione NON portano l'immagine: il JSON conserva i
   vecchi campi `immagine` come residuo della trascrizione, ma le foto
   vivono in public/img/configuratore/prodotti/<stato>/ e le scopre a
   render lib/configuratore/foto.ts. */

export type Base = {
  id: string;
  nome: string;
  diametro_cm: number;
  modalita_uso: string;
  packaging: Packaging;
};

export type Farcitura = {
  id: string;
  nome: string;
  senza_farcitura: boolean;
};

export type Topping = { id: string; nome: string };

export type Combinazione = {
  sku: string;
  /** nome commerciale proprio della combinazione, quando a listino il
   *  prodotto farcito cambia nome (Bomba + crema si vende come
   *  «Bomba Super», decisione Delsigel 2026-08-01: stessa base, non due
   *  basi distinte); assente = vale il nome della base */
  nome?: string;
  base: string;
  farcitura: string;
  topping: string;
  grammatura_gr: number;
  peso_cartone_kg: number;
  peso_pedana_kg: number;
  ordine_minimo_pedane: number | null;
  ordine_minimo_pezzi: number | null;
  /** vero = il minimo è scritto sulla riga del foglio (lettura letterale,
   *  non interpretata: vedi l'ambiguità aperta nella spec) */
  ordine_minimo_dichiarato_su_riga: boolean;
};

export type Dataset = {
  versione: string;
  linea: string;
  fonte: string;
  unita_quantita: string;
  basi: Base[];
  farciture: Farcitura[];
  topping: Topping[];
  combinazioni: Combinazione[];
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
const TOPPING = new Map(DATASET.topping.map((t) => [t.id, t]));
const COMBINAZIONI = new Map(DATASET.combinazioni.map((c) => [c.sku, c]));

const FARCITURE_PER_BASE = new Map<string, Farcitura[]>();
for (const c of DATASET.combinazioni) {
  const f = FARCITURE.get(c.farcitura);
  if (!f) continue; // integrità garantita dal prebuild, ma non si lancia qui
  const lista = FARCITURE_PER_BASE.get(c.base) ?? [];
  lista.push(f);
  FARCITURE_PER_BASE.set(c.base, lista);
}

export const baseDi = (id: string): Base | null => BASI.get(id) ?? null;
export const farcituraVoce = (id: string): Farcitura | null =>
  FARCITURE.get(id) ?? null;
export const toppingVoce = (id: string): Topping | null =>
  TOPPING.get(id) ?? null;

/* ------------------------ le cinque funzioni pure ------------------------ */

/** Farciture ammesse per una base: solo quelle che compaiono in una
 *  combinazione valida. Al passo 2 si filtra, non si disabilita. */
export const farcitureDi = (base: string): Farcitura[] =>
  FARCITURE_PER_BASE.get(base) ?? [];

/** La combinazione è unica: (base, farcitura) → SKU, o niente. */
export const combinazione = (
  base: string,
  farcitura: string
): Combinazione | null => COMBINAZIONI.get(`${base}--${farcitura}`) ?? null;

/** Il topping è derivato, mai scelto. */
export const toppingDi = (base: string, farcitura: string): Topping | null => {
  const c = combinazione(base, farcitura);
  return c ? (TOPPING.get(c.topping) ?? null) : null;
};

/** Nome commerciale del prodotto configurato: la combinazione può avere
 *  un nome proprio a listino (Bomba con crema → Bomba Super); altrimenti
 *  è il nome della base. Ovunque si nomina il PRODOTTO (passo 3, titolo
 *  pagina, richiesta di quotazione) si passa da qui; il nome della BASE
 *  resta per i passi in cui la farcitura non è ancora scelta. */
export const nomeCommerciale = (c: Combinazione): string =>
  c.nome ?? BASI.get(c.base)?.nome ?? c.base;

/** Conversione della quantità lungo la catena logistica.
 *  Unica fonte aritmetica per UI e payload. */
export const quantita = (
  base: string,
  farcitura: string,
  pedane: number
): Quantita | null => {
  const c = combinazione(base, farcitura);
  const b = BASI.get(base);
  if (!c || !b) return null;
  const p = b.packaging;
  return {
    pedane,
    cartoni: pedane * p.cartoni_per_pedana,
    pezzi: pedane * p.pezzi_per_pedana,
    peso_kg: Math.round(pedane * c.peso_pedana_kg),
  };
};

export type StatoConfiguratore = {
  base: string;
  farcitura: string;
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
 *  descritta dal foglio. Il vincolo di minimo segue la lettura letterale
 *  del dataset (19 SKU su 32) finché Delsigel non scioglie l'ambiguità
 *  per-SKU / per-base / per-ordine: per questo la regola sta solo qui. */
export const validaStato = (s: StatoConfiguratore): EsitoValidazione => {
  const c = combinazione(s.base, s.farcitura);
  if (!c) return { ok: false, errore: "COMBINAZIONE_INESISTENTE" };
  if (!Number.isInteger(s.pedane) || s.pedane < 1)
    return { ok: false, errore: "QUANTITA_NON_VALIDA" };
  if (c.ordine_minimo_pedane != null && s.pedane < c.ordine_minimo_pedane)
    return {
      ok: false,
      errore: "SOTTO_ORDINE_MINIMO",
      minimo_pedane: c.ordine_minimo_pedane,
      minimo_pezzi: c.ordine_minimo_pezzi,
    };
  return { ok: true, sku: c.sku, quantita: quantita(s.base, s.farcitura, s.pedane)! };
};

/* --------------------------- parsing dell'URL --------------------------- */

/** Esito del parsing dei segmenti di /configuratore/[[...scelta]].
 *  `render` porta lo stato iniziale; `redirect` normalizza gli URL sporchi
 *  (combinazione inesistente, segmenti in eccesso) senza mai mostrare un
 *  errore tecnico. */
export type EsitoParse =
  | { tipo: "render"; base: Base | null; comb: Combinazione | null }
  | { tipo: "redirect"; destinazione: string };

export function parseScelta(scelta: string[] | undefined): EsitoParse {
  const [idBase, idFarcitura, ...resto] = scelta ?? [];

  if (!idBase) return { tipo: "render", base: null, comb: null };

  const base = BASI.get(idBase);
  /* base inesistente: si riparte dal passo 1, non un 404 */
  if (!base) return { tipo: "redirect", destinazione: "/configuratore" };

  /* il passo 2 è sempre un passo vero, anche per le basi a farcitura
     unica: la spec (§passo 2) prescriveva il salto automatico, ma la
     decisione UX del 2026-08-02 lo supera — il dolce si compone sempre
     con lo stesso gesto, la scelta non si fa mai al posto dell'utente */
  if (!idFarcitura) return { tipo: "render", base, comb: null };

  const comb = combinazione(base.id, idFarcitura);
  /* farcitura inesistente per questa base: si atterra al passo 2 con un
     avviso discreto composto dal query param (letto solo lato client) */
  if (!comb)
    return {
      tipo: "redirect",
      destinazione: `/configuratore/${base.id}?nd=${encodeURIComponent(idFarcitura)}`,
    };

  /* segmenti in eccesso: si tengono i primi due e si normalizza */
  if (resto.length > 0)
    return {
      tipo: "redirect",
      destinazione: `/configuratore/${base.id}/${idFarcitura}`,
    };

  return { tipo: "render", base, comb };
}

/** Parsing tollerante per il client: dal pathname allo stato, senza
 *  redirect (il client naviga solo verso URL canonici). Il pathname
 *  arriva col prefisso lingua (/fi/configuratore/…): si parte dal
 *  segmento "configuratore", ovunque stia. */
export function statoDaPathname(pathname: string): {
  base: Base | null;
  comb: Combinazione | null;
} {
  const tutti = pathname.split("/").filter(Boolean);
  const daConfiguratore = tutti.indexOf("configuratore");
  const segmenti = daConfiguratore >= 0 ? tutti.slice(daConfiguratore + 1) : [];
  const [idBase, idFarcitura] = segmenti;
  const base = idBase ? (BASI.get(idBase) ?? null) : null;
  const comb =
    base && idFarcitura ? combinazione(base.id, idFarcitura) : null;
  return { base, comb };
}

/* --------------------- ponte con il catalogo in home --------------------- */

/**
 * Slug delle tessere dolci in home (lib/catalog.ts) → id base del
 * configuratore. Gli slug NON coincidono (bomba-fritta vs bomba,
 * frittella vs frittelline, lusekatt vs lussekatt) e Intriko Midi non è in
 * home: la corrispondenza è dichiarata qui, mai assunta.
 *
 * `bomba-fritta → bomba` è esatta dal 2026-08-01: Bomba Super non è più
 * una base ma il nome commerciale della combinazione bomba + crema, quindi
 * la tessera home copre l'intero ramo.
 */
export const TESSERA_A_BASE: Record<string, string | null> = {
  golosone: "golosone",
  "bomba-fritta": "bomba",
  cuore: "cuore",
  frittella: "frittelline",
  intriko: "intriko",
  lusekatt: "lussekatt",
  nuvola: "nuvola",
  stella: "stella",
  klejner: "klejner",
};

/**
 * Le foto del configuratore arrivano SOLO dalle cartelle di
 * public/img/configuratore/ (una per base, per sku, per prodotto
 * completo, per farcitura e per topping). Le mappe chiave → URL le costruisce il
 * server con lib/configuratore/foto.ts e scendono ai client component
 * come prop: l'assenza della chiave significa "foto non ancora
 * arrivata" e la UI ripiega sullo stato precedente o sul placeholder
 * tipografico — mai la foto di un'altra farcitura, mai i vecchi still
 * di /products.
 */

/** Stato visibile del prodotto (base, sku, sku--topping) → URL foto. */
export type FotoStati = Record<string, string>;

/** Id farcitura → URL della foto dell'ingrediente DA SOLO. È l'immagine
 *  delle tessere del passo 2: la tessera è la cosa che si trascina, il
 *  farcito (foto dello sku) compare sul banco dopo il rilascio. */
export type FotoFarciture = Record<string, string>;

/** Id topping → URL della foto della finitura DA SOLA. Stesso patto
 *  della farcitura, un passo più in là: è l'immagine della tessera del
 *  passo 3, quella che si trascina sul dolce farcito; il prodotto
 *  completo (foto sku--topping) compare sul banco dopo il rilascio. */
export type FotoTopping = Record<string, string>;

/* La formattazione dei numeri (3.360 / 3,360 / 3 360) è passata a
   lib/i18n/lingue.ts: cambia con la lingua della pagina, e questo
   modulo resta neutro. */
