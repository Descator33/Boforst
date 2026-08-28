"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTesti } from "@/components/LinguaProvider";

/** Coordinate di pagina del puntatore durante il trascinamento. */
export type Punto = { x: number; y: number };

/**
 * Segnaposto per le voci senza foto (farciture e finiture: le cartelle
 * di public/img/configuratore/farciture/ sono ancora vuote). Una goccia
 * di crema disegnata con l'iniziale sopra, misurata in cqw sulla
 * tessera — che è un container — così cresce con la colonna.
 *
 * L'iniziale e non il nome per intero: il nome sta già SOTTO la
 * tessera, e scriverlo due volte fa sembrare rotta la card. Il giorno
 * in cui la foto arriva nella cartella, questo segnaposto sparisce da
 * solo senza toccare il codice.
 */
export function SegnaPosto({ testo }: { testo: string }) {
  return (
    <span
      aria-hidden
      className="absolute inset-[7%] flex items-center justify-center rounded-full bg-[radial-gradient(circle_at_36%_28%,#fff0e6,#ffd6c0_72%,#f7c4ab)]"
    >
      <span className="type-display text-[30cqw] leading-none text-inchiostro/20">
        {testo.charAt(0)}
      </span>
    </span>
  );
}

/** Contratto del trascinamento verso il palco, già legato alla
 *  tessera: `onRilascia` risponde true se il rilascio è caduto sulla
 *  scena (la selezione parte da lì); false fa tornare il pezzo a
 *  posto da solo. */
export type DragTessera = {
  onSposta: (p: Punto) => void;
  onRilascia: (p: Punto) => boolean;
};

/** Quel che serve al volo della tessera scelta col tap: da dove parte
 *  (il rect del quadro, misurato al click) e cosa vola — la foto, o
 *  l'iniziale del segnaposto quando la foto non c'è ancora. Lo
 *  compone il passo, che conosce foto e nome; la tessera mette solo
 *  il rect. */
export type VoloTessera = {
  quadro: DOMRect;
  foto: string | null;
  iniziale: string;
};

/**
 * La tessera del configuratore: un controllo, non una decorazione.
 * Fondo carta, filo beige, angoli larghi, il prodotto scontornato
 * grande al centro e il nome sotto, dentro la tessera — è la card
 * della reference, e a differenza del vecchio quadro inchiostro non
 * ha bisogno di contrasto invertito per farsi leggere.
 *
 * Tre stati, tutti dichiarati e non solo colorati:
 *  · hover/focus — sollevamento e ombra pop gialla, tastiera alla pari
 *    del mouse (:focus-visible nella regola .tessera);
 *  · selected — aria-pressed, profilo corallo e pallino pieno accanto
 *    al nome, così la scelta si legge anche senza colore;
 *  · dragging — data-vola: la tessera resta al suo posto come casella
 *    vuota tratteggiata mentre il prodotto vola col puntatore.
 *
 * Il drag è un'aggiunta per puntatori fini (sul touch litigherebbe
 * con lo scroll: lì comanda il tap, che fa la stessa identica cosa).
 * Il click sintetico sparato dal browser a fine trascinamento si
 * sopprime col ref, azzerato in un timeout perché arriva nello stesso
 * task del pointerup.
 */
export function TesseraScelta({
  titolo,
  sotto,
  descrizione,
  selezionata,
  onScegli,
  drag,
  children,
}: {
  titolo: string;
  /** riga minuta sotto il nome (es. «diventa Bomba Super») */
  sotto?: string;
  /** etichetta accessibile completa, quando il nome da solo non basta */
  descrizione?: string;
  selezionata?: boolean;
  /** al tap arriva il rect del quadro, perché la scelta possa volare
   *  dalla tessera al palco; assente solo se il quadro non è montato */
  onScegli: (quadro?: DOMRect) => void;
  /** trascinamento verso il palco: presente solo con puntatori fini */
  drag?: DragTessera | null;
  /** contenuto del quadro: immagine scontornata o resa tipografica */
  children: ReactNode;
}) {
  const testi = useTesti();
  const clickDaDrag = useRef(false);
  const quadroRef = useRef<HTMLSpanElement | null>(null);
  const [inDrag, setInDrag] = useState(false);
  const riduci = useReducedMotion();

  return (
    <button
      type="button"
      onClick={() => {
        if (clickDaDrag.current) return;
        onScegli(quadroRef.current?.getBoundingClientRect());
      }}
      aria-pressed={selezionata ?? false}
      aria-label={descrizione}
      data-vola={inDrag ? "true" : "false"}
      data-drag={drag ? "true" : "false"}
      className={`tessera relative block w-full select-none text-center focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-viola ${
        drag ? "cursor-grab active:cursor-grabbing" : ""
      } ${inDrag ? "z-[60]" : ""}`}
    >
      <span aria-hidden className="tessera-invito">
        {inDrag
          ? testi.configuratore.tessera.inVolo
          : testi.configuratore.tessera.prendimi}
      </span>

      <span ref={quadroRef} className="tessera-quadro relative block w-full @container">
        {drag ? (
          <motion.span
            className="absolute inset-0 block"
            drag
            dragSnapToOrigin
            dragMomentum={false}
            whileDrag={riduci ? undefined : { scale: 1.14, rotate: -3 }}
            onDragStart={() => {
              /* Motion apre una sessione drag già al pointerdown. Il
                 click resta valido finché il puntatore non si è mosso
                 davvero: così mouse e trackpad possono ancora scegliere
                 con un tap breve, oltre che trascinare. */
              clickDaDrag.current = false;
              setInDrag(true);
            }}
            onDrag={(_e, info) => {
              if (Math.hypot(info.offset.x, info.offset.y) > 6) {
                clickDaDrag.current = true;
              }
              drag.onSposta(info.point);
            }}
            onDragEnd={(_e, info) => {
              drag.onRilascia(info.point);
              setInDrag(false);
              setTimeout(() => {
                clickDaDrag.current = false;
              }, 0);
            }}
          >
            {children}
          </motion.span>
        ) : (
          children
        )}
      </span>

      <span className="tessera-nome block">
        <span className="inline-flex items-center gap-1.5 font-bold uppercase leading-tight tracking-[0.03em] text-inchiostro">
          {selezionata && (
            <span
              aria-hidden
              className="h-[6px] w-[6px] shrink-0 rounded-full bg-corallo-scena"
            />
          )}
          {titolo}
        </span>
        {sotto && (
          <span className="mt-0.5 block text-[9.5px] font-semibold uppercase tracking-[0.04em] text-corallo-scena">
            {sotto}
          </span>
        )}
      </span>
    </button>
  );
}
