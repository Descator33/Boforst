import {
  LINGUA_PREDEFINITA,
  LINGUE,
  localizza,
  type Lingua,
} from "./lingue";

/** Base per canonical e hreflang. L'env vince; il fallback è il dominio
 *  aziendale (delsigel.it è già la casa di email e PEC). */
export const BASE_SITO = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.delsigel.it",
);

/**
 * Gli alternates di una pagina: canonical nella lingua corrente e le
 * cinque sorelle come hreflang, con l'italiano da x-default. I motori
 * capiscono così che /fi/contatti non è un duplicato di /it/contatti.
 */
export function alternatesPer(lingua: Lingua, percorso: string) {
  return {
    canonical: localizza(lingua, percorso),
    languages: {
      ...Object.fromEntries(
        LINGUE.map((altra) => [altra, localizza(altra, percorso)]),
      ),
      "x-default": localizza(LINGUA_PREDEFINITA, percorso),
    },
  };
}
