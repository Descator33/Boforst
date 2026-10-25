"use server";

/** Valida la richiesta e la consegna a Resend. Mailto come ripiego esplicito. */

import { consegnaQuotazione } from "@/lib/quotazioni/consegna";
import { BASE_SITO } from "@/lib/i18n/sito";
import { headers } from "next/headers";
import {
  DATASET,
  baseDi,
  prodotto,
  validaStato,
  type Quantita,
} from "@/lib/configuratore";
import { dizionario } from "@/lib/i18n/dizionario";
import { conta, interpola } from "@/lib/i18n/interpola";
import {
  LINGUA_PREDEFINITA,
  fmtKg,
  fmtNumero,
  haLingua,
  localizza,
} from "@/lib/i18n/lingue";
import type { IdCredenza, IdFarcitura, IdFinitura } from "@/lib/i18n/tipi";

const DESTINATARIO = "info@delsigel.it";

export type StatoInvio =
  | null
  | {
      ok: false;
      errore:
        | "CAMPI_MANCANTI"
        | "CAMPI_NON_VALIDI"
        | "INVIO_FALLITO"
        | "COMBINAZIONE_INESISTENTE"
        | "QUANTITA_NON_VALIDA"
        | "SOTTO_ORDINE_MINIMO"
        | "VERSIONE_OBSOLETA";
      messaggio: string;
      mailto?: string;
      minimoPedane?: number;
      minimoPezzi?: number | null;
    }
  | {
      ok: true;
      inviata: boolean;
      id?: string;
      sku: string;
      quantita: Quantita;
      mailto: string;
    };

export async function richiediQuotazione(
  _prev: StatoInvio,
  formData: FormData,
): Promise<StatoInvio> {
  const testo = (campo: string) => String(formData.get(campo) ?? "").trim();
  const linguaRichiesta = testo("lingua");
  const lingua = haLingua(linguaRichiesta)
    ? linguaRichiesta
    : LINGUA_PREDEFINITA;
  const testi = dizionario(lingua);
  const modulo = testi.configuratore.modulo;

  const base = testo("base");
  const farcitura = testo("farcitura");
  const credenza = testo("credenza");
  const finitura = testo("finitura");
  const pedane = Number(testo("pedane"));
  const versione = testo("versione_listino");
  const cliente = {
    ragione_sociale: testo("ragione_sociale"),
    canale: testo("canale"),
    email: testo("email"),
    telefono: testo("telefono"),
    note: testo("note"),
  };

  if (!cliente.ragione_sociale || !cliente.email || !cliente.canale) {
    return {
      ok: false,
      errore: "CAMPI_MANCANTI",
      messaggio: modulo.errori.campiMancanti,
    };
  }

  const richiesta = testo("request_id");
  if (
    !/^[a-f0-9-]{36}$/i.test(richiesta) ||
    testo("website") ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email) ||
    cliente.email.length > 254 ||
    !["bar", "pasticceria", "catering", "GDO"].includes(cliente.canale) ||
    cliente.ragione_sociale.length > 160 ||
    /[\r\n]/.test(cliente.ragione_sociale) ||
    cliente.telefono.length > 40 ||
    /[\r\n]/.test(cliente.telefono) ||
    cliente.note.length > 2000
  ) {
    return {
      ok: false,
      errore: "CAMPI_NON_VALIDI",
      messaggio: testi.configuratore.esperienza.campiInvalidi,
    };
  }

  /* Il dataset è cambiato mentre la pagina era aperta: si chiede una
     riconferma invece di mandare al commerciale un prodotto che non si
     fa più. Client e action viaggiano con lo stesso deploy, quindi una
     differenza qui significa un deploy avvenuto a sessione aperta. */
  if (versione !== DATASET.versione) {
    return {
      ok: false,
      errore: "VERSIONE_OBSOLETA",
      messaggio: modulo.errori.versioneObsoleta,
    };
  }

  const esito = validaStato({ base, farcitura, credenza, finitura, pedane });

  if (!esito.ok) {
    if (esito.errore === "COMBINAZIONE_INESISTENTE")
      return {
        ok: false,
        errore: esito.errore,
        messaggio: modulo.errori.combinazioneInesistente,
      };
    if (esito.errore === "QUANTITA_NON_VALIDA")
      return {
        ok: false,
        errore: esito.errore,
        messaggio: modulo.errori.quantitaNonValida,
      };
    /* SOTTO_ORDINE_MINIMO: non un rifiuto ma una deviazione — il client
       propone la correzione o il contatto con il commerciale. */
    return {
      ok: false,
      errore: esito.errore,
      messaggio: interpola(modulo.errori.sottoMinimo, {
        min: fmtNumero(esito.minimo_pedane, lingua),
        pezzi:
          esito.minimo_pezzi != null
            ? interpola(modulo.errori.sottoMinimoPezzi, {
                n: fmtNumero(esito.minimo_pezzi, lingua),
              })
            : "",
      }),
      minimoPedane: esito.minimo_pedane,
      minimoPezzi: esito.minimo_pezzi,
    };
  }

  const p = prodotto(base, farcitura, credenza, finitura)!;
  const laBase = baseDi(base)!;
  const laFarcitura =
    testi.prodotti.farciture[farcitura as IdFarcitura] ?? farcitura;
  const laCredenza =
    testi.prodotti.credenza[credenza as IdCredenza] ?? credenza;
  const laFinitura =
    testi.prodotti.finiture[finitura as IdFinitura] ?? finitura;
  const nomeProdotto = laBase.nome;
  const pack = laBase.packaging;
  const q = esito.quantita;

  /* Il payload del contratto dati: il prodotto per intero, le quantità
     già convertite in tutte le unità — chi riceve lavora con l'unità del
     suo gestionale, e ricalcolare a mano è il punto in cui si sbaglia —
     e la versione di listino. */
  const payload = {
    linea: DATASET.linea,
    sku: p.sku,
    base: p.base,
    farcitura: p.farcitura,
    credenza: p.credenza,
    finitura: p.finitura,
    grammatura_gr: laBase.grammatura_gr,
    quantita: q,
    packaging: {
      pezzi_per_cartone: pack.pezzi_per_cartone,
      cartoni_per_pedana: pack.cartoni_per_pedana,
      cartoni_per_strato: pack.cartoni_per_strato,
      strati_per_pedana: pack.strati_per_pedana,
    },
    ordine_minimo_pedane: laBase.ordine_minimo_pedane,
    ordine_minimo_rispettato: laBase.ordine_minimo_pedane == null ? null : true,
    cliente,
    versione_listino: DATASET.versione,
  };

  const canale =
    cliente.canale in modulo.canali
      ? modulo.canali[cliente.canale as keyof typeof modulo.canali]
      : cliente.canale;
  const pedaneTesto = conta(testi.configuratore.scala.pedane, q.pedane, lingua);
  const cartoni = conta(testi.configuratore.scala.cartoni, q.cartoni, lingua);
  const pezzi = conta(testi.configuratore.scala.pezzi, q.pezzi, lingua);
  const peso = fmtKg(q.peso_kg, lingua);
  const h = await headers();
  const origin = h.get("origin");
  let sito = BASE_SITO;
  if (!sito && origin) {
    try {
      const url = new URL(origin);
      if (["https:", "http:"].includes(url.protocol)) sito = url;
    } catch {}
  }
  const riferimento = new URL(
    localizza(
      lingua,
      `/configuratore/${p.base}/${p.farcitura}/${p.credenza}/${p.finitura}`,
    ),
    sito ?? "http://localhost:3000",
  ).href;
  const mail = modulo.mail;
  const oggetto = interpola(mail.oggetto, {
    nome: nomeProdotto,
    farcitura: laFarcitura,
    pedane: pedaneTesto,
  });
  const corpo = [
    mail.intestazione,
    "",
    interpola(mail.prodotto, { nome: nomeProdotto, farcitura: laFarcitura }),
    interpola(mail.credenza, { credenza: laCredenza }),
    interpola(mail.finitura, { finitura: laFinitura }),
    `SKU: ${p.sku}`,
    interpola(mail.grammaturaDiametro, {
      g: fmtNumero(laBase.grammatura_gr, lingua),
      cm: fmtNumero(laBase.diametro_cm, lingua),
    }),
    "",
    interpola(mail.quantitaRichiesta, { pedane: pedaneTesto }),
    interpola(mail.equivale, { cartoni, pezzi, peso }),
    laBase.ordine_minimo_pedane != null
      ? interpola(mail.minimoRispettato, {
          min: fmtNumero(laBase.ordine_minimo_pedane, lingua),
        })
      : testi.configuratore.esperienza.minimoConferma,
    "",
    interpola(mail.cliente, { nome: cliente.ragione_sociale, canale }),
    interpola(mail.email, { email: cliente.email }) +
      (cliente.telefono
        ? ` · ${interpola(mail.telefono, { telefono: cliente.telefono })}`
        : ""),
    cliente.note ? interpola(mail.note, { note: cliente.note }) : null,
    "",
    interpola(mail.versione, { versione: payload.versione_listino }),
    interpola(mail.riferimento, {
      url: riferimento,
    }),
  ]
    .filter((r): r is string => r !== null)
    .join("\n");

  const mailto = `mailto:${DESTINATARIO}?subject=${encodeURIComponent(oggetto)}&body=${encodeURIComponent(corpo)}`;

  const consegna = await consegnaQuotazione({
    oggetto,
    corpo,
    email: cliente.email,
    richiesta,
  });
  if (consegna.stato === "errore")
    return {
      ok: false,
      errore: "INVIO_FALLITO",
      messaggio: testi.configuratore.esperienza.invioFallito,
      mailto,
    };
  return {
    ok: true,
    inviata: consegna.stato === "inviata",
    ...(consegna.stato === "inviata" ? { id: consegna.id } : {}),
    sku: p.sku,
    quantita: q,
    mailto,
  };
}
