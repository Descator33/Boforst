/**
 * Le lingue del sito — l'unico posto che le elenca.
 *
 * Il modello è quello raccomandato dalla guida di Next in
 * node_modules/next/dist/docs/01-app/02-guides/internationalization.md:
 * ogni pagina vive sotto app/[lang]/ e il proxy alla radice porta i
 * percorsi nudi sulla lingua giusta. Qui stanno i codici, le etichette
 * del selettore e i tre attrezzi che tutto il sito usa per parlare di
 * percorsi: `localizza` (mette il prefisso), `linguaDaPercorso` (lo
 * legge) e `èHome` (riconosce la home di qualunque lingua — serve alla
 * regia della hero, che prima confrontava con "/").
 *
 * I codici sono ISO 639-1 a due lettere perché finiscono nell'URL e
 * nell'attributo lang dell'html; la SIGLA a tre lettere resta quella
 * che il selettore ha sempre mostrato nel chip ("ita", non "it").
 *
 * Modulo neutro: niente React, niente API server. Lo importano il
 * proxy, i layout, i componenti client e le Server Action.
 */

export const LINGUE = ["it", "en", "fr", "de", "fi"] as const;

export type Lingua = (typeof LINGUE)[number];

export const LINGUA_PREDEFINITA: Lingua = "it";

/** Cookie con la scelta esplicita: il nome è la convenzione Next. */
export const COOKIE_LINGUA = "NEXT_LOCALE";

export function haLingua(valore: string | undefined): valore is Lingua {
  return (LINGUE as readonly string[]).includes(valore ?? "");
}

/* Nel selettore ogni lingua si presenta nella PROPRIA lingua: è come
   la cerca chi l'italiano non lo legge. Le etichette perciò non stanno
   nei dizionari — sono uguali per tutti. */
export const ETICHETTE_LINGUE: Record<Lingua, { sigla: string; nome: string }> = {
  it: { sigla: "ita", nome: "Italiano" },
  en: { sigla: "eng", nome: "English" },
  fr: { sigla: "fra", nome: "Français" },
  de: { sigla: "deu", nome: "Deutsch" },
  fi: { sigla: "fin", nome: "Suomi" },
};

/**
 * "/configuratore" → "/en/configuratore"; "/" → "/en"; "/#storia" →
 * "/en#storia". I percorsi nei componenti restano scritti senza
 * prefisso — la lingua si aggiunge al render, in un punto solo.
 */
export function localizza(lingua: Lingua, percorso: string): string {
  if (!percorso.startsWith("/")) return percorso; // mailto:, https:, #ancora
  if (percorso === "/") return `/${lingua}`;
  if (percorso.startsWith("/#")) return `/${lingua}${percorso.slice(1)}`;
  return `/${lingua}${percorso}`;
}

/** Il primo segmento, se è una lingua nota. */
export function linguaDaPercorso(pathname: string): Lingua | null {
  const primo = pathname.split("/").filter(Boolean)[0];
  return haLingua(primo) ? primo : null;
}

/** Lo stesso percorso in un'altra lingua: "/it/contatti" → "/fi/contatti". */
export function cambiaLinguaNelPercorso(pathname: string, nuova: Lingua): string {
  const segmenti = pathname.split("/").filter(Boolean);
  if (haLingua(segmenti[0])) segmenti[0] = nuova;
  else segmenti.unshift(nuova);
  return `/${segmenti.join("/")}`;
}

/** La home, in qualunque lingua: "/", "/it", "/fi"… La regia della hero
 *  (MenuStato) confrontava con "/" — ora la home ha cinque indirizzi. */
export function èHome(pathname: string): boolean {
  if (pathname === "/") return true;
  const segmenti = pathname.split("/").filter(Boolean);
  return segmenti.length === 1 && haLingua(segmenti[0]);
}

/* ------------------------- formattazione numeri -------------------------
   La grana dei separatori cambia con la lingua (1.234 / 1,234 / 1 234):
   un solo formatter per lingua, "always" perché il default it "min2"
   scriverebbe 3360 senza punto — e la scala del formato vive di questi
   separatori. Stessa resa su server e client: niente mismatch. */

const LOCALE_NUMERI: Record<Lingua, string> = {
  it: "it-IT",
  en: "en-GB",
  fr: "fr-FR",
  de: "de-DE",
  fi: "fi-FI",
};

const formatter = new Map<Lingua, Intl.NumberFormat>();

function fmtDi(lingua: Lingua): Intl.NumberFormat {
  let f = formatter.get(lingua);
  if (!f) {
    f = new Intl.NumberFormat(LOCALE_NUMERI[lingua], { useGrouping: "always" });
    formatter.set(lingua, f);
  }
  return f;
}

export const fmtNumero = (n: number, lingua: Lingua): string =>
  fmtDi(lingua).format(n);

/**
 * Minuscola per l'uso a metà frase («Nuvola · crema e fragola») — ma il
 * tedesco scrive i sostantivi maiuscoli anche lì, quindi lì non si tocca.
 */
export function minuscola(testo: string, lingua: Lingua): string {
  return lingua === "de"
    ? testo
    : testo.toLocaleLowerCase(LOCALE_NUMERI[lingua]);
}

export const fmtKg = (n: number, lingua: Lingua): string =>
  `${fmtDi(lingua).format(Math.round(n * 10) / 10)} kg`;
