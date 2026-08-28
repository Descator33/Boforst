import { notFound, redirect } from "next/navigation";
import { haLingua, localizza } from "@/lib/i18n/lingue";

/** Su questo dominio il configuratore È il sito: la radice di lingua
 *  rimanda al passo 1. 307 (default di redirect), non permanente: la
 *  home potrebbe un giorno diventare una pagina propria. */
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!haLingua(lang)) notFound();
  redirect(localizza(lang, "/configuratore"));
}
