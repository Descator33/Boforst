"use client";

import type { ReactNode, Ref } from "react";

/**
 * La colonna delle scelte: rail dei passi, titolo sottolineato d'oro,
 * e sotto quello che il passo corrente propone — la griglia delle
 * tessere ai passi 1 e 2, il pannello dei numeri quando il dolce è
 * finito. Il guscio è uno solo per tutti e tre i passi: cambiando
 * passo cambia il contenuto, non l'impaginato, e l'occhio non deve
 * riorientarsi.
 *
 * Il titolo è il punto d'arrivo del focus quando la fase cambia (il
 * Configuratore lo raggiunge via `titoloRef`): chi naviga da
 * tastiera o con lo screen reader atterra sull'intestazione nuova
 * invece di restare su un controllo che non c'è più. tabIndex -1,
 * così il giro del Tab non lo incontra; l'anello si vede solo
 * :focus-visible, quindi mai per chi ha cliccato col mouse.
 */
export function Selettore({
  titolo,
  titoloRef,
  children,
}: {
  titolo: string;
  titoloRef?: Ref<HTMLHeadingElement>;
  children: ReactNode;
}) {
  return (
    <div className="relative min-w-0">
      {/* i trattini di slancio in testa alla colonna, come nella
          reference: tre segni e basta */}
      <svg
        aria-hidden
        viewBox="0 0 40 34"
        fill="none"
        stroke="var(--corallo-scena)"
        strokeWidth="3.4"
        className="mano-libera pointer-events-none absolute -top-6 right-0 hidden w-[34px] xl:block"
      >
        <path d="M4 30L14 4" />
        <path d="M20 30L27 8" />
        <path d="M34 26l4-18" />
      </svg>

      <h2
        ref={titoloRef}
        tabIndex={-1}
        className="configurator-selector-title inline-block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-inchiostro"
      >
        <span className="block font-display font-extrabold uppercase leading-[0.95] tracking-[-0.025em] text-inchiostro">
          {titolo}
        </span>
      </h2>

      <div className="configurator-inventory">{children}</div>
    </div>
  );
}

/** La griglia delle tessere: due colonne sul telefono, tre da sm in
 *  su — la misura della reference. */
export function GrigliaTessere({ children }: { children: ReactNode }) {
  return (
    <ul className="candy-inventory grid list-none grid-cols-2 gap-3 sm:grid-cols-3">
      {children}
    </ul>
  );
}
