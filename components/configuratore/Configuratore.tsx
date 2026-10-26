"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLingua } from "@/components/LinguaProvider";
import { interpola } from "@/lib/i18n/interpola";
import {
  sceltaCompatibile,
  statoDaPathname,
  type FotoStati,
  type FotoCredenza,
  type FotoFarciture,
  type FotoFinitura,
} from "@/lib/configuratore";
import { preparaFoto } from "@/lib/configuratore/caricamento";
import { Banco } from "./Banco";
import { Intro } from "./Intro";
import { PassoBase, type DragPasso } from "./PassoBase";
import { PassoFarcitura } from "./PassoFarcitura";
import { PassoCredenza } from "./PassoCredenza";
import { PassoFinitura } from "./PassoFinitura";
import type { DatiCliente } from "./ModuloQuotazione";
import { PassoCompleto } from "./PassoCompleto";
import { Riepilogo } from "./Riepilogo";
import { Selettore } from "./Selettore";
import { Condividi } from "./Condividi";
import type { Punto } from "./TesseraScelta";

/** Prodotto e passo di modifica vivono nell'URL; nessuno store di ricette. */
export function Configuratore({
  foto,
  fotoFarciture,
  fotoCredenza,
  fotoFinitura,
  invioAttivo,
}: {
  invioAttivo: boolean;
  foto: FotoStati;
  fotoFarciture: FotoFarciture;
  fotoCredenza: FotoCredenza;
  fotoFinitura: FotoFinitura;
}) {
  const pathname = usePathname(),
    query = useSearchParams();
  const { testi, percorso, lingua } = useLingua();
  const t = testi.configuratore,
    ui = t.esperienza;
  const { base, farcitura, credenza, prodotto } = useMemo(
    () => statoDaPathname(pathname),
    [pathname],
  );
  const naturale = prodotto ? 5 : credenza ? 4 : farcitura ? 3 : base ? 2 : 1;
  const modifica = Number(query.get("modifica"));
  const passo = (
    Number.isInteger(modifica) &&
    modifica >= 1 &&
    modifica <= 4 &&
    modifica <= naturale
      ? modifica
      : naturale
  ) as 1 | 2 | 3 | 4 | 5;
  const [pedane, setPedane] = useState<number | "">(
    base?.ordine_minimo_pedane ?? 1,
  );
  const [moduloAperto, setModuloAperto] = useState(false);
  const [cliente, setCliente] = useState<DatiCliente>({
    ragione_sociale: "",
    canale: "",
    email: "",
    telefono: "",
    note: "",
  });
  const [basePrecedente, setBasePrecedente] = useState(base?.id);
  if (basePrecedente !== base?.id) {
    setBasePrecedente(base?.id);
    setPedane(base?.ordine_minimo_pedane ?? 1);
    setModuloAperto(false);
  }
  const [avviso, setAvviso] = useState<string | null>(null);
  useEffect(() => {
    if (query.has("nd")) {
      queueMicrotask(() => setAvviso(t.avvisoSceltaSparita));
      const url = new URL(window.location.href);
      url.searchParams.delete("nd");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, [query, t.avvisoSceltaSparita]);
  const dragDisponibile = usePuntatoreFine();
  const palcoRef = useRef<HTMLDivElement | null>(null);
  const titoloRef = useRef<HTMLHeadingElement | null>(null);
  const [sopraPalco, setSopraPalco] = useState(false);
  const [inAttesa, setInAttesa] = useState(false);
  const navigazione = useRef(0);
  // Un Back o un cambio lingua annulla una selezione ancora in preparazione.
  useEffect(() => {
    navigazione.current++;
    queueMicrotask(() => setInAttesa(false));
  }, [pathname, query]);
  const segmenti = [base?.id, farcitura?.id, credenza?.id, prodotto?.finitura];
  function dentroPalco(p: Punto) {
    const r = palcoRef.current?.getBoundingClientRect();
    return (
      !!r &&
      p.x - window.scrollX >= r.left &&
      p.x - window.scrollX <= r.right &&
      p.y - window.scrollY >= r.top &&
      p.y - window.scrollY <= r.bottom
    );
  }
  async function vaiA(path: string) {
    const token = ++navigazione.current;
    setInAttesa(true);
    setAvviso(null);
    const parti = path.split("?")[0].split("/").filter(Boolean).slice(1);
    const src = foto[parti.join("--")];
    if (src) {
      try {
        await preparaFoto(src);
      } catch {
        if (token === navigazione.current) setAvviso(ui.erroreFoto);
      }
    }
    if (token !== navigazione.current) return;
    window.history.pushState(null, "", percorso(path));
    setInAttesa(false);
  }
  function scegli(n: number, id: string) {
    const nuove = segmenti.map((v) => v ?? "");
    nuove[n - 1] = id;
    const scelta = sceltaCompatibile(nuove);
    void vaiA("/configuratore/" + scelta.join("/"));
  }
  function apriPasso(n: 1 | 2 | 3 | 4) {
    void vaiA(pathname.replace(/^\/[a-z]{2}/, "") + "?modifica=" + n);
  }
  function ricomincia() {
    setModuloAperto(false);
    setPedane(base?.ordine_minimo_pedane ?? 1);
    void vaiA("/configuratore/" + sceltaCompatibile([]).join("/"));
  }
  const dragTessere: DragPasso =
    dragDisponibile && !inAttesa
      ? {
          onSposta: (p) => setSopraPalco(dentroPalco(p)),
          onRilascia: (id, p) => {
            setSopraPalco(false);
            if (!dentroPalco(p)) return false;
            scegli(passo, id);
            return true;
          },
        }
      : null;
  const titoloSelettore =
    passo === 1
      ? t.titoli.passo1
      : passo === 2
        ? t.titoli.passo2
        : passo === 3
          ? t.titoli.passo3
          : passo === 4
            ? t.titoli.passo4
            : t.titoli.completo;
  const fase = `${passo}-${lingua}`;
  const fasePrecedente = useRef(fase);
  useEffect(() => {
    if (fasePrecedente.current === fase) return;
    fasePrecedente.current = fase;
    const el = titoloRef.current;
    el?.focus({ preventScroll: true });
    if (window.matchMedia("(max-width:63.99rem)").matches)
      el?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }, [fase]);
  useEffect(() => {
    document.title = prodotto
      ? [
          base?.nome,
          testi.prodotti.farciture[
            prodotto.farcitura as keyof typeof testi.prodotti.farciture
          ],
          testi.prodotti.credenza[
            prodotto.credenza as keyof typeof testi.prodotti.credenza
          ],
          "Delsigel",
        ].join(" · ")
      : `${titoloSelettore} · Delsigel`;
    // History API non aggiorna i metadata server: sincronizziamo canonical e hreflang.
    document
      .querySelector<HTMLLinkElement>('link[rel="canonical"]')
      ?.setAttribute("href", window.location.origin + pathname);
    document
      .querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')
      .forEach((el) => {
        const lang = el.hreflang === "x-default" ? "it" : el.hreflang;
        el.href =
          window.location.origin + pathname.replace(/^\/[a-z]{2}/, "/" + lang);
      });
  }, [pathname, prodotto, base?.nome, testi, titoloSelettore]);
  return (
    <main
      id="contenuto"
      data-livello={passo}
      data-completo={passo === 5 ? "true" : "false"}
      className="configuratore-playground relative isolate overflow-hidden"
    >
      <ScenografiaCandy />
      <div className="configurator-frame relative z-10 mx-auto">
        <p aria-live="polite" className="sr-only">
          {passo === 5
            ? ui.completato
            : interpola(t.passoDi, { n: passo, titolo: titoloSelettore })}
        </p>
        {avviso && (
          <p role="status" className="configurator-notice">
            {avviso}
          </p>
        )}
        <div className="configurator-shell">
          <div className="configurator-intro min-w-0">
            <Intro />
          </div>
          <div className="configurator-progress min-w-0">
            <Riepilogo
              base={base}
              farcitura={farcitura}
              credenza={credenza}
              prodotto={prodotto}
              apriPasso={apriPasso}
              corrente={passo}
            />
          </div>
          <div
            className="configurator-stage mx-auto w-full min-w-0"
            aria-busy={inAttesa}
          >
            <Banco
              ref={palcoRef}
              base={base}
              farcitura={farcitura}
              credenza={credenza}
              prodotto={prodotto}
              foto={foto}
              sopra={sopraPalco}
              passo={passo}
              apriPasso={apriPasso}
              onRicomincia={ricomincia}
            />
          </div>
          <Selettore titolo={titoloSelettore} titoloRef={titoloRef}>
            {prodotto && passo < 5 && (
              <button
                type="button"
                className="mb-5 underline"
                onClick={() => void vaiA(pathname.replace(/^\/[a-z]{2}/, ""))}
              >
                {ui.annulla}
              </button>
            )}
            <div inert={inAttesa}>
              {passo === 1 && (
                <PassoBase
                  foto={foto}
                  selezionata={base?.id ?? null}
                  onScegli={(id) => scegli(1, id)}
                  drag={dragTessere}
                />
              )}
              {passo === 2 && (
                <PassoFarcitura
                  fotoFarciture={fotoFarciture}
                  selezionata={farcitura?.id ?? null}
                  onScegli={(id) => scegli(2, id)}
                  drag={dragTessere}
                />
              )}
              {passo === 3 && (
                <PassoCredenza
                  fotoCredenza={fotoCredenza}
                  base={base!.id}
                  farcitura={farcitura!.id}
                  selezionata={credenza?.id ?? null}
                  onScegli={(id) => scegli(3, id)}
                  drag={dragTessere}
                />
              )}
              {passo === 4 && (
                <PassoFinitura
                  fotoFinitura={fotoFinitura}
                  base={base!.id}
                  farcitura={farcitura!.id}
                  credenza={credenza!.id}
                  selezionata={prodotto?.finitura ?? null}
                  onScegli={(id) => scegli(4, id)}
                  drag={dragTessere}
                />
              )}
              {passo === 5 && prodotto && base && (
                <PassoCompleto
                  prodotto={prodotto}
                  base={base}
                  pedane={pedane}
                  onCambiaPedane={setPedane}
                  moduloAperto={moduloAperto}
                  onApriModulo={() => setModuloAperto(true)}
                  invioAttivo={invioAttivo}
                  cliente={cliente}
                  onClienteChange={setCliente}
                />
              )}
            </div>
          </Selettore>
          <div className="configurator-savebar" id="salva-il-tuo-dolce">
            <div>
              <strong>{t.salvataggio.haiIdea}</strong>
              <span>{t.salvataggio.condividi}</span>
            </div>
            <span aria-hidden className="configurator-savebar__heart">
              ♥
            </span>
            <Condividi
              completo={!!prodotto}
              onCompleta={() => {
                titoloRef.current?.focus();
                titoloRef.current?.scrollIntoView({ block: "center" });
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
function ScenografiaCandy() {
  return (
    <div
      aria-hidden
      className="candy-scenografia pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <span className="candy-blob candy-blob--giallo" />
      <span className="candy-blob candy-blob--rosa-alto" />
      <span className="candy-blob candy-blob--arancio" />
      <span className="candy-blob candy-blob--rosa-basso" />
      <span className="candy-blob candy-blob--viola" />
      <span className="candy-caramella candy-caramella--1" />
      <span className="candy-caramella candy-caramella--2" />
      <span className="candy-caramella candy-caramella--3" />
      <span className="candy-caramella candy-caramella--4" />
      <span className="candy-caramella candy-caramella--5" />
      <span className="candy-pallina candy-pallina--1" />
      <span className="candy-pallina candy-pallina--2" />
      <span className="candy-pallina candy-pallina--3" />
      <span className="candy-pallina candy-pallina--4" />
    </div>
  );
}

const QUERY_PUNTATORE = "(hover: hover) and (pointer: fine)";
function usePuntatoreFine(): boolean {
  return useSyncExternalStore(
    (avvisa) => {
      const mq = window.matchMedia(QUERY_PUNTATORE);
      mq.addEventListener("change", avvisa);
      return () => mq.removeEventListener("change", avvisa);
    },
    () => window.matchMedia(QUERY_PUNTATORE).matches,
    () => false,
  );
}
