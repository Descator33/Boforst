import { Suspense } from "react";
import { Caricamento } from "@/components/configuratore/Caricamento";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Configuratore } from "@/components/configuratore/Configuratore";
import { DATASET, parseScelta, sceltaCompatibile } from "@/lib/configuratore";
import {
  fotoCredenza,
  fotoFarciture,
  fotoFinitura,
  fotoStati,
} from "@/lib/configuratore/foto";
import { dizionario } from "@/lib/i18n/dizionario";
import { interpola } from "@/lib/i18n/interpola";
import { haLingua, localizza } from "@/lib/i18n/lingue";
import { alternatesPer } from "@/lib/i18n/sito";
import type { IdCredenza, IdFarcitura, IdFinitura } from "@/lib/i18n/tipi";

/**
 * Configuratore dolci — route unica con optional catch-all:
 *   /{lang}/configuratore                                     → passo 1 (base)
 *   /{lang}/configuratore/{base}                               → passo 2 (farcitura)
 *   /{lang}/configuratore/{base}/{farcitura}                   → passo 3 (dalla credenza)
 *   /{lang}/configuratore/{base}/{farcitura}/{credenza}        → passo 4 (finitura)
 *   /{lang}/configuratore/{base}/{farcitura}/{credenza}/{finitura} → prodotto completo
 *
 * La pagina server è sottile: valida i segmenti con parseScelta (un solo
 * punto di parsing), normalizza gli URL sporchi con redirect() e monta
 * l'isola client, che poi naviga tra i passi con history.pushState senza
 * altri round-trip. Lo stato prodotto vive nell'URL: ogni componente
 * dipende dai precedenti per costruzione dell'URL, quindi "cambiare un
 * passo azzera i successivi" è un vincolo strutturale, non una regola da
 * ricordare.
 *
 * Gli id nei segmenti (nuvola, crema…) restano italiani in tutte le
 * lingue: sono SKU, chiavi delle cartelle foto e del dataset validato dal
 * prebuild. Cambia solo il prefisso lingua, che parseScelta non vede —
 * le sue destinazioni sono senza prefisso e si localizzano qui.
 */

type Props = PageProps<"/[lang]/configuratore/[[...scelta]]">;

/** Le varianti prerenderizzabili: radice, passi intermedi e le sole 26
 * ricette effettivamente presenti nella matrice. */
export function generateStaticParams() {
  const scelte: string[][] = [[]];
  for (const b of DATASET.basi) scelte.push([b.id]);
  for (const c of DATASET.combinazioni) {
    const conBase = [c.base];
    const conFarcitura = [...conBase, c.farcitura];
    const conCredenza = [...conFarcitura, c.credenza];
    const completa = [...conCredenza, c.finitura];
    for (const scelta of [conFarcitura, conCredenza, completa]) {
      if (!scelte.some((esistente) => esistente.join("/") === scelta.join("/")))
        scelte.push(scelta);
    }
  }
  return scelte.map((scelta) => ({ scelta }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, scelta } = await params;
  if (!haLingua(lang)) return {};
  const testi = dizionario(lang);
  const meta = testi.metadata.configuratore;
  const esito = parseScelta(scelta);

  const percorso = `/configuratore${scelta?.length ? `/${scelta.join("/")}` : ""}`;
  const alternates = alternatesPer(lang, percorso);

  if (esito.tipo === "render" && esito.prodotto) {
    const nome = esito.base!.nome;
    const farcitura =
      testi.prodotti.farciture[esito.prodotto.farcitura as IdFarcitura];
    const credenza =
      testi.prodotti.credenza[esito.prodotto.credenza as IdCredenza];
    const finitura =
      testi.prodotti.finiture[esito.prodotto.finitura as IdFinitura];
    return {
      title: interpola(meta.combTitolo, { nome, farcitura }),
      description: interpola(meta.combDescrizione, {
        nome,
        farcitura: farcitura.toLowerCase(),
        credenza: credenza.toLowerCase(),
        finitura: finitura.toLowerCase(),
        g: esito.base!.grammatura_gr,
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

  const normalizzata = sceltaCompatibile(scelta ?? []);
  if (normalizzata.join("/") !== (scelta ?? []).join("/"))
    redirect(localizza(lang, "/configuratore/" + normalizzata.join("/")));
  const foto = fotoStati(),
    farciture = fotoFarciture(),
    credenze = fotoCredenza(),
    finiture = fotoFinitura();
  const urls = [
    ...new Set([
      ...Object.values(foto),
      ...Object.values(farciture),
      ...Object.values(credenze),
      ...Object.values(finiture),
    ]),
  ];

  /* overflow-x-clip (mai hidden: romperebbe lo sticky del palco): una
     tessera trascinata oltre il bordo non apre lo scroll orizzontale.
     L'insegna della pagina (l'h1 «Crea il tuo dolce.») non sta più
     qui ma dentro l'isola: dal redesign 2026-08-04 è la prima delle
     tre colonne, e deve stare nella stessa griglia del palco. */
  return (
    <div className="configuratore-page overflow-x-clip bg-panna text-inchiostro">
      <Caricamento urls={urls}>
        <Header />

        {/* Il prebuild ricava dalle cartelle un manifest di soli URL; l'isola
          client riceve le voci che hanno una foto senza trascinare i file
          statici nel bundle della funzione serverless. */}
        <Suspense fallback={<div className="min-h-screen" />}>
          <Configuratore
            invioAttivo={Boolean(
              process.env.RESEND_API_KEY && process.env.QUOTAZIONI_FROM,
            )}
            foto={foto}
            fotoFarciture={farciture}
            fotoCredenza={credenze}
            fotoFinitura={finiture}
          />
        </Suspense>

        <Footer postilla={dizionario(lang).configuratore.esperienza.postilla} />
      </Caricamento>
    </div>
  );
}
