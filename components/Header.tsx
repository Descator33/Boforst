"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoStorico } from "@/components/LogoStorico";
import { ricordaLingua, useLingua } from "@/components/LinguaProvider";
import { ETICHETTE_LINGUE, LINGUE } from "@/lib/i18n/lingue";

/**
 * Header del sito standalone: marchio ufficiale e selettore lingua,
 * niente menu — c'è una pagina sola. Il brand Boforst è ancora da
 * definire col cliente: quando arriva, si sostituisce il logo qui e
 * il footer, il resto non si tocca.
 *
 * Il selettore cambia solo il prefisso di lingua e conserva il passo
 * corrente del configuratore (gli id SKU nei segmenti non si traducono).
 * Ogni lingua mostra la propria sigla a tre lettere ("ita", non "it"),
 * come da convenzione del sito d'origine.
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
        aria-label="Delsigel"
        className="text-bruno transition-opacity hover:opacity-80"
      >
        <LogoStorico className="h-9 w-auto sm:h-11" />
      </Link>

      <nav
        aria-label="Lingua"
        className="flex items-center gap-0.5 rounded-full border border-linea bg-carta p-1 shadow-[0_2px_10px_rgba(107,60,30,0.06)]"
      >
        {LINGUE.map((altra) => {
          const attiva = altra === lingua;
          return (
            <Link
              key={altra}
              href={`/${altra}${resto === "/" ? "" : resto}`}
              onClick={() => ricordaLingua(altra)}
              aria-current={attiva ? "true" : undefined}
              title={ETICHETTE_LINGUE[altra].nome}
              className={`rounded-full px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors sm:px-3 ${
                attiva
                  ? "bg-inchiostro text-panna"
                  : "text-inchiostro/55 hover:bg-panna-dim hover:text-inchiostro"
              }`}
            >
              {ETICHETTE_LINGUE[altra].sigla}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
