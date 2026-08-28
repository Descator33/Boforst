"use client";

import { useActionState } from "react";
import { richiediQuotazione, type StatoInvio } from "@/app/configuratore/actions";
import { useLingua } from "@/components/LinguaProvider";
import { DATASET, type Combinazione } from "@/lib/configuratore";
import { conta, interpola } from "@/lib/i18n/interpola";
import { fmtKg } from "@/lib/i18n/lingue";

const INPUT_CLS =
  "w-full rounded-2xl border border-linea bg-carta px-4 py-3 text-base text-inchiostro outline-none transition-colors placeholder:text-inchiostro/40 focus:border-corallo-scena focus:ring-2 focus:ring-corallo-scena/25";

/** L'unico campo di profilazione che vale la pena chiedere: permette al
 *  commerciale di rispondere con il listino giusto. */
const CANALI = ["bar", "pasticceria", "catering", "GDO"] as const;

/**
 * Il modulo di chiusura: dati del cliente + invio alla Server Action, che
 * riesegue la validazione con lo stesso dataset (validaStato + versione
 * di listino) e compone la richiesta. `useActionState` dà pending ed
 * errori tipizzati senza stato scritto a mano.
 */
export function ModuloQuotazione({
  comb,
  pedane,
}: {
  comb: Combinazione;
  pedane: number | "";
}) {
  const { lingua, testi: tuttiTesti } = useLingua();
  const testi = tuttiTesti.configuratore;
  const modulo = testi.modulo;
  const [stato, invia, pending] = useActionState<StatoInvio, FormData>(
    richiediQuotazione,
    null
  );

  if (stato?.ok) {
    return (
      <div className="rounded-[28px] border-2 border-inchiostro bg-crema p-7 md:p-9">
        <h3 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] font-extrabold leading-[0.95] tracking-[-0.03em]">
          {modulo.prontaTitolo}<span className="text-corallo-scena">.</span>
        </h3>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-inchiostro/70">
          {interpola(modulo.prontaTesto, {
            versione: DATASET.versione,
            pedane: conta(testi.scala.pedane, stato.quantita.pedane, lingua),
            cartoni: conta(testi.scala.cartoni, stato.quantita.cartoni, lingua),
            pezzi: conta(testi.scala.pezzi, stato.quantita.pezzi, lingua),
            peso: fmtKg(stato.quantita.peso_kg, lingua),
          })}
        </p>
        <a
          href={stato.mailto}
          className="ombra-pop-piccola mt-8 inline-block rounded-full bg-inchiostro px-8 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-panna transition-colors hover:bg-corallo-scena focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-corallo-scena"
        >
          {modulo.inviaRichiesta}
        </a>
      </div>
    );
  }

  return (
    <form action={invia} className="rounded-[28px] border-2 border-inchiostro bg-crema p-7 md:p-9">
      <h3 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] font-extrabold leading-[0.95] tracking-[-0.03em]">
        {modulo.titolo}<span className="text-corallo-scena">.</span>
      </h3>

      {/* lo stato prodotto viaggia con il form e viene rivalidato server-side */}
      <input type="hidden" name="base" value={comb.base} />
      <input type="hidden" name="farcitura" value={comb.farcitura} />
      <input type="hidden" name="pedane" value={pedane} />
      <input type="hidden" name="versione_listino" value={DATASET.versione} />
      <input type="hidden" name="lingua" value={lingua} />

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="ragione_sociale" className="text-sm font-semibold">
            {modulo.ragioneSociale}
          </label>
          <input
            id="ragione_sociale"
            name="ragione_sociale"
            type="text"
            required
            autoComplete="organization"
            placeholder={modulo.ragioneSocialePh}
            className={INPUT_CLS}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="canale" className="text-sm font-semibold">
            {modulo.canale}
          </label>
          <select id="canale" name="canale" required defaultValue="" className={INPUT_CLS}>
            <option value="" disabled>
              {modulo.canalePh}
            </option>
            {CANALI.map((c) => (
              <option key={c} value={c}>
                {modulo.canali[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-semibold">
            {modulo.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={modulo.emailPh}
            className={INPUT_CLS}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="telefono" className="text-sm font-semibold">
            {modulo.telefono}{" "}
            <span className="font-normal text-inchiostro/45">{modulo.facoltativo}</span>
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            placeholder={modulo.telefonoPh}
            className={INPUT_CLS}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-2">
        <label htmlFor="note" className="text-sm font-semibold">
          {modulo.note}{" "}
          <span className="font-normal text-inchiostro/45">{modulo.facoltativo}</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          placeholder={modulo.notePh}
          className={`${INPUT_CLS} resize-y`}
        />
      </div>

      {stato && !stato.ok && (
        <div
          role="alert"
          className="mt-6 rounded-[18px] border border-linea border-l-[4px] border-l-corallo-scena bg-carta px-5 py-4 text-[13px] leading-relaxed"
        >
          <p>{stato.messaggio}</p>
          {stato.errore === "SOTTO_ORDINE_MINIMO" && (
            <p className="mt-1">
              {modulo.alzaOppure}{" "}
              <a
                href="mailto:info@delsigel.it?subject=Quantitativo%20sotto%20il%20minimo"
                className="font-semibold underline decoration-2 underline-offset-2 hover:text-corallo-scena"
              >
                {modulo.scriviCommerciale}
              </a>{" "}
              {modulo.surMisura}
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="ombra-pop-piccola mt-8 rounded-full bg-inchiostro px-8 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.12em] text-panna transition-colors hover:bg-corallo-scena focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-corallo-scena disabled:opacity-50"
      >
        {pending ? modulo.verificaInCorso : modulo.verifica}
      </button>
    </form>
  );
}
