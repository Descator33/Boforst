/**
 * Footer provvisorio del sito standalone: firma e recapito, in attesa
 * del brand Boforst e dei dati societari da mettere a piè di pagina
 * (privacy policy compresa: su un dominio nuovo va pubblicata la sua).
 */
export function Footer({ postilla }: { postilla: string }) {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-2 px-5 py-5 sm:px-8">
      <span className="font-mono text-xs uppercase tracking-widest opacity-70">
        Delsigel — dal 1960
      </span>
      <a
        href="mailto:info@delsigel.it"
        className="font-mono text-xs uppercase tracking-widest opacity-70 transition-opacity hover:opacity-100"
      >
        info@delsigel.it
      </a>
      <p className="mt-4 w-full border-t border-linea pt-4 text-sm leading-relaxed text-inchiostro/70">
        <small className="block max-w-5xl text-inherit">{postilla}</small>
      </p>
    </footer>
  );
}
