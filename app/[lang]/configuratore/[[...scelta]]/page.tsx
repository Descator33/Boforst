import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Configuratore } from "@/components/configuratore/Configuratore";
import {
  DATASET,
  nomeCommerciale,
  parseScelta,
} from "@/lib/configuratore";
import { fotoFarciture, fotoStati, fotoTopping } from "@/lib/configuratore/foto";
import { dizionario } from "@/lib/i18n/dizionario";
import { interpola } from "@/lib/i18n/interpola";
import { haLingua, localizza } from "@/lib/i18n/lingue";
import { alternatesPer } from "@/lib/i18n/sito";
import type { IdFarcitura, IdTopping } from "@/lib/i18n/tipi";

/**
 * Configuratore dolci — route unica con optional catch-all:
 *   /{lang}/configuratore                    → passo 1 (base)
 *   /{lang}/configuratore/{base}             → passo 2 (farcitura)
 *   /{lang}/configuratore/{base}/{farcitura} → passo 3 (finitura, formato, quantità)
 *
 * La pagina server è sottile: valida i segmenti con parseScelta (un solo
 * punto di parsing), normalizza gli URL sporchi con redirect() e monta
 * l'isola client, che poi naviga tra i passi con history.pushState senza
 * altri round-trip. Lo stato prodotto vive nell'URL: una farcitura non può
 * esistere senza la sua base, quindi "cambiare base azzera la farcitura"
 * è un vincolo strutturale, non una regola da ricordare.
 *
 * Gli id nei segmenti (nuvola, crema…) restano italiani in tutte le
 * lingue: sono SKU, chiavi delle cartelle foto e del dataset validato dal
 * prebuild. Cambia solo il prefisso lingua, che parseScelta non vede —
 * le sue destinazioni sono senza prefisso e si localizzano qui.
 */

type Props = PageProps<"/[lang]/configuratore/[[...scelta]]">;

/* Le 43 varianti prerenderizzabili PER LINGUA (le lingue le dà il
   layout): radice, le 10 basi, 32 SKU. Anche la base a farcitura unica
   ha la sua pagina passo 2: dal 2026-08-02 il salto automatico non
   esiste più, la farcitura si sceglie sempre. */
export function generateStaticParams() {
  return [
    { scelta: [] },
    ...DATASET.basi.map((b) => ({ scelta: [b.id] })),
    ...DATASET.combinazioni.map((c) => ({ scelta: [c.base, c.farcitura] })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, scelta } = await params;
  if (!haLingua(lang)) return {};
  const testi = dizionario(lang);
  const meta = testi.metadata.configuratore;
  const esito = parseScelta(scelta);

  const percorso = `/configuratore${scelta?.length ? `/${scelta.join("/")}` : ""}`;
  const alternates = alternatesPer(lang, percorso);

  if (esito.tipo === "render" && esito.comb) {
    const nome = nomeCommerciale(esito.comb);
    const farcitura =
      testi.prodotti.farciture[esito.comb.farcitura as IdFarcitura];
    const topping = testi.prodotti.topping[esito.comb.topping as IdTopping];
    return {
      title: interpola(meta.combTitolo, { nome, farcitura }),
      description: interpola(meta.combDescrizione, {
        nome,
        farcitura: farcitura.toLowerCase(),
        topping: topping.toLowerCase(),
        g: esito.comb.grammatura_gr,
      }),
      alternates,
    };
  }
  if (esito.tipo === "render" && esito.base) {
    return {
      title: interpola(meta.baseTitolo, { base: esito.base.nome }),
      description: interpola(meta.baseDescrizione, { base: esito.base.nome }),
      alternates,
    };
  }
  return {
    title: meta.radiceTitolo,
    description: meta.radiceDescrizione,
    alternates,
  };
}

export default async function ConfiguratorePage({ params }: Props) {
  const { lang, scelta } = await params;
  if (!haLingua(lang)) notFound();
  const esito = parseScelta(scelta);

  if (esito.tipo === "redirect") redirect(localizza(lang, esito.destinazione));

  /* overflow-x-clip (mai hidden: romperebbe lo sticky del palco): una
     tessera trascinata oltre il bordo non apre lo scroll orizzontale.
     L'insegna della pagina (l'h1 «Crea il tuo dolce.») non sta più
     qui ma dentro l'isola: dal redesign 2026-08-04 è la prima delle
     tre colonne, e deve stare nella stessa griglia del palco. */
  return (
    <div className="configuratore-page overflow-x-clip bg-panna text-inchiostro">
      <Header />

      {/* le mappe delle foto si leggono dal filesystem qui, lato server:
          le cartelle sono il contratto, l'isola client riceve solo gli
          URL delle voci che una foto ce l'hanno */}
      <Configuratore
        foto={fotoStati()}
        fotoFarciture={fotoFarciture()}
        fotoTopping={fotoTopping()}
      />

      <Footer />
    </div>
  );
}
