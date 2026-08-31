import { readdirSync } from "node:fs";
import { extname, join } from "node:path";
import type {
  FotoCredenza,
  FotoFarciture,
  FotoFinitura,
  FotoStati,
} from "../configuratore";

/**
 * Le foto del configuratore vivono in public/img/configuratore/, quattro
 * radici con lo stesso contratto (vedi i README lì):
 *
 *   prodotti/<stato>                        gli stati visibili del prodotto:
 *     <base>                                          la base semplice
 *     <base>--<farcitura>                             farcito
 *     <base>--<farcitura>--<credenza>                 + dalla credenza
 *     <base>--<farcitura>--<credenza>--<finitura>      il prodotto completo (= sku)
 *   farciture/<farcitura>  la farcitura DA SOLA, l'ingrediente che si
 *                          trascina al passo 2
 *   credenza/<credenza>    la voce dalla credenza DA SOLA, tessera del
 *                          passo 3
 *   finiture/<finitura>    la finitura DA SOLA, tessera del passo 4
 *
 * La cartella È il contratto: si scansiona a render (server), la prima
 * immagine in ordine alfabetico vince, una cartella vuota significa
 * "foto non ancora arrivata" e la UI ripiega da sola (stato precedente
 * o placeholder tipografico). Nessun percorso cablato nel dataset:
 * per pubblicare una foto si mette il file nella cartella giusta,
 * senza toccare né codice né JSON.
 *
 * Modulo solo server (node:fs): lo importa la pagina, che passa le
 * mappe all'isola client come prop.
 */

const RADICE = join(process.cwd(), "public", "img", "configuratore");

/* Regola assoluta: sfondo trasparente. Si accettano solo i formati che
   possono portare il canale alfa — il JPEG non può e non entra mai; il
   prebuild (scripts/valida-configuratore.mjs) verifica anche l'alfa
   dichiarato dentro ai file e ferma il build se manca. */
const ESTENSIONI = new Set([".png", ".webp"]);

/** Cartella → mappa nome-sottocartella → URL pubblico della prima foto.
 *  Solo le voci che una foto ce l'hanno: l'assenza della chiave è
 *  l'informazione. I nomi file arrivano dal servizio fotografico come
 *  sono (spazi, virgole): si codifica il segmento, non ci si fida del
 *  nome. */
function scansiona(cartella: string): Record<string, string> {
  const mappa: Record<string, string> = {};
  for (const voce of readdirSync(join(RADICE, cartella), {
    withFileTypes: true,
  })) {
    if (!voce.isDirectory()) continue;
    const file = readdirSync(join(RADICE, cartella, voce.name))
      .filter((f) => ESTENSIONI.has(extname(f).toLowerCase()))
      .sort()[0];
    if (file)
      mappa[voce.name] =
        `/img/configuratore/${cartella}/${encodeURIComponent(voce.name)}/${encodeURIComponent(file)}`;
  }
  return mappa;
}

/** Stato del prodotto → URL della foto (passo 1 e banco). */
export const fotoStati = (): FotoStati => scansiona("prodotti");

/** Farcitura → URL della foto dell'ingrediente da solo (tessere del
 *  passo 2). */
export const fotoFarciture = (): FotoFarciture => scansiona("farciture");

/** Voce dalla credenza → URL della foto dell'ingrediente da solo (tessere
 *  del passo 3). */
export const fotoCredenza = (): FotoCredenza => scansiona("credenza");

/** Finitura → URL della foto della finitura da sola (tessera del passo 4). */
export const fotoFinitura = (): FotoFinitura => scansiona("finiture");
