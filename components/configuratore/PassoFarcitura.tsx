"use client";

import { DATASET, type FotoFarciture } from "@/lib/configuratore";
import { ImmagineProdotto } from "./ImmagineProdotto";
import { GrigliaTessere } from "./Selettore";
import { SegnaPosto, TesseraScelta, type VoloTessera } from "./TesseraScelta";
import type { DragPasso } from "./PassoBase";
import { useTesti } from "@/components/LinguaProvider";
import type { IdFarcitura } from "@/lib/i18n/tipi";

/**
 * Passo 2 — la farcitura. Le opzioni presenti nel vocabolario sono già
 * quelle della sola base Nuvola prevista dalla matrice.
 *
 * La tessera mostra la farcitura DA SOLA (cartelle di
 * public/img/configuratore/farciture/): è l'ingrediente che si
 * trascina. Il farcito — foto dello stato base--farcitura — appartiene
 * al palco e compare lì, dopo il rilascio: anticiparlo sulla tessera
 * mostrerebbe il risultato prima del gesto. Foto non ancora arrivata →
 * resa tipografica, mai la foto di un'altra farcitura.
 */
export function PassoFarcitura({
  fotoFarciture,
  selezionata,
  onScegli,
  drag,
}: {
  fotoFarciture: FotoFarciture;
  selezionata: string | null;
  onScegli: (id: string, volo?: VoloTessera) => void;
  drag?: DragPasso;
}) {
  const testi = useTesti();

  return (
    <GrigliaTessere>
      {DATASET.farciture.map((f) => {
        const nome = testi.prodotti.farciture[f.id as IdFarcitura] ?? f.nome;
        const fotoF = fotoFarciture[f.id];
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
