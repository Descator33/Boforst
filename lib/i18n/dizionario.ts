import type { Lingua } from "./lingue";
import type { Testi } from "./tipi";
import { it } from "./dizionari/it";
import { en } from "./dizionari/en";
import { fr } from "./dizionari/fr";
import { de } from "./dizionari/de";
import { fi } from "./dizionari/fi";

/**
 * I cinque dizionari, importati staticamente: sono testi, non dati
 * remoti, e il layout ne serializza UNO SOLO verso il client (quello
 * della lingua corrente) attraverso il LinguaProvider. I componenti
 * client non importano mai da qui — riceverebbero tutte e cinque le
 * lingue nel bundle; usano `useTesti()`.
 */
const DIZIONARI: Record<Lingua, Testi> = { it, en, fr, de, fi };

export function dizionario(lingua: Lingua): Testi {
  return DIZIONARI[lingua];
}
