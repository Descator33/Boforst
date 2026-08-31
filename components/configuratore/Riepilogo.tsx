"use client";

import { type Base, type Credenza, type Farcitura, type Prodotto } from "@/lib/configuratore";
import { IconaSpunta } from "./Decori";
import { useTesti } from "@/components/LinguaProvider";
import { interpola } from "@/lib/i18n/interpola";
import type { IdCredenza, IdFarcitura, IdFinitura } from "@/lib/i18n/tipi";

/**
 * Il rail dei quattro passi, in testa alla colonna delle scelte:
 * discreto ma leggibile, perché è anche la via principale per tornare
 * indietro. I passi completati sono riapribili (tornare a un passo
 * precedente azzera quelli successivi per costruzione dell'URL, senza
 * tentativi di conservarli), il corrente è marcato in pieno, il futuro
 * è muto e tratteggiato.
 *
 * Dal refactor 2026-08-28 tutti e 4 i componenti vivono nell'URL allo
 * stesso modo (non c'è più un gesto separato di "applicazione" per la
 * finitura): "completato" è semplicemente "il passo è alle spalle di
 * quello corrente".
 */
export function Riepilogo({
  base,
  farcitura,
  credenza,
  prodotto,
  apriPasso,
}: {
  base: Base | null;
  farcitura: Farcitura | null;
  credenza: Credenza | null;
  prodotto: Prodotto | null;
  apriPasso: (passo: 1 | 2 | 3 | 4) => void;
}) {
  const testi = useTesti();
  const nomi = testi.prodotti;
  const farciturasNome = farcitura
    ? (nomi.farciture[farcitura.id as IdFarcitura] ?? farcitura.nome)
    : null;
  const credenzaNome = credenza
    ? (nomi.credenza[credenza.id as IdCredenza] ?? credenza.nome)
    : null;
  const finituraNome = prodotto
    ? (nomi.finiture[prodotto.finitura as IdFinitura] ?? prodotto.finitura)
    : null;
  const corrente = prodotto ? 5 : credenza ? 4 : farcitura ? 3 : base ? 2 : 1;

  const voci: {
    n: 1 | 2 | 3 | 4;
    etichetta: string;
    valore: string | null;
    apribile: boolean;
  }[] = [
    {
      n: 1,
      etichetta: testi.configuratore.riepilogo.base,
      valore: base?.nome ?? null,
      apribile: corrente > 1,
    },
    {
      n: 2,
      etichetta: testi.configuratore.riepilogo.farcitura,
      valore: farciturasNome,
      apribile: corrente > 2,
    },
    {
      n: 3,
      etichetta: testi.configuratore.riepilogo.credenza,
      valore: credenzaNome,
      apribile: corrente > 3,
    },
    {
      n: 4,
      etichetta: testi.configuratore.riepilogo.finitura,
      valore: finituraNome,
      apribile: false,
    },
  ];

  return (
    <ol
      aria-label={testi.configuratore.riepilogo.avanzamento}
      className="candy-livelli grid list-none grid-cols-4 gap-2"
    >
      {voci.map((v) => {
        const attivo = v.n === corrente;
        const completato = v.n < corrente;
        const numero = String(v.n).padStart(2, "0");
        const testo = (
          <>
            <span className="candy-livello__numero">
              {completato ? (
                <IconaSpunta className="h-4 w-4" />
              ) : (
                numero
              )}
            </span>
            <span className="min-w-0 text-left">
              <span className="candy-livello__nome">{v.valore ?? v.etichetta}</span>
            </span>
          </>
        );

        if (v.apribile) {
          return (
            <li key={v.n}>
              <button
                type="button"
                onClick={() => apriPasso(v.n)}
                aria-label={interpola(testi.configuratore.riepilogo.tornaAlPasso, {
                  n: v.n,
                  etichetta: v.etichetta,
                  valore: v.valore ?? "",
                })}
                data-stato="completato"
                className="candy-livello group relative flex h-full w-full flex-col items-center justify-center text-inchiostro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inchiostro"
              >
                {testo}
                <span
                  aria-hidden
                  className="candy-livello__cambia"
                >
                  {testi.configuratore.riepilogo.cambia}
                </span>
              </button>
            </li>
          );
        }

        return (
          <li key={v.n}>
            <span
              aria-current={attivo ? "step" : undefined}
              data-stato={completato ? "completato" : attivo ? "attivo" : "futuro"}
              className="candy-livello flex flex-col items-center justify-center"
            >
              {testo}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
