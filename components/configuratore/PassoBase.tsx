"use client";

import { DATASET, farcitureDi, type FotoStati } from "@/lib/configuratore";
import { useLingua } from "@/components/LinguaProvider";
import { conta } from "@/lib/i18n/interpola";
import { ImmagineProdotto } from "./ImmagineProdotto";
import { GrigliaTessere } from "./Selettore";
import { TesseraScelta, type Punto, type VoloTessera } from "./TesseraScelta";

/** Trascinamento verso il palco, da legare alla singola tessera. */
export type DragPasso = {
  onSposta: (p: Punto) => void;
  onRilascia: (id: string, p: Punto) => boolean;
} | null;

/**
 * Passo 1 — la base. Tutte e 10, sempre tutte, sempre selezionabili:
 * non esiste una scelta a monte che possa escluderne una.
 *
 * Sulla tessera compare solo il nome, come nella reference: il numero
 * di farciture disponibili resta nell'etichetta accessibile, dove
 * serve a chi non può contarle a occhio al passo dopo, senza rompere
 * le proporzioni della griglia.
 */
export function PassoBase({
  foto,
  selezionata,
  onScegli,
  drag,
}: {
  foto: FotoStati;
  selezionata: string | null;
  onScegli: (id: string, volo?: VoloTessera) => void;
  drag?: DragPasso;
}) {
  const { lingua, testi } = useLingua();
  return (
    <GrigliaTessere>
      {DATASET.basi.map((b) => {
        const n = farcitureDi(b.id).length;
        return (
          <li key={b.id}>
            <TesseraScelta
              titolo={b.nome}
              descrizione={`${b.nome} — ${conta(
                testi.configuratore.tessera.farciture,
                n,
                lingua,
              )}`}
              selezionata={selezionata === b.id}
              onScegli={(quadro) =>
                onScegli(
                  b.id,
                  quadro && {
                    quadro,
                    foto: foto[b.id] ?? null,
                    iniziale: b.nome.charAt(0),
                  }
                )
              }
              drag={
                drag
                  ? {
                      onSposta: drag.onSposta,
                      onRilascia: (p) => drag.onRilascia(b.id, p),
                    }
                  : null
              }
            >
              <ImmagineProdotto
                sorgenti={[foto[b.id]]}
                alt={b.nome}
                iniziale={b.nome.charAt(0)}
              />
            </TesseraScelta>
          </li>
        );
      })}
    </GrigliaTessere>
  );
}
