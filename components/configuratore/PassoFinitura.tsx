"use client";

import { finiturePer, type FotoFinitura } from "@/lib/configuratore";
import { ImmagineProdotto } from "./ImmagineProdotto";
import { GrigliaTessere } from "./Selettore";
import { SegnaPosto, TesseraScelta, type VoloTessera } from "./TesseraScelta";
import type { DragPasso } from "./PassoBase";
import { useTesti } from "@/components/LinguaProvider";
import type { IdFinitura } from "@/lib/i18n/tipi";

/**
 * Passo 4 — la finitura. Le opzioni arrivano dalla ricetta selezionata
 * (oggi una sola: zucchero a velo). Sceglierne una completa
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
  base,
  farcitura,
  credenza,
  selezionata,
  onScegli,
  drag,
}: {
  fotoFinitura: FotoFinitura;
  base: string;
  farcitura: string;
  credenza: string;
  selezionata: string | null;
  onScegli: (id: string, volo?: VoloTessera) => void;
  drag?: DragPasso;
}) {
  const testi = useTesti();

  return (
    <GrigliaTessere>
      {finiturePer(base, farcitura, credenza).map((f) => {
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
