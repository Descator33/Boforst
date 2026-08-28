import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LinguaProvider } from "@/components/LinguaProvider";
import { dizionario } from "@/lib/i18n/dizionario";
import { LINGUE, haLingua, type Lingua } from "@/lib/i18n/lingue";
import { BASE_SITO, alternatesPer } from "@/lib/i18n/sito";
import { variabiliSito } from "../fonts";
import "../globals.css";

/**
 * Root layout del configuratore standalone: rispetto al sito madre
 * cadono preloader, porta d'ingresso e menu — resta la sola cosa che
 * il configuratore richiede davvero, la lingua. Il server sceglie il
 * dizionario e lo passa al provider; tutto il resto è nella pagina.
 */

/* Le cinque lingue si prerenderizzano tutte: il contenuto è statico
 * per lingua, non per visitatore. */
export function generateStaticParams() {
  return LINGUE.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!haLingua(lang)) return {};
  const testi = dizionario(lang);
  return {
    metadataBase: BASE_SITO,
    title: testi.metadata.configuratore.radiceTitolo,
    description: testi.metadata.configuratore.radiceDescrizione,
    alternates: alternatesPer(lang, "/"),
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!haLingua(lang)) notFound();
  const lingua: Lingua = lang;
  const testi = dizionario(lingua);

  return (
    <html lang={lingua} className={`${variabiliSito} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-panna text-inchiostro">
        <LinguaProvider lingua={lingua} testi={testi}>
          {children}
        </LinguaProvider>
      </body>
    </html>
  );
}
