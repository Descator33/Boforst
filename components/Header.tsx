"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ricordaLingua, useLingua } from "@/components/LinguaProvider";
import { LINGUE } from "@/lib/i18n/lingue";

/**
 * Header provvisorio del sito standalone: wordmark testuale e selettore
 * lingua, niente menu — c'è una pagina sola. Il marchio/brand Boforst
 * è ancora da definire col cliente: quando arriva, si sostituisce il
 * wordmark qui e il footer, il resto non si tocca.
 *
 * Il selettore cambia solo il prefisso di lingua e conserva il passo
 * corrente del configuratore (gli id SKU nei segmenti non si traducono).
 */
export function Header() {
  const { lingua, percorso } = useLingua();
  const pathname = usePathname();
  /* "/it/configuratore/nuvola" → "/configuratore/nuvola" */
  const resto = "/" + pathname.split("/").slice(2).join("/");

  return (
    <header className="flex items-center justify-between px-5 py-4 sm:px-8">
      <Link
        href={percorso("/configuratore")}
        className="type-display text-lg tracking-tight"
      >
        Delsigel
      </Link>

      <nav aria-label="Lingua" className="flex items-center gap-3">
        {LINGUE.map((altra) => (
          <Link
            key={altra}
            href={`/${altra}${resto === "/" ? "" : resto}`}
            onClick={() => ricordaLingua(altra)}
            aria-current={altra === lingua ? "true" : undefined}
            className={`font-mono text-xs uppercase tracking-widest ${
              altra === lingua
                ? "underline underline-offset-4"
                : "opacity-55 transition-opacity hover:opacity-100"
            }`}
          >
            {altra}
          </Link>
        ))}
      </nav>
    </header>
  );
}
