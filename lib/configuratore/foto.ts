import manifesto from "./foto-manifest.json";
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
 * La cartella È il contratto: il prebuild la scansiona, verifica le immagini
 * e genera foto-manifest.json. La prima immagine in ordine alfabetico vince;
 * una cartella vuota significa "foto non ancora arrivata" e la UI ripiega da
 * sola (stato precedente o placeholder tipografico). Per pubblicare una foto
 * si mette il file nella cartella giusta, senza toccare codice o JSON a mano.
 *
 * Il runtime importa solo il piccolo manifest degli URL e non legge public/:
 * in questo modo le immagini restano asset statici e non vengono duplicate
 * nel bundle della funzione serverless dal file tracing di Next.
 */

/** Stato del prodotto → URL della foto (passo 1 e banco). */
export const fotoStati = (): FotoStati => manifesto.prodotti;

/** Farcitura → URL della foto dell'ingrediente da solo (tessere del
 *  passo 2). */
export const fotoFarciture = (): FotoFarciture => manifesto.farciture;

/** Voce dalla credenza → URL della foto dell'ingrediente da solo (tessere
 *  del passo 3). */
export const fotoCredenza = (): FotoCredenza => manifesto.credenza;

/** Finitura → URL della foto della finitura da sola (tessera del passo 4). */
export const fotoFinitura = (): FotoFinitura => manifesto.finiture;
