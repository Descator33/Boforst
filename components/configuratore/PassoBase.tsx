"use client";

import { DATASET, type FotoStati } from "@/lib/configuratore";
import { ImmagineProdotto } from "./ImmagineProdotto";
import { GrigliaTessere } from "./Selettore";
import { TesseraScelta, type Punto, type VoloTessera } from "./TesseraScelta";

/** Trascinamento verso il palco, da legare alla singola tessera. */
export type DragPasso = {
  onSposta: (p: Punto) => void;
  onRilascia: (id: string, p: Punto) => boolean;
} | null;

/**
 * Passo 1 — la base. Tutte e 3, sempre tutte, sempre selezionabili: dal
 * refactor 2026-08-28 ogni base si combina con qualunque farcitura,
 * voce dalla credenza e finitura, quindi non c'è più nulla da filtrare
 * a monte.
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
  return (
    <GrigliaTessere>
      {DATASET.basi.map((b) => {
        return (
          <li key={b.id}>
            <TesseraScelta
              titolo={b.nome}
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
