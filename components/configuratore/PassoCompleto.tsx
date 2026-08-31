"use client";

import { useEffect, useRef, useState } from "react";
import { type Base, type Prodotto } from "@/lib/configuratore";
import { useLingua } from "@/components/LinguaProvider";
import { interpola } from "@/lib/i18n/interpola";
import type { IdCredenza, IdFarcitura, IdFinitura } from "@/lib/i18n/tipi";
import { CampoPedane } from "./CampoPedane";
import { IconaLink, IconaSpunta } from "./Decori";
import { ModuloQuotazione } from "./ModuloQuotazione";
import { ScalaFormato } from "./ScalaFormato";

/**
 * Il pannello del prodotto completo: recap dei 4 componenti scelti,
 * grammatura/diametro/modalità d'uso, il link da copiare, il formato e
 * la quantità in pedane, e infine il modulo di quotazione. Compare non
 * appena i 4 segmenti dell'URL sono tutti valorizzati — non c'è più un
 * gesto separato di "applicazione": scegliere la finitura (l'ultimo dei
 * 4 passi) è già l'atto che completa il prodotto.
 */
export function PassoCompleto({
  prodotto,
  base,
  pedane,
  onCambiaPedane,
  moduloAperto,
  onApriModulo,
}: {
  prodotto: Prodotto;
  base: Base;
  pedane: number | "";
  onCambiaPedane: (v: number | "") => void;
  moduloAperto: boolean;
  onApriModulo: () => void;
}) {
  const { testi } = useLingua();
  const fin = testi.configuratore.finitura;
  const farcitura = testi.prodotti.farciture[prodotto.farcitura as IdFarcitura] ?? prodotto.farcitura;
  const credenza = testi.prodotti.credenza[prodotto.credenza as IdCredenza] ?? prodotto.credenza;
  const finitura = testi.prodotti.finiture[prodotto.finitura as IdFinitura] ?? prodotto.finitura;

  return (
    <div className="flex flex-col gap-9">
      <div>
        <p className="font-display text-[clamp(1.35rem,2.2vw,1.9rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
          {interpola(fin.boom, { nome: base.nome })}
        </p>
        <p className="mt-3 max-w-[46ch] text-[14px] leading-relaxed text-inchiostro/70">
          {fin.combo}
        </p>
        <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-2 font-mono text-[13px]">
          <div>
            <dt className="type-label inline text-inchiostro/45">{fin.farcitura} </dt>
            <dd className="inline font-bold">{farcitura}</dd>
          </div>
          <div>
            <dt className="type-label inline text-inchiostro/45">{fin.credenza} </dt>
            <dd className="inline font-bold">{credenza}</dd>
          </div>
          <div>
            <dt className="type-label inline text-inchiostro/45">{fin.finitura} </dt>
            <dd className="inline font-bold">{finitura}</dd>
          </div>
          <div>
            <dt className="type-label inline text-inchiostro/45">{fin.grammatura} </dt>
            <dd className="inline font-bold">{base.grammatura_gr} g</dd>
          </div>
          <div>
            <dt className="type-label inline text-inchiostro/45">{fin.diametro} </dt>
            <dd className="inline font-bold">{base.diametro_cm} cm</dd>
          </div>
          <div className="basis-full">
            <dt className="type-label inline text-inchiostro/45">{fin.modalitaUso} </dt>
            <dd className="inline">{testi.prodotti.modalitaUso}</dd>
          </div>
        </dl>

        <CopiaLink />
      </div>

      <ScalaFormato base={base} />

      <CampoPedane base={base} pedane={pedane} onCambia={onCambiaPedane} />

      {!moduloAperto ? (
        <button
          type="button"
          onClick={onApriModulo}
          className="ombra-pop-piccola w-fit rounded-full bg-inchiostro px-8 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-panna transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-corallo-scena motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          {fin.richiediQuotazione}
        </button>
      ) : (
        <ModuloQuotazione prodotto={prodotto} pedane={pedane} />
      )}
    </div>
  );
}

/**
 * «Copia il link del tuo dolce»: l'URL è già lo stato del prodotto (i 4
 * componenti), quindi condividere la scheda è copiare l'indirizzo.
 */
function CopiaLink() {
  const { testi } = useLingua();
  const fin = testi.configuratore.finitura;
  const [copiato, setCopiato] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copia = async () => {
    const url = window.location.origin + window.location.pathname;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopiato(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopiato(false), 2400);
  };

  return (
    <button
      type="button"
      onClick={copia}
      className="mt-5 inline-flex w-fit items-center gap-2 rounded-full text-[12px] font-semibold text-inchiostro/60 underline decoration-inchiostro/25 underline-offset-2 transition-colors hover:text-corallo-scena focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corallo-scena"
    >
      {copiato ? (
        <IconaSpunta className="h-3.5 w-3.5 text-corallo-scena" />
      ) : (
        <IconaLink className="h-3.5 w-3.5" />
      )}
      {copiato ? fin.linkCopiato : fin.copiaLink}
      <span aria-live="polite" className="sr-only">
        {copiato ? fin.linkCopiatoAria : ""}
      </span>
    </button>
  );
}
