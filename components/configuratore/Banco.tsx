"use client";

import type { Ref } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type Base,
  type Credenza,
  type Farcitura,
  type FotoStati,
  type Prodotto,
} from "@/lib/configuratore";
import { useLingua } from "@/components/LinguaProvider";
import { interpola } from "@/lib/i18n/interpola";
import { minuscola } from "@/lib/i18n/lingue";
import type { IdFarcitura } from "@/lib/i18n/tipi";
import {
  Asterisco,
  FrecciaGiu,
  FrecciaRicomincia,
  IconaMano,
  Scintilla,
  Smile,
} from "./Decori";
import { ImmagineProdotto } from "./ImmagineProdotto";

/**
 * Il palco del pasticcere: la vetrina su cui il dolce si compone, e il
 * bersaglio del drag & drop. Il ref esposto serve al Configuratore per
 * il hit-test del rilascio; `sopra` accende tutta la scena attraverso
 * l'unico data-attribute `data-sopra` (stili in «Configuratore: il
 * palco» di globals.css) — cornice, ombra a terra e scintille
 * rispondono da soli, senza che una prop scenda fino alle foglie e
 * senza far ridisegnare la griglia dei prodotti a ogni pixel di drag.
 *
 * Geometria: tutto in percentuale del palco. Il dolce poggia
 * direttamente sul palco, sopra una macchia d'ombra che fa da piano —
 * il bordo inferiore della foto (object-bottom) cade sul centro
 * dell'ombra: le due quote (bottom del prodotto, centro verticale
 * dell'ombra) devono restare uguali, oggi 17%.
 *
 * Dal refactor 2026-08-28 il dolce è COMPLETO quando i 4 componenti
 * sono tutti nell'URL (`prodotto` non è null): non c'è più un gesto di
 * "applicazione" separato, lo stesso pushState che sceglie la finitura
 * completa il prodotto. Al completamento il dolce FESTEGGIA — un
 * guizzo sul posto mentre cade la spolverata, poi un respiro lento che
 * tiene viva la scena — e in testa al palco arrivano le CTA «Cambia
 * farcitura» e «Ricomincia». Le foto vengono dalle cartelle di stato
 * (prop `foto`, scoperta dal server): a ogni fase la sua — base →
 * +farcitura → +credenza → completo — e dove la foto non è ancora
 * arrivata si ripiega sullo stato precedente, che è onesto perché
 * mostra sempre MENO del configurato, mai un'altra scelta.
 */
export const ZONA_DOLCE = { left: 0.23, bottom: 0.17, width: 0.54, height: 0.5 };

const stileZonaDolce = {
  left: `${ZONA_DOLCE.left * 100}%`,
  bottom: `${ZONA_DOLCE.bottom * 100}%`,
  width: `${ZONA_DOLCE.width * 100}%`,
  height: `${ZONA_DOLCE.height * 100}%`,
};

export function Banco({
  base,
  farcitura,
  credenza,
  prodotto,
  foto,
  sopra,
  passo,
  apriPasso,
  onRicomincia,
  ref,
}: {
  base: Base | null;
  farcitura: Farcitura | null;
  credenza: Credenza | null;
  prodotto: Prodotto | null;
  /** stato → URL foto dalle cartelle di public/img/configuratore/prodotti */
  foto: FotoStati;
  /** una tessera in trascinamento è sopra il palco */
  sopra: boolean;
  passo: 1 | 2 | 3 | 4 | 5;
  apriPasso: (passo: 1 | 2 | 3 | 4) => void;
  onRicomincia: () => void;
  ref?: Ref<HTMLDivElement>;
}) {
  const riduci = useReducedMotion();
  const { lingua, testi } = useLingua();
  const banco = testi.configuratore.banco;
  const farciturasNome = farcitura
    ? (testi.prodotti.farciture[farcitura.id as IdFarcitura] ?? farcitura.nome)
    : null;
  const completato = Boolean(prodotto);
  const vuoto = !base;

  /* le quattro cartelle di stato del prodotto corrente, dalla più alla
     meno specifica */
  const fotoCompleta = prodotto ? foto[prodotto.sku] : undefined;
  const fotoConCredenza =
    base && farcitura && credenza
      ? foto[`${base.id}--${farcitura.id}--${credenza.id}`]
      : undefined;
  const fotoFarcito = base && farcitura ? foto[`${base.id}--${farcitura.id}`] : undefined;
  const fotoBase = base ? foto[base.id] : undefined;

  /* la chiave governa il crossfade: cambia quando cambia ciò che si
     vede — sempre al completamento (spolverata compresa), e a ogni
     passo intermedio solo se la foto di quella profondità esiste
     davvero (senza, resterebbe la foto precedente: niente ricaduta a
     vuoto) */
  const chiave = completato
    ? `${prodotto!.sku}--finito`
    : credenza && fotoConCredenza
      ? `${base!.id}--${farcitura!.id}--${credenza.id}`
      : farcitura && fotoFarcito
        ? `${base!.id}--${farcitura.id}`
        : (base?.id ?? "vuoto");

  /* finché il dolce non è completo c'è sempre qualcosa da trascinare */
  const dropAttivo = !completato;

  const umoreMascotte = completato
    ? "festa"
      : sopra
      ? "wow"
      : base
        ? "felice"
        : "felice";

  /* niente frasi incastrate nel codice: ogni passo ha le sue, intere,
     nel dizionario — il finlandese declina l'oggetto, il tedesco lo
     tiene maiuscolo, e nessuna delle due cose si può comporre */
  const manca =
    passo === 1
      ? banco.mancaPasso1
      : passo === 2
        ? banco.mancaPasso2
        : passo === 3
          ? banco.mancaPasso3
          : banco.mancaPasso4;

  const nomeInScena = base
    ? farcitura
      ? `${base.nome} · ${minuscola(farciturasNome!, lingua)}`
      : base.nome
    : "";

  const immagineDolce = base && (
    <ImmagineProdotto
      sorgenti={
        completato
          ? [fotoCompleta, fotoConCredenza, fotoFarcito, fotoBase]
          : credenza
            ? [fotoConCredenza, fotoFarcito, fotoBase]
            : farcitura
              ? [fotoFarcito, fotoBase]
              : [fotoBase]
      }
      alt={[base.nome, farciturasNome, credenza ? testi.prodotti.credenza[credenza.id as keyof typeof testi.prodotti.credenza] : null, prodotto ? testi.prodotti.finiture[prodotto.finitura as keyof typeof testi.prodotti.finiture] : null].filter(Boolean).join(" · ")}
      iniziale={base.nome.charAt(0)}
      prioritaria
      notaRipiego={completato ? banco.fotoSenzaFinitura : undefined}
      classe="absolute inset-0 h-full w-full object-contain object-bottom"
    />
  );

  return (
    <motion.div
      ref={ref}
      role="region"
      aria-label={
        vuoto
          ? banco.ariaVuoto
          : interpola(banco.ariaConDolce, {
              nome: nomeInScena,
              stato: dropAttivo ? manca : banco.completoAria,
            })
      }
      data-sopra={dropAttivo && sopra ? "true" : "false"}
      data-fase={vuoto ? "vuoto" : completato ? "completo" : `passo-${passo}`}
      className="palco w-full"
      animate={
        riduci ? undefined : dropAttivo && sopra ? { scale: 1.012, y: -4 } : { scale: 1, y: 0 }
      }
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
    >
      <span aria-hidden className="candy-ribbon">Drag &amp; Drop</span>

      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Smile
          umore={umoreMascotte}
          className="mascotte-candy absolute -right-[1.5%] top-[1.5%] w-[14%] min-w-[68px]"
        />
        <Asterisco className="absolute -bottom-[6%] left-[70%] w-[9%] min-w-[48px] text-oro" />
        <span className="palco-amico">
          <i />
          <i />
          <b />
        </span>
        <span className="palco-lecca" />

        {/* queste tre esistono solo durante il sorvolo */}
        <Scintilla className="scintilla-drag absolute left-[30%] top-[36%] w-[3%] min-w-[13px] text-oro" />
        <Scintilla className="scintilla-drag absolute right-[31%] top-[43%] w-[3.4%] min-w-[15px] text-oro" />
        <Scintilla className="scintilla-drag absolute left-[44%] top-[12%] w-[2.6%] min-w-[12px] text-corallo-scena" />
      </div>

      {dropAttivo && vuoto && (
        <>
          <div
            aria-hidden
            className="palco-invito pointer-events-none absolute inset-x-0 top-[49%] flex -translate-y-[calc(100%+12px)] flex-col items-center gap-1 px-[12%] text-center"
          >
            <span
              className={`drop-copy leading-tight transition-colors duration-200 ${
                sopra ? "text-fucsia" : "text-viola"
              }`}
            >
              {sopra ? (
                <strong>{banco.mollaQui}</strong>
              ) : (
                <>
                  <span className="invito-mouse">
                    {banco.trascinaVuoto[0]}
                    <strong>{banco.trascinaVuoto[1]}</strong>
                  </span>
                  <span className="invito-touch">
                    {banco.toccaVuoto[0]}
                    <strong>{banco.toccaVuoto[1]}</strong>
                  </span>
                </>
              )}
            </span>
            {!sopra && (
              <span className="sr-only">
                <IconaMano className="h-3.5 w-3.5" />
                {banco.oppureLista}
              </span>
            )}
          </div>

          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[51%] block w-[6%] min-w-[32px] -translate-x-1/2 text-viola"
            animate={riduci || sopra ? { y: 0 } : { y: [0, 5, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <FrecciaGiu className="w-full" />
          </motion.span>
        </>
      )}

      {dropAttivo && !vuoto && !sopra && (
        <div aria-hidden className="candy-tray-task pointer-events-none absolute inset-x-[9%] top-[7%] text-center">
          <span className="invito-mouse">
            {passo === 2 ? banco.trascinaPasso2 : passo === 3 ? banco.trascinaPasso3 : banco.trascinaPasso4}
          </span>
          <span className="invito-touch">
            {passo === 2 ? banco.toccaPasso2 : passo === 3 ? banco.toccaPasso3 : banco.toccaPasso4}
          </span>
        </div>
      )}

      <div
        aria-hidden
        className="palco-ombra absolute inset-x-0 bottom-[15%] mx-auto h-[4%] w-[46%]"
      />

      <AnimatePresence>
        {dropAttivo && sopra && (
          <motion.span
            aria-hidden
            className="candy-drop-badge pointer-events-none absolute left-1/2 top-[9%] z-20 -translate-x-1/2"
            initial={riduci ? { opacity: 0 } : { opacity: 0, scale: 0.55, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 430, damping: 21 }}
          >
            Drop!
          </motion.span>
        )}
      </AnimatePresence>

      <AnimatePresence mode="sync">
        {base && (
          <motion.div
            key={chiave}
            className="palco-prodotto absolute"
            style={stileZonaDolce}
            initial={riduci ? { opacity: 0 } : { y: -26, scale: 0.92, opacity: 0 }}
            animate={
              riduci
                ? { opacity: 1 }
                : { y: sopra && dropAttivo ? -10 : 0, scale: 1, opacity: 1 }
            }
            exit={{ opacity: 0, y: 8, scale: 0.95, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            {completato && !riduci ? (
              <motion.div
                className="absolute inset-0"
                animate={{ y: [0, -5, 0] }}
                transition={{
                  delay: 1.7,
                  duration: 3.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ originY: 1 }}
                  animate={{
                    rotate: [0, -3, 2.6, -1.6, 1, 0],
                    scale: [1, 1.07, 0.96, 1.03, 0.99, 1],
                  }}
                  transition={{ delay: 0.35, duration: 1.05, ease: "easeInOut" }}
                >
                  {immagineDolce}
                </motion.div>
              </motion.div>
            ) : (
              immagineDolce
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {completato && !riduci && (
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={stileZonaDolce}
        >
          <Spolverata key={prodotto!.sku} />
        </div>
      )}

      {completato && (
        <div className="pointer-events-none absolute inset-x-0 top-[4.5%] z-10 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 px-[6%]">
          {(
            [
              {
                testo: banco.cambiaFarcitura,
                ricomincia: false,
                azione: () => apriPasso(2),
                ritardo: 0.1,
              },
              {
                testo: banco.ricomincia,
                ricomincia: true,
                azione: onRicomincia,
                ritardo: 0.15,
              },
            ] as const
          ).map((cta) => (
            <motion.div
              key={cta.testo}
              initial={riduci ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.6 }}
              animate={riduci ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              transition={
                riduci
                  ? { duration: 0.25 }
                  : { type: "spring", stiffness: 400, damping: 22, delay: cta.ritardo }
              }
            >
              <button
                type="button"
                onClick={cta.azione}
                className="ombra-pop-piccola pointer-events-auto inline-flex items-center gap-2 rounded-full bg-inchiostro px-5 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-panna transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-corallo-scena motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                {cta.ricomincia && (
                  <FrecciaRicomincia className="h-[14px] w-[14px] text-oro" />
                )}
                {cta.testo}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* --- la pillola di stato --------------------------------------
          A dolce completo le azioni salgono nelle CTA in testa al
          palco: qui resta la targhetta col nome. A configurazione in
          corso resta solo «Ricomincia»: il ritorno a un passo preciso
          è già coperto dal Riepilogo sopra, che sa dire "torna al passo
          N" senza ambiguità su quale sia il passo precedente. */}
      {!vuoto && (
        <div className="absolute inset-x-0 bottom-[5%] flex justify-center px-[8%]">
          <div className="flex max-w-full flex-wrap items-center justify-center gap-x-2.5 gap-y-1 rounded-full border border-linea bg-carta px-4 py-2.5 shadow-[0_2px_10px_rgba(107,60,30,0.06)] sm:px-5">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-corallo-scena" />
            <span className="text-[12px] font-bold text-inchiostro sm:text-[13px]">
              {nomeInScena}
            </span>
            {!completato && (
              <>
                <span aria-hidden className="text-inchiostro/25">
                  ·
                </span>
                <button
                  type="button"
                  onClick={onRicomincia}
                  className="rounded-full text-[12px] text-inchiostro/60 underline decoration-inchiostro/25 underline-offset-2 transition-colors hover:text-corallo-scena focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corallo-scena"
                >
                  {banco.ricomincia}
                </button>
              </>
            )}
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-corallo-scena" />
          </div>
        </div>
      )}
    </motion.div>
  );
}

/** La spolverata della finitura: quattordici grani che cadono sul
 *  dolce, sfalsati e di misura diversa, uno dorato ogni cinque. Tutto
 *  derivato dall'indice: la scena è identica a ogni replay. */
function Spolverata() {
  const grani = Array.from({ length: 14 }, (_, i) => ({
    sx: 16 + ((i * 47) % 68),
    ritardo: (i % 7) * 0.055,
    durata: 0.7 + (i % 4) * 0.09,
    misura: 3 + (i % 3),
    oro: i % 5 === 0,
  }));
  return (
    <div className="absolute inset-0">
      {grani.map((g, i) => (
        <motion.span
          key={i}
          className={`absolute rounded-full ${g.oro ? "bg-oro" : "bg-white"}`}
          style={{ left: `${g.sx}%`, width: g.misura, height: g.misura }}
          initial={{ top: "4%", opacity: 0 }}
          animate={{ top: "62%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: g.durata, delay: 0.15 + g.ritardo, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
