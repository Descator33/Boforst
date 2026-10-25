"use client";

import { credenzePer, type FotoCredenza } from "@/lib/configuratore";
import { ImmagineProdotto } from "./ImmagineProdotto";
import { GrigliaTessere } from "./Selettore";
import { SegnaPosto, TesseraScelta, type VoloTessera } from "./TesseraScelta";
import type { DragPasso } from "./PassoBase";
import { useTesti } from "@/components/LinguaProvider";
import type { IdCredenza } from "@/lib/i18n/tipi";

/**
 * Passo 3 — dalla credenza. Le opzioni dipendono da base e farcitura:
 * la matrice del listino è chiusa e non mostra ricette non ordinabili.
 *
 * La tessera mostra l'ingrediente DA SOLO (cartelle di
 * public/img/configuratore/credenza/): è la cosa che si trascina. Il
 * dolce con la credenza applicata compare sul palco dopo il rilascio.
 */
export function PassoCredenza({
  fotoCredenza,
  base,
  farcitura,
  selezionata,
  onScegli,
  drag,
}: {
  fotoCredenza: FotoCredenza;
  base: string;
  farcitura: string;
  selezionata: string | null;
  onScegli: (id: string, volo?: VoloTessera) => void;
  drag?: DragPasso;
}) {
  const testi = useTesti();

  return (
    <GrigliaTessere>
      {credenzePer(base, farcitura).map((c) => {
        const nome = testi.prodotti.credenza[c.id as IdCredenza] ?? c.nome;
        const fotoC = fotoCredenza[c.id];
        return (
          <li key={c.id}>
            <TesseraScelta
              titolo={nome}
              selezionata={selezionata === c.id}
              onScegli={(quadro) =>
                onScegli(
                  c.id,
                  quadro && {
                    quadro,
                    foto: fotoC ?? null,
                    iniziale: nome.charAt(0),
                  }
                )
              }
              drag={
                drag
                  ? {
                      onSposta: drag.onSposta,
                      onRilascia: (p) => drag.onRilascia(c.id, p),
                    }
                  : null
              }
            >
              {fotoC ? (
                <ImmagineProdotto
                  sorgenti={[fotoC]}
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
