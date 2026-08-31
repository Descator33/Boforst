"use client";

import { DATASET, type FotoFinitura } from "@/lib/configuratore";
import { ImmagineProdotto } from "./ImmagineProdotto";
import { GrigliaTessere } from "./Selettore";
import { SegnaPosto, TesseraScelta, type VoloTessera } from "./TesseraScelta";
import type { DragPasso } from "./PassoBase";
import { useTesti } from "@/components/LinguaProvider";
import type { IdFinitura } from "@/lib/i18n/tipi";

/**
 * Passo 4 — la finitura. Dal refactor 2026-08-28 non è più derivata
 * dalla ricetta: è una scelta reale fra le 4 finiture, con lo stesso
 * meccanismo di PassoFarcitura/PassoCredenza. Sceglierne una completa
 * il prodotto (4° segmento dell'URL) e fa comparire il pannello dei
 * numeri (PassoCompleto).
 *
 * La tessera mostra la finitura DA SOLA (cartelle di
 * public/img/configuratore/finiture/): è la cosa che si trascina sul
 * dolce farcito. Il prodotto completo compare sul palco dopo il
 * rilascio.
 */
export function PassoFinitura({
  fotoFinitura,
  selezionata,
  onScegli,
  drag,
}: {
  fotoFinitura: FotoFinitura;
  selezionata: string | null;
  onScegli: (id: string, volo?: VoloTessera) => void;
  drag?: DragPasso;
}) {
  const testi = useTesti();

  return (
    <GrigliaTessere>
      {DATASET.finiture.map((f) => {
        const nome = testi.prodotti.finiture[f.id as IdFinitura] ?? f.nome;
        const fotoF = fotoFinitura[f.id];
        return (
          <li key={f.id}>
            <TesseraScelta
              titolo={nome}
              selezionata={selezionata === f.id}
              onScegli={(quadro) =>
                onScegli(
                  f.id,
                  quadro && {
                    quadro,
                    foto: fotoF ?? null,
                    iniziale: nome.charAt(0),
                  }
                )
              }
              drag={
                drag
                  ? {
                      onSposta: drag.onSposta,
                      onRilascia: (p) => drag.onRilascia(f.id, p),
                    }
                  : null
              }
            >
              {fotoF ? (
                <ImmagineProdotto
                  sorgenti={[fotoF]}
                  alt={nome}
                  iniziale={nome.charAt(0)}
                />
              ) : (
                <SegnaPosto testo={nome} />
              )}
            </TesseraScelta>
          </li>
        );
      })}
    </GrigliaTessere>
  );
}
