import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_LINGUA,
  LINGUA_PREDEFINITA,
  haLingua,
  linguaDaPercorso,
  type Lingua,
} from "@/lib/i18n/lingue";

/**
 * Il proxy delle lingue (convenzione Next 16: `proxy.ts`, non più
 * `middleware`). Ogni pagina vive sotto /[lang]; un percorso nudo —
 * /, /configuratore/nuvola, /chi-siamo, i vecchi link e i preferiti —
 * viene rediretto alla lingua giusta, scelta in quest'ordine:
 *
 *   1. il cookie NEXT_LOCALE, cioè una scelta esplicita dal selettore;
 *   2. l'Accept-Language del browser, incrociato con le cinque lingue;
 *   3. l'italiano, che è la lingua di casa.
 *
 * Il parsing dell'Accept-Language è scritto qui in dieci righe invece
 * di portare in casa negotiator + intl-localematcher (i pacchetti che
 * la guida cita): cinque lingue senza varianti regionali non hanno
 * bisogno di un matcher generale.
 *
 * 307 e non 308: la destinazione di «/» dipende da chi chiede, e un
 * redirect permanente verrebbe inchiodato nella cache del browser.
 */

function daAcceptLanguage(header: string | null): Lingua | null {
  if (!header) return null;

  const voci = header
    .split(",")
    .map((voce) => {
      const [tag, ...parametri] = voce.trim().split(";");
      const q = parametri
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="));
      return {
        /* it-IT → it: contano solo le lingue primarie */
        lingua: tag.trim().toLowerCase().split("-")[0],
        peso: q ? Number(q.slice(2)) || 0 : 1,
      };
    })
    /* q=0 significa esplicitamente «non accettabile»: non deve vincere
       soltanto perché è l'unica lingua del sito presente nell'header. */
    .filter(({ peso }) => peso > 0)
    .sort((a, b) => b.peso - a.peso);

  for (const { lingua } of voci) {
    if (haLingua(lingua)) return lingua;
  }
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* già nella sua lingua: si passa */
  if (linguaDaPercorso(pathname)) return;

  const cookie = request.cookies.get(COOKIE_LINGUA)?.value;
  const lingua = haLingua(cookie)
    ? cookie
    : (daAcceptLanguage(request.headers.get("accept-language")) ??
      LINGUA_PREDEFINITA);

  const destinazione = request.nextUrl.clone();
  destinazione.pathname = `/${lingua}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(destinazione, 307);
}

export const config = {
  /* Il proxy corre PRIMA dei file di public/: tutto ciò che ha
     un'estensione (foto, video, font, favicon) va escluso, insieme
     agli interni di Next. I percorsi delle pagine non contengono
     punti, quindi la regola non ne intercetta nessuno. */
  matcher: ["/((?!_next/static|_next/image|api|.*\\..*).*)"],
};
