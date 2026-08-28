"use client";

import { type Base, type Combinazione } from "@/lib/configuratore";
import { useLingua } from "@/components/LinguaProvider";
import { conta, interpola } from "@/lib/i18n/interpola";
import { fmtKg } from "@/lib/i18n/lingue";

/**
 * La catena logistica tradotta in una scala leggibile, dal pezzo alla
 * pedana, con i pesi calcolati sulla grammatura di quella farcitura.
 * Nessuna grafica: 3 o 4 righe in monospaziato, il carattere che tutto il
 * sito usa per i dati tecnici. Dove il vassoio non esiste (Intriko Midi,
 * Lussekatt, Klejner) la scala ha tre righe e non si inventa nulla.
 *
 * Ogni quantità passa da `conta`: il plurale è un testo intero del
 * dizionario, mai un suffisso — il finlandese conta col partitivo.
 */
export function ScalaFormato({
  base,
  comb,
}: {
  base: Base;
  comb: Combinazione;
}) {
  const { lingua, testi } = useLingua();
  const scala = testi.configuratore.scala;
  const p = base.packaging;

  const righe: [string, string][] = [];

  if (p.vassoi_per_cartone != null && p.pezzi_per_vassoio != null) {
    righe.push([scala.vassoio, conta(scala.pezzi, p.pezzi_per_vassoio, lingua)]);
  }

  righe.push([
    scala.cartone,
    [
      p.vassoi_per_cartone != null
        ? conta(scala.vassoi, p.vassoi_per_cartone, lingua)
        : null,
      conta(scala.pezzi, p.pezzi_per_cartone, lingua),
      fmtKg(comb.peso_cartone_kg, lingua),
    ]
      .filter(Boolean)
      .join(" · "),
  ]);

  righe.push([
    scala.pedana,
    [
      conta(scala.cartoni, p.cartoni_per_pedana, lingua) +
        (p.strati_per_pedana != null && p.cartoni_per_strato != null
          ? ` ${interpola(scala.suStrati, {
              strati: p.strati_per_pedana,
              perStrato: p.cartoni_per_strato,
            })}`
          : ""),
      conta(scala.pezzi, p.pezzi_per_pedana, lingua),
      fmtKg(comb.peso_pedana_kg, lingua),
    ].join(" · "),
  ]);

  return (
    <div>
      <h3 className="type-label text-inchiostro/45">{scala.titolo}</h3>
      <dl className="mt-3 border-t border-linea font-mono text-[13px] leading-relaxed">
        {righe.map(([unita, dettaglio]) => (
          <div
            key={unita}
            className="grid grid-cols-[90px_1fr] gap-4 border-b border-linea py-2.5"
          >
            <dt className="font-bold">{unita}</dt>
            <dd className="text-inchiostro/75">{dettaglio}</dd>
          </div>
        ))}
      </dl>
      {p.cartone_dichiarato_a_peso && p.peso_cartone_kg != null && (
        <p className="mt-2 text-[13px] text-inchiostro/55">
          {interpola(scala.cartoneAPeso, {
            peso: fmtKg(p.peso_cartone_kg, lingua),
          })}
        </p>
      )}
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-inchiostro/35">
        {interpola(scala.dalListino, { testo: p.testo_originale })}
      </p>
    </div>
  );
}
