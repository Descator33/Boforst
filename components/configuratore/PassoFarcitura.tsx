"use client";

import {
  combinazione,
  farcitureDi,
  type Base,
  type FotoFarciture,
} from "@/lib/configuratore";
import { ImmagineProdotto } from "./ImmagineProdotto";
import { GrigliaTessere } from "./Selettore";
import { SegnaPosto, TesseraScelta, type VoloTessera } from "./TesseraScelta";
import type { DragPasso } from "./PassoBase";
import { useTesti } from "@/components/LinguaProvider";
import { interpola } from "@/lib/i18n/interpola";
import type { IdFarcitura } from "@/lib/i18n/tipi";

/**
 * Passo 2 — la farcitura. L'unico passo dove la matrice sparsa si
 * vede: si mostrano SOLO le farciture che esistono in combinazione con
 * la base scelta, filtrate e mai disabilitate. Disabilitare comunica
 * «esiste ma non per te»; filtrare comunica «queste sono le tue», che
 * è la verità. Corollario per il drag & drop: non esistono rilasci
 * invalidi.
 *
 * La tessera mostra la farcitura DA SOLA (cartelle di
 * public/img/configuratore/farciture/): è l'ingrediente che si
 * trascina. Il farcito — foto dello sku — appartiene al palco e
 * compare lì, dopo il rilascio: anticiparlo sulla tessera mostrerebbe
 * il risultato prima del gesto. Foto non ancora arrivata → resa
 * tipografica, mai la foto di un'altra farcitura né quella del
 * semiprodotto.
 *
 * Il wording viene sempre dal vocabolario (mai "vuoto" cablato): il
 * giorno in cui il marketing sceglie "Naturale" si cambia il dataset,
 * non qui.
 */
export function PassoFarcitura({
  base,
  fotoFarciture,
  selezionata,
  onScegli,
  drag,
}: {
  base: Base;
  fotoFarciture: FotoFarciture;
  selezionata: string | null;
  onScegli: (id: string, volo?: VoloTessera) => void;
  drag?: DragPasso;
}) {
  const testi = useTesti();
  const farciture = farcitureDi(base.id);

  return (
    <GrigliaTessere>
      {farciture.map((f) => {
        const nome = testi.prodotti.farciture[f.id as IdFarcitura] ?? f.nome;
        /* se la combinazione ha un nome commerciale proprio (Bomba +
           crema → Bomba Super), lo si annuncia sulla tessera: il
           cambio di nome è parte della scelta, non una sorpresa al
           passo 3 */
        const nomeComb = combinazione(base.id, f.id)?.nome;
        const fotoF = fotoFarciture[f.id];
        return (
          <li key={f.id}>
            <TesseraScelta
              titolo={nome}
              sotto={
                nomeComb
                  ? interpola(testi.configuratore.tessera.diventa, {
                      nome: nomeComb,
                    })
                  : undefined
              }
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
