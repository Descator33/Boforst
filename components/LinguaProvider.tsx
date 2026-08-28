"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  COOKIE_LINGUA,
  localizza,
  type Lingua,
} from "@/lib/i18n/lingue";
import type { Testi } from "@/lib/i18n/tipi";

/**
 * La lingua corrente e il suo dizionario, per tutto l'albero client.
 *
 * Il provider sta nel layout di [lang]: il server sceglie il dizionario
 * e lo passa come prop, quindi al client viaggia SOLO la lingua attiva
 * — mai le altre quattro. I componenti server non passano da qui:
 * ricevono `lingua` dalla pagina e chiamano `dizionario(lingua)`.
 *
 * `percorso` è il modo in cui i componenti scrivono i link: il
 * percorso resta scritto senza prefisso ("/configuratore") e la
 * lingua si aggiunge in un punto solo.
 */

type Contesto = {
  lingua: Lingua;
  testi: Testi;
  /** "/contatti" → "/fi/contatti", nella lingua corrente */
  percorso: (href: string) => string;
};

const LinguaContesto = createContext<Contesto | null>(null);

export function LinguaProvider({
  lingua,
  testi,
  children,
}: {
  lingua: Lingua;
  testi: Testi;
  children: ReactNode;
}) {
  const valore = useMemo<Contesto>(
    () => ({
      lingua,
      testi,
      percorso: (href: string) => localizza(lingua, href),
    }),
    [lingua, testi],
  );

  return (
    <LinguaContesto.Provider value={valore}>{children}</LinguaContesto.Provider>
  );
}

export function useLingua(): Contesto {
  const contesto = useContext(LinguaContesto);
  if (!contesto)
    throw new Error("useLingua va usato dentro <LinguaProvider>");
  return contesto;
}

export function useTesti(): Testi {
  return useLingua().testi;
}

/** La scelta esplicita sopravvive alla sessione: il proxy la legge dal
 *  cookie prima di guardare l'Accept-Language del browser. */
export function ricordaLingua(lingua: Lingua) {
  document.cookie = `${COOKIE_LINGUA}=${lingua};path=/;max-age=31536000;samesite=lax`;
}
