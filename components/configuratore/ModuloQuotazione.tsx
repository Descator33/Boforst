"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  richiediQuotazione,
  type StatoInvio,
} from "@/app/configuratore/actions";
import { useLingua } from "@/components/LinguaProvider";
import { DATASET, type Prodotto } from "@/lib/configuratore";
import { conta } from "@/lib/i18n/interpola";
import { fmtKg } from "@/lib/i18n/lingue";
const INPUT =
  "w-full rounded-2xl border border-linea bg-carta px-4 py-3 text-base outline-none focus:border-corallo-scena focus:ring-2 focus:ring-corallo-scena/25";
const CANALI = ["bar", "pasticceria", "catering", "GDO"] as const;
export type DatiCliente = {
  ragione_sociale: string;
  canale: string;
  email: string;
  telefono: string;
  note: string;
};
export function ModuloQuotazione({
  prodotto,
  pedane,
  onPendingChange,
  invioAttivo,
  cliente,
  onClienteChange,
}: {
  prodotto: Prodotto;
  pedane: number | "";
  invioAttivo: boolean;
  cliente: DatiCliente;
  onClienteChange: (cliente: DatiCliente) => void;
  onPendingChange?: (pending: boolean) => void;
}) {
  const { lingua, testi } = useLingua();
  const t = testi.configuratore.modulo,
    ui = testi.configuratore.esperienza;
  const firma = JSON.stringify({ sku: prodotto.sku, pedane, cliente });
  const requestId = useRef("");
  const form = useRef<HTMLFormElement>(null);
  const [visibile, setVisibile] = useState(true);
  const [stato, invia, pending] = useActionState<
    { risultato: StatoInvio; firma: string } | null,
    FormData
  >(async (prev, data) => {
    requestId.current ||= crypto.randomUUID();
    data.set("request_id", requestId.current);
    let esito: StatoInvio;
    try {
      esito = await richiediQuotazione(prev?.risultato ?? null, data);
    } catch {
      esito = {
        ok: false,
        errore: "INVIO_FALLITO",
        messaggio: ui.invioFallito,
      };
    }
    if (esito?.ok) setVisibile(false);
    return { risultato: esito, firma };
  }, null);
  useEffect(() => {
    onPendingChange?.(pending);
    return () => onPendingChange?.(false);
  }, [pending, onPendingChange]);
  const attuale = stato?.firma === firma ? stato.risultato : null;
  const riuscita = attuale?.ok;
  function cambia(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    onClienteChange({ ...cliente, [e.target.name]: e.target.value });
    setVisibile(true);
  }
  return (
    <div className="rounded-[28px] border-2 border-inchiostro bg-crema p-7 md:p-9">
      <form ref={form} action={invia} hidden={!!riuscita && !visibile}>
        <h3 className="text-2xl font-extrabold">{t.titolo}</h3>
        {!invioAttivo && (
          <p className="mt-4 text-sm leading-relaxed">{ui.invioAssente}</p>
        )}
        {(["base", "farcitura", "credenza", "finitura"] as const).map((k) => (
          <input key={k} type="hidden" name={k} value={prodotto[k]} />
        ))}
        <input type="hidden" name="pedane" value={pedane} />
        <input type="hidden" name="versione_listino" value={DATASET.versione} />
        <input type="hidden" name="lingua" value={lingua} />
        <div hidden aria-hidden>
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <fieldset disabled={pending} className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <label htmlFor="ragione_sociale">{t.ragioneSociale}</label>
            <input
              id="ragione_sociale"
              name="ragione_sociale"
              value={cliente.ragione_sociale}
              onChange={cambia}
              required
              maxLength={160}
              autoComplete="organization"
              className={INPUT}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="canale">{t.canale}</label>
            <select
              id="canale"
              name="canale"
              value={cliente.canale}
              onChange={cambia}
              required
              className={INPUT}
            >
              <option value="" disabled>
                {t.canalePh}
              </option>
              {CANALI.map((c) => (
                <option key={c} value={c}>
                  {t.canali[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="email">{t.email}</label>
            <input
              id="email"
              name="email"
              type="email"
              value={cliente.email}
              onChange={cambia}
              required
              maxLength={254}
              autoComplete="email"
              className={INPUT}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="telefono">
              {t.telefono} {t.facoltativo}
            </label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              value={cliente.telefono}
              onChange={cambia}
              maxLength={40}
              autoComplete="tel"
              className={INPUT}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <label htmlFor="note">
              {t.note} {t.facoltativo}
            </label>
            <textarea
              id="note"
              name="note"
              value={cliente.note}
              onChange={cambia}
              maxLength={2000}
              rows={3}
              className={INPUT}
            />
          </div>
        </fieldset>
        {attuale && !attuale.ok && (
          <div role="alert" className="configurator-notice">
            <p>{attuale.messaggio}</p>
            {attuale.mailto && (
              <a className="underline" href={attuale.mailto}>
                {ui.emailApp}
              </a>
            )}
          </div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="configurator-action mt-6"
        >
          {pending ? ui.invioInCorso : invioAttivo ? ui.invia : t.verifica}
        </button>
      </form>
      {riuscita && !visibile && (
        <div role="status">
          <h3 className="text-2xl font-extrabold">
            {attuale.inviata ? ui.inviato : t.prontaTitolo}
          </h3>
          <p className="mt-4">
            {attuale.inviata ? ui.inviatoTesto : ui.invioAssente}
          </p>
          <p className="mt-3 font-mono text-sm">
            {conta(
              testi.configuratore.scala.pedane,
              attuale.quantita.pedane,
              lingua,
            )}{" "}
            · {fmtKg(attuale.quantita.peso_kg, lingua)}
          </p>
          {!attuale.inviata && (
            <a
              className="configurator-action mt-6 inline-block"
              href={attuale.mailto}
            >
              {ui.emailApp}
            </a>
          )}
          <button
            type="button"
            className="mt-5 block underline"
            onClick={() => {
              setVisibile(true);
              requestAnimationFrame(() =>
                form.current
                  ?.querySelector<HTMLInputElement>("#ragione_sociale")
                  ?.focus(),
              );
            }}
          >
            {ui.datiCliente}
          </button>
        </div>
      )}
    </div>
  );
}
