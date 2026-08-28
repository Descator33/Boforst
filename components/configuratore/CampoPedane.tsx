"use client";

import {
  quantita,
  type Base,
  type Combinazione,
} from "@/lib/configuratore";
import { useLingua } from "@/components/LinguaProvider";
import { conta, interpola } from "@/lib/i18n/interpola";
import { fmtKg, fmtNumero } from "@/lib/i18n/lingue";

const INPUT_CLS =
  "w-24 rounded-2xl border border-linea bg-carta px-4 py-3 text-center font-mono text-lg font-bold text-inchiostro outline-none transition-colors focus:border-corallo-scena focus:ring-2 focus:ring-corallo-scena/25";

/**
 * L'unica decisione del passo 3: quante pedane. Il minimo si dichiara
 * PRIMA, in quantità e non in divieto, legato al campo con
 * aria-describedby; la traduzione in cartoni, pezzi e chilogrammi si
 * aggiorna in tempo reale in una regione live cortese — è il modo in cui
 * un buyer verifica l'ordine di grandezza prima di premere invio.
 *
 * Sotto il minimo il messaggio propone la correzione invece di negare, e
 * resta non bloccante fino all'invio: la validazione che conta sta in
 * validaStato, rieseguita nella Server Action.
 */
export function CampoPedane({
  base,
  comb,
  pedane,
  onCambia,
}: {
  base: Base;
  comb: Combinazione;
  pedane: number | "";
  onCambia: (v: number | "") => void;
}) {
  const { lingua, testi: tuttiTesti } = useLingua();
  const testi = tuttiTesti.configuratore;
  const minimo = comb.ordine_minimo_pedane;
  const valida = typeof pedane === "number" && Number.isInteger(pedane) && pedane >= 1;
  const q = valida ? quantita(comb.base, comb.farcitura, pedane) : null;
  const sottoMinimo = valida && minimo != null && pedane < minimo;

  return (
    <div>
      <h3 className="type-label text-inchiostro/45">{testi.quantita.titolo}</h3>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label htmlFor="pedane" className="text-sm font-semibold">
          {testi.quantita.pedane}
        </label>
        <input
          id="pedane"
          name="pedane-visibile"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={pedane}
          onChange={(e) => {
            const v = e.target.value;
            onCambia(v === "" ? "" : Math.floor(Number(v)));
          }}
          aria-describedby={minimo != null ? "vincolo-minimo" : undefined}
          className={INPUT_CLS}
        />
        {/* traduzione live lungo la catena logistica, dalla stessa
            funzione quantita() che comporrà il payload */}
        <p aria-live="polite" className="font-mono text-[13px] text-inchiostro/75">
          {q
            ? interpola(testi.quantita.equivale, {
                cartoni: conta(testi.scala.cartoni, q.cartoni, lingua),
                pezzi: conta(testi.scala.pezzi, q.pezzi, lingua),
                peso: fmtKg(q.peso_kg, lingua),
              })
            : testi.quantita.indicaIntero}
        </p>
      </div>

      {minimo != null && (
        <p id="vincolo-minimo" className="mt-3 text-[13px] text-inchiostro/65">
          <strong>
            {interpola(testi.quantita.minimoDichiarato, {
              min: fmtNumero(minimo, lingua),
            })}
          </strong>
          {comb.ordine_minimo_pezzi != null &&
            interpola(testi.quantita.minimoPezzi, {
              pezzi: fmtNumero(comb.ordine_minimo_pezzi, lingua),
            })}
          .
        </p>
      )}

      {sottoMinimo && minimo != null && (
        <div
          role="status"
          className="mt-4 rounded-[18px] border border-linea border-l-[4px] border-l-oro bg-carta px-5 py-4 text-[13px] leading-relaxed"
        >
          <p>
            {interpola(testi.quantita.sottoMinimo, {
              pedane: conta(testi.scala.pedane, pedane, lingua),
              min: fmtNumero(minimo, lingua),
            })}{" "}
            <button
              type="button"
              onClick={() => onCambia(minimo)}
              className="font-semibold underline decoration-2 underline-offset-2 transition-colors hover:text-corallo-scena focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corallo-scena"
            >
              {interpola(testi.quantita.portaA, {
                min: fmtNumero(minimo, lingua),
              })}
            </button>{" "}
            {testi.quantita.oppureScrivi}{" "}
            <a
              href={`mailto:info@delsigel.it?subject=${encodeURIComponent(
                interpola(testi.quantita.mailOggetto, { base: base.nome })
              )}&body=${encodeURIComponent(
                interpola(testi.quantita.mailCorpo, {
                  base: base.nome,
                  sku: comb.sku,
                  min: fmtNumero(minimo, lingua),
                })
              )}`}
              className="font-semibold underline decoration-2 underline-offset-2 transition-colors hover:text-corallo-scena focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corallo-scena"
            >
              {testi.quantita.scriviCommerciale}
            </a>
            {testi.quantita.contattoValeDiPiu}
          </p>
        </div>
      )}
    </div>
  );
}
