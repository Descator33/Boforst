"use client";

import { useState } from "react";

/**
 * Immagine con catena di ripiego. Le sorgenti arrivano SOLO dalle
 * cartelle di stato di public/img/configuratore/prodotti/ (scoperte dal
 * server, vedi lib/configuratore/foto.ts), già in ordine di preferenza:
 * stato corrente, poi gli stati precedenti del dolce, infine il
 * placeholder tipografico onesto del sito. Man mano che le foto
 * arrivano nelle cartelle, la catena si accorcia da sola senza toccare
 * il codice.
 *
 * `notaRipiego` compare quando NON si sta mostrando la foto dello stato
 * corrente: al passo 3 dice che la finitura è descritta a parole — mai
 * un'immagine di un'altra farcitura.
 *
 * `classe` governa solo l'inquadratura (la tessera centra con un po'
 * d'aria, il palco appoggia il prodotto sul piano): object-contain non
 * si tocca mai, gli asset non si deformano.
 */
export function ImmagineProdotto({
  sorgenti,
  alt,
  iniziale,
  notaRipiego,
  classe = "absolute inset-0 h-full w-full object-contain p-3",
}: {
  /** in ordine di preferenza; le voci null/undefined si scartano */
  sorgenti: (string | null | undefined)[];
  alt: string;
  /** lettera del placeholder tipografico */
  iniziale: string;
  notaRipiego?: string;
  /** inquadratura dell'immagine; deve restare object-contain */
  classe?: string;
}) {
  const valide = sorgenti.filter((s): s is string => Boolean(s));

  /* l'indice di ripiego è legato alla lista di sorgenti: se cambia il
     prodotto si riparte dalla sorgente migliore. Stato derivato durante
     il render, senza effect. */
  const chiave = valide.join("|");
  const [stato, setStato] = useState({ chiave, indice: 0 });
  const indice = stato.chiave === chiave ? stato.indice : 0;
  const setIndice = (i: number) => setStato({ chiave, indice: i });

  const src = indice < valide.length ? valide[indice] : null;
  const inRipiego = indice > 0 || !src;

  return (
    <>
      {inRipiego && notaRipiego && (
        <span className="absolute right-2 top-2 z-10 rounded-full border border-linea bg-carta px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-inchiostro/60">
          {notaRipiego}
        </span>
      )}
      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={alt}
          loading="lazy"
          draggable={false}
          /* l'errore di rete può scattare PRIMA dell'idratazione, quando
             onError non è ancora attaccato: il ref callback recupera i
             404 già consumati (complete e larghezza zero) */
          ref={(el) => {
            if (el && el.complete && el.naturalWidth === 0)
              setIndice(indice + 1);
          }}
          onError={() => setIndice(indice + 1)}
          className={classe}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="type-display text-[38cqw] leading-none text-inchiostro/12">
            {iniziale}
          </span>
        </div>
      )}
    </>
  );
}
