/**
 * Interpolazione dei segnaposto: "Passo {n} di 3" + {n: 2} → "Passo 2 di 3".
 *
 * I dizionari attraversano il confine server→client come prop del
 * LinguaProvider, quindi devono essere JSON puro: niente funzioni.
 * Dove un testo ha dentro un valore, il dizionario tiene il segnaposto
 * e questo helper lo riempie al render. I segnaposto non usati restano
 * visibili — un {n} dimenticato in pagina è un difetto che si vede,
 * non uno che sparisce.
 */
export function interpola(
  modello: string,
  valori: Record<string, string | number>,
): string {
  return modello.replace(/\{(\w+)\}/g, (originale, chiave: string) =>
    chiave in valori ? String(valori[chiave]) : originale,
  );
}

import type { Conteggio } from "./tipi";
import { fmtNumero, type Lingua } from "./lingue";

/**
 * «1 pedana» / «3.360 pezzi»: il numero passa dal formatter della
 * lingua e il plurale è il testo intero del dizionario — mai un
 * suffisso appiccicato, che in finlandese sarebbe sbagliato.
 */
export function conta(voce: Conteggio, n: number, lingua: Lingua): string {
  return n === 1 ? voce.uno : interpola(voce.molti, { n: fmtNumero(n, lingua) });
}
