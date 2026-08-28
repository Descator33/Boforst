/**
 * Il repertorio disegnato del palco: scintille, asterischi, smile,
 * frecce e ghirigori. Tutto SVG, tutto in un file
 * solo — sono segni, non componenti: separarli in dieci file darebbe
 * dieci import e nessuna informazione in più.
 *
 * Regole comuni:
 *  · `aria-hidden` è dentro ogni forma, non a carico di chi la usa:
 *    sono segni, non contenuto, e non esiste un caso in cui debbano
 *    finire nell'albero accessibile;
 *  · il colore arriva da `currentColor` ovunque sia sensato, così la
 *    stessa forma serve corallo, oro o inchiostro senza duplicati;
 *  · nessuna animazione autonoma: il movimento lo decide la scena.
 *
 * Non è un client component: sono funzioni pure che rendono markup, e
 * il confine "use client" lo tiene chi le compone.
 */

/** Scintilla a quattro punte: il segno pop più ricorrente della scena. */
export function Scintilla({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path d="M50 0c3 26 24 47 50 50-26 3-47 24-50 50-3-26-24-47-50-50 26-3 47-24 50-50Z" />
    </svg>
  );
}

/** Asterisco a sei raste, tratto pieno e capi tondi: la firma pop che
 *  scavalca gli angoli del palco e apre la colonna del titolo. */
export function Asterisco({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={11}
      className={`mano-libera ${className ?? ""}`}
    >
      <path d="M49 8v84" />
      <path d="M16 27l68 46" />
      <path d="M84 25L18 75" />
    </svg>
  );
}

/** La mascotte del playground. Quattro espressioni, governate solo
 *  dallo stato già noto al palco: segue il gesto senza introdurre una
 *  nuova macchina a stati o cambiare la logica del configuratore. */
export function Smile({
  className,
  umore = "felice",
}: {
  className?: string;
  umore?: "curioso" | "felice" | "wow" | "festa";
}) {
  const festa = umore === "festa";
  const wow = umore === "wow";
  const curioso = umore === "curioso";

  return (
    <svg aria-hidden data-umore={umore} viewBox="-12 -12 124 124" className={className}>
      <g fill="var(--fucsia)" stroke="var(--corallo-scena)" strokeWidth="2.5">
        <circle cx="50" cy="5" r="23" />
        <circle cx="88" cy="23" r="23" />
        <circle cx="95" cy="64" r="23" />
        <circle cx="70" cy="94" r="23" />
        <circle cx="29" cy="94" r="23" />
        <circle cx="5" cy="63" r="23" />
        <circle cx="12" cy="23" r="23" />
      </g>
      <circle cx="50" cy="52" r="45" fill="#c99a12" opacity="0.35" />
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="var(--oro)"
        stroke="var(--inchiostro)"
        strokeWidth="4"
      />
      {festa ? (
        <>
          <path d="M27 31l5 6 7-4-3 8 6 5-9-1-5 7-1-9-8-3 8-4Z" fill="var(--inchiostro)" />
          <path d="M59 31l5 6 7-4-3 8 6 5-9-1-5 7-1-9-8-3 8-4Z" fill="var(--inchiostro)" />
        </>
      ) : (
        <>
          <rect x={curioso ? 29 : 31} y="33" width="8" height={wow ? 18 : 15} rx="4" fill="var(--inchiostro)" />
          <rect x={curioso ? 63 : 61} y="33" width="8" height={wow ? 18 : 15} rx="4" fill="var(--inchiostro)" />
        </>
      )}
      {wow ? (
        <ellipse cx="50" cy="68" rx="10" ry="12" fill="var(--inchiostro)" />
      ) : curioso ? (
        <path d="M35 67q15-6 30 0" fill="none" stroke="var(--inchiostro)" strokeWidth="5" className="mano-libera" />
      ) : (
        <path d="M30 59q20 21 40 0" fill="none" stroke="var(--inchiostro)" strokeWidth="5" className="mano-libera" />
      )}
      {festa && (
        <path d="M46 82q4 8 8 0" fill="var(--corallo-scena)" stroke="var(--inchiostro)" strokeWidth="3" className="mano-libera" />
      )}
    </svg>
  );
}

/** La freccia che dal testo punta al piatto: asta appena ondulata,
 *  punta aperta e due trattini di slancio ai lati. */
export function FrecciaGiu({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 52 58"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.4"
      className={`mano-libera ${className ?? ""}`}
    >
      <path d="M26 5c-2.6 13 2 25-.4 39" />
      <path d="M16.5 32l9 12.5L35 32" />
      <path d="M6 26L1.5 37" />
      <path d="M46 26l4.5 11" />
    </svg>
  );
}

/** Il ghirigoro della colonna sinistra: un ricciolo che si srotola e
 *  accompagna lo sguardo verso il palco. */
export function GhirigoroFreccia({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 150 76"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.6"
      className={`mano-libera ${className ?? ""}`}
    >
      <path d="M3 42c19 18 43 15 48-2 4-13-7-21-15-16-9 5-4 22 15 29 25 9 58-6 79-33" />
      <path d="M115 15l17 3-3 18" />
    </svg>
  );
}

/** La sottolineatura disegnata sotto «dolce»: un colpo solo, con la
 *  coda che si alleggerisce. */
export function SottolineaturaOro({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 240 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="8"
      className={`mano-libera ${className ?? ""}`}
      preserveAspectRatio="none"
    >
      <path d="M5 11c62-6 150-8 230-4" />
    </svg>
  );
}

/** Freccia in cerchio del pulsante nero: l'unica icona funzionale
 *  della colonna introduttiva. */
export function FrecciaCerchio({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={`mano-libera ${className ?? ""}`}
    >
      <circle cx="13" cy="13" r="12" />
      <path d="M8 13h9M13.4 9.4L17 13l-3.6 3.6" />
    </svg>
  );
}

/** La freccia che torna sui suoi passi, per la CTA «Ricomincia» del
 *  dolce finito: un giro quasi completo in senso antiorario con la
 *  coda ad angolo, lo stesso segno del glifo ↺ dei chip del rail. */
export function FrecciaRicomincia({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`mano-libera ${className ?? ""}`}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.7 9.7 0 0 0-6.7 2.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

/** I due anelli della catena, per «copia il link del tuo dolce». */
export function IconaLink({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`mano-libera ${className ?? ""}`}
    >
      <path d="M10 14a4 4 0 0 0 6 .4l3-3a4 4 0 0 0-5.7-5.7l-1.7 1.7" />
      <path d="M14 10a4 4 0 0 0-6-.4l-3 3a4 4 0 0 0 5.7 5.7l1.7-1.7" />
    </svg>
  );
}

/** La spunta del «fatto»: conferma il link copiato. */
export function IconaSpunta({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      className={`mano-libera ${className ?? ""}`}
    >
      <path d="M4.5 12.5l5 5L19.5 6.5" />
    </svg>
  );
}

/** La manina della pillola in fondo al palco: dice «si prende e si
 *  trascina» meglio di qualsiasi parola in più. */
export function IconaMano({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={`mano-libera ${className ?? ""}`}
    >
      <path d="M8.5 12.5V5.2a1.6 1.6 0 0 1 3.2 0v6.1" />
      <path d="M11.7 11.6v-1a1.6 1.6 0 0 1 3.2 0v1.5" />
      <path d="M14.9 11.9v-.7a1.6 1.6 0 0 1 3.2 0v5a5 5 0 0 1-5 5h-1a4.6 4.6 0 0 1-3.6-1.8l-2.9-3.7a1.5 1.5 0 0 1 2.2-2l1.7 1.8" />
    </svg>
  );
}

/** Chiusura del dialogo «come funziona». */
export function IconaChiudi({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className={`mano-libera ${className ?? ""}`}
    >
      <path d="M7 7l10 10M17 7L7 17" />
    </svg>
  );
}
