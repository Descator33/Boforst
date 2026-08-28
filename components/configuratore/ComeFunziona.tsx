"use client";

import { useRef } from "react";
import { FrecciaCerchio, IconaChiudi } from "./Decori";
import { useTesti } from "@/components/LinguaProvider";

const NUMERI = ["01", "02", "03"];

/**
 * Il pulsante «come funziona» della colonna introduttiva e il dialogo
 * che apre. È un <dialog> nativo aperto con showModal(): trappola del
 * focus, ritorno del focus al pulsante alla chiusura, Esc e ruolo
 * accessibile arrivano dalla piattaforma, senza una libreria e senza
 * uno stato di apertura da tenere in React.
 */
export function ComeFunziona() {
  const testi = useTesti().configuratore.comeFunziona;
  const dialogo = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogo.current?.showModal()}
        className="configurator-how-button group inline-flex items-center rounded-full transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inchiostro motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <span className="font-bold uppercase">
          {testi.titolo}
        </span>
        <FrecciaCerchio className="h-8 w-8 shrink-0 text-inchiostro transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </button>

      <dialog
        ref={dialogo}
        aria-labelledby="come-funziona-titolo"
        onClick={(e) => {
          /* il rilascio sul backdrop chiude: il target è il dialogo
             stesso solo quando il clic cade fuori dal riquadro */
          if (e.target === dialogo.current) dialogo.current?.close();
        }}
        className="m-auto w-[min(92vw,34rem)] rounded-[28px] border-2 border-inchiostro bg-crema p-0 text-inchiostro backdrop:bg-inchiostro/45"
      >
        <div className="relative p-7 sm:p-9">
          <button
            type="button"
            onClick={() => dialogo.current?.close()}
            aria-label={testi.chiudi}
            className="absolute right-5 top-5 rounded-full border border-linea bg-carta p-1.5 text-inchiostro/60 transition-colors hover:border-inchiostro hover:text-inchiostro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corallo-scena"
          >
            <IconaChiudi className="h-4 w-4" />
          </button>

          <h2
            id="come-funziona-titolo"
            className="font-display text-[clamp(1.7rem,4vw,2.3rem)] font-extrabold leading-[0.95] tracking-[-0.03em]"
          >
            {testi.titolo}<span className="text-corallo-scena">.</span>
          </h2>

          <ol className="mt-7 list-none space-y-6">
            {testi.passi.map((p, indice) => (
              <li key={NUMERI[indice]} className="flex gap-4">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-oro font-mono text-[11px] font-bold text-inchiostro">
                  {NUMERI[indice]}
                </span>
                <div>
                  <h3 className="text-[15px] font-bold">{p.titolo}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-inchiostro/70">
                    {p.testo}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={() => dialogo.current?.close()}
            className="mt-8 w-full rounded-full bg-inchiostro py-3.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-panna transition-colors hover:bg-corallo-scena focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-corallo-scena"
          >
            {testi.ok}
          </button>
        </div>
      </dialog>
    </>
  );
}
