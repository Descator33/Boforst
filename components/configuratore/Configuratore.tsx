"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";
import { useLingua } from "@/components/LinguaProvider";
import { interpola } from "@/lib/i18n/interpola";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  statoDaPathname,
  type FotoCredenza,
  type FotoFarciture,
  type FotoFinitura,
  type FotoStati,
} from "@/lib/configuratore";
import { Banco, ZONA_DOLCE } from "./Banco";
import { Intro } from "./Intro";
import { PassoBase, type DragPasso } from "./PassoBase";
import { PassoCompleto } from "./PassoCompleto";
import { PassoCredenza } from "./PassoCredenza";
import { PassoFarcitura } from "./PassoFarcitura";
import { PassoFinitura } from "./PassoFinitura";
import { Riepilogo } from "./Riepilogo";
import { Selettore } from "./Selettore";
import { SegnaPosto, type Punto, type VoloTessera } from "./TesseraScelta";

/**
 * L'isola client del configuratore. Lo stato prodotto NON è uno state:
 * si deriva dal pathname, che è l'unica sorgente di verità — i 4 passi
 * (base, farcitura, dalla credenza, finitura) avanzano tutti allo
 * stesso modo con history.pushState (integrato nel router di Next, si
 * sincronizza con usePathname) e il Back/Forward del browser funziona
 * da solo. Restano client-only le cose di sessione: quantità in pedane,
 * apertura del modulo, avviso di scelta non più disponibile.
 *
 * Dal refactor 2026-08-28 ogni combinazione dei 4 componenti è valida
 * (prodotto cartesiano aperto): non c'è più bisogno di un gesto di
 * "applicazione" separato per la finitura, come nel vecchio modello a
 * matrice chiusa — scegliere la finitura È l'ultimo pushState, e il
 * pannello dei numeri (PassoCompleto) compare da solo quando i 4
 * segmenti sono tutti nell'URL.
 *
 * IMPAGINATO (redesign 2026-08-04) — tre aree, come la reference:
 * l'insegna a sinistra, il palco al centro e la colonna delle scelte a
 * destra. Sotto xl le tre colonne diventano due (insegna a tutta
 * larghezza, poi palco e scelte), e sotto lg una sola pila: insegna,
 * palco, prodotti. Le MISURE sono uniche per tutte le fasi
 * (2026-08-21): tutta la scena tiene la misura della fase finale —
 * quella che sta in pagina senza scrollare — e su xl il palco è sempre
 * sticky: se la colonna delle tessere scorre, la scena (che è anche il
 * bersaglio del drag) resta davanti agli occhi.
 *
 * Con un puntatore fine le tessere si possono anche TRASCINARE sul
 * palco — il rilascio riuscito chiama la stessa funzione "scegli*" del
 * click, quindi per l'URL (e per il Back) i due gesti sono
 * indistinguibili. Il hit-test confronta le coordinate di pagina del
 * puntatore (info.point di motion) con il rect del palco riportato in
 * coordinate di pagina.
 *
 * IL VOLO (2026-08-20): anche il tap ha la sua scenografia. La scelta
 * col click/tocco fa volare il contenuto della tessera fino alla zona
 * del dolce sul palco — un clone fixed che parte dal rect del quadro e
 * atterra su ZONA_DOLCE — e la selezione vera (il pushState) parte SOLO
 * all'atterraggio: così l'ingresso del prodotto sul palco è il
 * naturale secondo tempo del volo. Durante il volo la scena si accende
 * come al sorvolo del drag (stesso `sopraPalco`). Niente volo con
 * reduced-motion o quando la zona d'atterraggio non è tutta nel
 * viewport (lì al gesto risponde il CONTROCAMPO: sotto lg il palco sta
 * sopra la colonna delle scelte, e dopo ogni scelta col tap la pagina
 * scorre a centrarlo — il gesto parte dalla tessera, lo sguardo torna
 * alla scena).
 */
export function Configuratore({
  foto,
  fotoFarciture,
  fotoCredenza,
  fotoFinitura,
}: {
  /** stato → URL foto, scoperta dal server nelle cartelle di
   *  public/img/configuratore/prodotti/: chiave assente = niente foto */
  foto: FotoStati;
  /** farcitura → URL della foto dell'ingrediente da solo (cartelle di
   *  public/img/configuratore/farciture/), per le tessere del passo 2 */
  fotoFarciture: FotoFarciture;
  /** voce dalla credenza → URL della foto dell'ingrediente da solo
   *  (cartelle di public/img/configuratore/credenza/), per le tessere
   *  del passo 3 */
  fotoCredenza: FotoCredenza;
  /** finitura → URL della foto della finitura da sola (cartelle di
   *  public/img/configuratore/finiture/), per le tessere del passo 4 */
  fotoFinitura: FotoFinitura;
}) {
  const pathname = usePathname();
  const { testi, percorso } = useLingua();
  const { base, farcitura, credenza, prodotto } = useMemo(
    () => statoDaPathname(pathname),
    [pathname]
  );
  const passo = prodotto ? 5 : credenza ? 4 : farcitura ? 3 : base ? 2 : 1;
  const riduci = useReducedMotion();

  /* quantità proposta: il minimo dove esiste, 1 altrove — lazy init così
     il primo render (anche server) è già giusto, senza flicker */
  const [pedane, setPedane] = useState<number | "">(() =>
    prodotto ? (base?.ordine_minimo_pedane ?? 1) : ""
  );
  const [moduloAperto, setModuloAperto] = useState(false);

  /* cambiare prodotto azzera quantità e modulo: minimo e catena
     logistica sono della base, un numero trascinato sembrerebbe
     confermato e non lo è. Adeguamento durante il render, non in effect:
     niente frame intermedio con i dati del prodotto precedente. */
  const sku = prodotto?.sku ?? null;
  const [skuPrecedente, setSkuPrecedente] = useState(sku);
  if (sku !== skuPrecedente) {
    setSkuPrecedente(sku);
    setPedane(prodotto ? (base?.ordine_minimo_pedane ?? 1) : "");
    setModuloAperto(false);
  }

  /* avviso discreto per l'URL con una scelta non più valida: arriva
     dal redirect server come ?nd=…, si legge una volta e si pulisce l'URL */
  const [avviso, setAvviso] = useState<string | null>(null);
  useEffect(() => {
    /* lettura una-tantum di un sistema esterno (l'URL), impossibile in
       SSR senza mismatch di idratazione: l'effect è il posto giusto */
    const nd = new URLSearchParams(window.location.search).get("nd");
    if (nd) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvviso(testi.configuratore.avvisoSceltaSparita);
      window.history.replaceState(null, "", window.location.pathname);
    }
    /* il testo dell'avviso si legge una volta sola all'arrivo: cambiarlo
       al cambio lingua non serve, l'avviso muore col primo gesto */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* il drag è un'aggiunta per puntatori fini: sul touch litigherebbe con
     lo scroll, e il tap resta la selezione. Falso in SSR e finché non si
     idrata: le tessere diventano trascinabili dopo, ed è voluto. */
  const dragDisponibile = usePuntatoreFine();
  const palcoRef = useRef<HTMLDivElement | null>(null);
  const [sopraPalco, setSopraPalco] = useState(false);

  const dentroPalco = (p: Punto) => {
    const el = palcoRef.current;
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const x = p.x - window.scrollX;
    const y = p.y - window.scrollY;
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  /* i percorsi si spingono già localizzati: /fi/configuratore/… */
  const vaiA = (path: string) =>
    window.history.pushState(null, "", percorso(path));

  const scegliBase = (id: string) => vaiA(`/configuratore/${id}`);

  const scegliFarcitura = (id: string) => {
    if (base) vaiA(`/configuratore/${base.id}/${id}`);
  };

  const scegliCredenza = (id: string) => {
    if (base && farcitura) vaiA(`/configuratore/${base.id}/${farcitura.id}/${id}`);
  };

  const scegliFinitura = (id: string) => {
    if (base && farcitura && credenza)
      vaiA(`/configuratore/${base.id}/${farcitura.id}/${credenza.id}/${id}`);
  };

  /* sotto lg (impaginato a pila) il palco sta sopra la colonna delle
     scelte e la scelta col tap accadrebbe fuori schermo: il controcampo
     centra il palco dopo ogni gesto. Da lg in su è un no-op: le colonne
     sono affiancate e la scena è già davanti agli occhi. */
  const controcampo = () => {
    if (window.matchMedia("(max-width: 63.99rem)").matches) {
      palcoRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "center",
      });
    }
  };

  /* --- il volo della tessera ------------------------------------- */

  type VoloInCorso = {
    chiave: number;
    foto: string | null;
    iniziale: string;
    da: { x: number; y: number; w: number; h: number };
    a: { x: number; y: number; w: number; h: number };
    fine: () => void;
  };
  const [volo, setVolo] = useState<VoloInCorso | null>(null);
  const contatoreVolo = useRef(0);
  const voloCommesso = useRef(0);

  /* la zona del dolce sul palco, in coordinate viewport: le stesse
     frazioni con cui il Banco posiziona il prodotto (ZONA_DOLCE) */
  const zonaAtterraggio = () => {
    const el = palcoRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const w = r.width * ZONA_DOLCE.width;
    const h = r.height * ZONA_DOLCE.height;
    const x = r.left + r.width * ZONA_DOLCE.left;
    const y = r.top + r.height * (1 - ZONA_DOLCE.bottom - ZONA_DOLCE.height);
    return { x, y, w, h, visibile: y >= 0 && y + h <= window.innerHeight };
  };

  /* fa volare la tessera e commette la scelta all'atterraggio; senza
     volo possibile (reduced-motion, zona fuori viewport, quadro non
     misurato) commette subito e risponde col controcampo */
  const lanciaVerso = (fine: () => void, v?: VoloTessera) => {
    const zona = zonaAtterraggio();
    if (riduci || !v || !zona || !zona.visibile) {
      fine();
      controcampo();
      return;
    }
    contatoreVolo.current += 1;
    setSopraPalco(true);
    setVolo({
      chiave: contatoreVolo.current,
      foto: v.foto,
      iniziale: v.iniziale,
      da: { x: v.quadro.left, y: v.quadro.top, w: v.quadro.width, h: v.quadro.height },
      a: zona,
      fine: () => {
        setSopraPalco(false);
        fine();
      },
    });
  };

  const dragTessere: DragPasso = dragDisponibile
    ? {
        onSposta: (p) => setSopraPalco(dentroPalco(p)),
        onRilascia: (id, p) => {
          setSopraPalco(false);
          if (!dentroPalco(p)) return false;
          if (passo === 1) scegliBase(id);
          else if (passo === 2) scegliFarcitura(id);
          else if (passo === 3) scegliCredenza(id);
          else if (passo === 4) scegliFinitura(id);
          return true;
        },
      }
    : null;

  const apriPasso = (n: 1 | 2 | 3 | 4) => {
    setAvviso(null);
    if (n === 1) vaiA("/configuratore");
    else if (n === 2 && base) vaiA(`/configuratore/${base.id}`);
    else if (n === 3 && base && farcitura)
      vaiA(`/configuratore/${base.id}/${farcitura.id}`);
    else if (n === 4 && base && farcitura && credenza)
      vaiA(`/configuratore/${base.id}/${farcitura.id}/${credenza.id}`);
  };

  const ricomincia = () => {
    setAvviso(null);
    vaiA("/configuratore");
  };

  /* la fase "completo" è l'unica in cui la colonna delle scelte non è
     una griglia di tessere ma il pannello dei numeri. Cambia il
     contenuto, non più l'impaginato (2026-08-21): la griglia ha una
     misura sola per tutte le fasi, e la scena non salta quando il
     dolce si completa */
  const completo = passo === 5;

  /* quando la fase cambia il focus raggiunge il titolo del passo:
     chi naviga da tastiera o con lo screen reader atterra
     sull'intestazione nuova, non su un controllo che non esiste più.
     preventScroll perché lo scroll, dove serve, è del controcampo.
     Il confronto col ref salta il primo render: al caricamento il
     focus non si ruba. */
  const titoloRef = useRef<HTMLHeadingElement | null>(null);
  const fase = `passo-${passo}`;
  const fasePrecedente = useRef(fase);
  useEffect(() => {
    if (fasePrecedente.current === fase) return;
    fasePrecedente.current = fase;
    titoloRef.current?.focus({ preventScroll: true });
  }, [fase]);

  const titoloSelettore =
    passo === 1
      ? testi.configuratore.titoli.passo1
      : passo === 2
        ? testi.configuratore.titoli.passo2
        : passo === 3
          ? testi.configuratore.titoli.passo3
          : passo === 4
            ? testi.configuratore.titoli.passo4
            : testi.configuratore.titoli.completo;

  return (
    <section
      data-livello={passo}
      data-completo={completo ? "true" : "false"}
      className="configuratore-playground relative isolate overflow-hidden"
    >
      <ScenografiaCandy />

      <div className="configurator-frame relative z-10 mx-auto">
        {/* chi naviga con lo screen reader deve sapere che il contenuto
            sotto è cambiato senza che la pagina sia stata ricaricata */}
        <p aria-live="polite" className="sr-only">
          {interpola(testi.configuratore.passoDi, {
            n: passo,
            titolo: titoloSelettore,
          })}
        </p>

        {avviso && (
          <p
            role="status"
            className="mb-10 rounded-[18px] border-2 border-inchiostro bg-carta px-5 py-4 text-[13px] font-semibold leading-relaxed shadow-[5px_6px_0_var(--oro)]"
          >
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
            />
          </div>

          <div className="configurator-stage mx-auto w-full min-w-0">
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

          <Selettore
            titolo={titoloSelettore}
            titoloRef={titoloRef}
          >
          {passo === 1 && (
            <PassoBase
              foto={foto}
              selezionata={null}
              onScegli={(id, v) => lanciaVerso(() => scegliBase(id), v)}
              drag={dragTessere}
            />
          )}

          {passo === 2 && (
            <PassoFarcitura
              fotoFarciture={fotoFarciture}
              selezionata={null}
              onScegli={(id, v) => lanciaVerso(() => scegliFarcitura(id), v)}
              drag={dragTessere}
            />
          )}

          {passo === 3 && (
            <PassoCredenza
              fotoCredenza={fotoCredenza}
              selezionata={null}
              onScegli={(id, v) => lanciaVerso(() => scegliCredenza(id), v)}
              drag={dragTessere}
            />
          )}

          {passo === 4 && (
            <PassoFinitura
              fotoFinitura={fotoFinitura}
              selezionata={null}
              onScegli={(id, v) => lanciaVerso(() => scegliFinitura(id), v)}
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
            />
          )}
          </Selettore>

          <BarraSalvataggio
            completo={completo}
            onCompleta={() => titoloRef.current?.focus({ preventScroll: true })}
          />
        </div>
      </div>

      {/* --- il clone in volo ------------------------------------------
          Renderizzato alla misura d'ARRIVO e riportato alla partenza
          con la trasformazione iniziale (x/y/scale): a fine corsa è
          nitido, e il ridimensionamento lo paga il tratto in movimento.
          La scelta si commette una volta sola: il guard sul contatore
          scarta sia il replay dell'evento all'exit sia i voli
          sorpassati da un tap più recente (commette solo l'ultimo). */}
      <AnimatePresence>
        {volo && (
          <motion.div
            key={volo.chiave}
            aria-hidden
            className="pointer-events-none fixed z-[80] @container"
            style={{
              left: volo.a.x,
              top: volo.a.y,
              width: volo.a.w,
              height: volo.a.h,
            }}
            initial={{
              x: volo.da.x + volo.da.w / 2 - (volo.a.x + volo.a.w / 2),
              y: volo.da.y + volo.da.h / 2 - (volo.a.y + volo.a.h / 2),
              scale: volo.da.w / volo.a.w,
            }}
            animate={{ x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.16 } }}
            transition={{ duration: 0.55, ease: [0.3, 0.85, 0.25, 1] }}
            onAnimationComplete={() => {
              if (volo.chiave !== contatoreVolo.current) return;
              if (voloCommesso.current === volo.chiave) return;
              voloCommesso.current = volo.chiave;
              volo.fine();
              setVolo(null);
            }}
          >
            {volo.foto ? (
              /* stessa inquadratura della tessera (contain + aria),
                 così alla partenza il clone ricalca l'originale */
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={volo.foto}
                alt=""
                draggable={false}
                className="h-full w-full object-contain p-3"
              />
            ) : (
              <SegnaPosto testo={volo.iniziale} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** Macro-forme e sticker del mondo Candy. Sono un fondale puro: il
 *  livello corrente cambia solo le variabili CSS della sezione, mentre
 *  questo markup resta stabile e non entra mai nell'albero accessibile. */
function ScenografiaCandy() {
  return (
    <div aria-hidden className="candy-scenografia pointer-events-none absolute inset-0 -z-10 overflow-hidden">
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

function BarraSalvataggio({
  completo,
  onCompleta,
}: {
  completo: boolean;
  onCompleta: () => void;
}) {
  const { testi } = useLingua();
  const [salvato, setSalvato] = useState(false);

  const salva = async () => {
    if (!completo) {
      onCompleta();
      return;
    }

    try {
      await navigator.clipboard.writeText(
        window.location.origin + window.location.pathname
      );
      setSalvato(true);
    } catch {
      window.location.hash = "salva-il-tuo-dolce";
    }
  };

  return (
    <div className="configurator-savebar" id="salva-il-tuo-dolce">
      <div>
        <strong>{testi.configuratore.salvataggio.haiIdea}</strong>
        <span>{testi.configuratore.salvataggio.condividi}</span>
      </div>
      <span aria-hidden className="configurator-savebar__heart">♥</span>
      <button type="button" onClick={salva}>
        {salvato
          ? testi.configuratore.salvataggio.copiato
          : testi.configuratore.salvataggio.salva}
        <span aria-hidden>★</span>
      </button>
      <span aria-hidden className="configurator-savebar__smile">
        <i />
        <i />
        <b />
      </span>
      <span aria-live="polite" className="sr-only">
        {salvato ? testi.configuratore.salvataggio.copiatoAria : ""}
      </span>
    </div>
  );
}

/** True quando il dispositivo ha hover e puntatore fine (mouse/trackpad):
 *  l'unico contesto in cui il drag non compete con lo scroll. La media
 *  query è un sistema esterno: useSyncExternalStore, con snapshot server
 *  false — le tessere diventano trascinabili solo dopo l'idratazione, ed
 *  è voluto. Prefisso "use" inglese: lo esige la convenzione dei hook. */
const QUERY_PUNTATORE = "(hover: hover) and (pointer: fine)";
function usePuntatoreFine(): boolean {
  return useSyncExternalStore(
    (avvisa) => {
      const mq = window.matchMedia(QUERY_PUNTATORE);
      mq.addEventListener("change", avvisa);
      return () => mq.removeEventListener("change", avvisa);
    },
    () => window.matchMedia(QUERY_PUNTATORE).matches,
    () => false
  );
}
