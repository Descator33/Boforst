"use server";

/**
 * Server Action del configuratore: la validazione lato server richiesta
 * dalla spec. Le actions viaggiano in POST e sono raggiungibili anche con
 * POST diretti, quindi qui si riesegue validaStato con lo stesso modulo e
 * lo stesso dataset del client: un URL forgiato, una quantità manomessa o
 * un client rimasto aperto attraverso un deploy non passano.
 *
 * Trasporto provvisorio: il sito non ha ancora un backend di posta (il
 * form contatti è un mailto:), e la scelta quotazione/ordine con il suo
 * destinatario è un punto aperto con il committente. La action valida e
 * compone la richiesta; la consegna passa dal client di posta dell'utente
 * con un mailto: precompilato. Quando arriverà il canale definitivo
 * (casella commerciale o gestionale), si sostituisce solo l'ultimo tratto.
 */

import {
  DATASET,
  baseDi,
  combinazione,
  nomeCommerciale,
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
import type { IdFarcitura, IdTopping } from "@/lib/i18n/tipi";

const DESTINATARIO = "info@delsigel.it";

export type StatoInvio =
  | null
  | {
      ok: false;
      errore:
        | "CAMPI_MANCANTI"
        | "COMBINAZIONE_INESISTENTE"
        | "QUANTITA_NON_VALIDA"
        | "SOTTO_ORDINE_MINIMO"
        | "VERSIONE_OBSOLETA";
      messaggio: string;
      minimoPedane?: number;
      minimoPezzi?: number | null;
    }
  | {
      ok: true;
      sku: string;
      quantita: Quantita;
      mailto: string;
    };

export async function richiediQuotazione(
  _prev: StatoInvio,
  formData: FormData
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

  const esito = validaStato({ base, farcitura, pedane });

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

  const comb = combinazione(base, farcitura)!;
  const laBase = baseDi(base)!;
  const laFarcitura =
    testi.prodotti.farciture[farcitura as IdFarcitura] ?? farcitura;
  const ilTopping =
    testi.prodotti.topping[comb.topping as IdTopping] ?? comb.topping;
  const nomeProdotto = nomeCommerciale(comb);
  const p = laBase.packaging;
  const q = esito.quantita;

  /* Il payload del contratto dati: il prodotto per intero (topping incluso
     benché derivato), le quantità già convertite in tutte le unità — chi
     riceve lavora con l'unità del suo gestionale, e ricalcolare a mano è
     il punto in cui si sbaglia — e la versione di listino. */
  const payload = {
    linea: DATASET.linea,
    sku: comb.sku,
    base: comb.base,
    farcitura: comb.farcitura,
    topping: comb.topping,
    grammatura_gr: comb.grammatura_gr,
    quantita: q,
    packaging: {
      pezzi_per_cartone: p.pezzi_per_cartone,
      cartoni_per_pedana: p.cartoni_per_pedana,
      cartoni_per_strato: p.cartoni_per_strato,
      strati_per_pedana: p.strati_per_pedana,
    },
    ordine_minimo_pedane: comb.ordine_minimo_pedane,
    ordine_minimo_rispettato: true,
    cliente,
    versione_listino: DATASET.versione,
  };

  const canale =
    cliente.canale in modulo.canali
      ? modulo.canali[cliente.canale as keyof typeof modulo.canali]
      : cliente.canale;
  const pedaneTesto = conta(
    testi.configuratore.scala.pedane,
    q.pedane,
    lingua,
  );
  const cartoni = conta(testi.configuratore.scala.cartoni, q.cartoni, lingua);
  const pezzi = conta(testi.configuratore.scala.pezzi, q.pezzi, lingua);
  const peso = fmtKg(q.peso_kg, lingua);
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
    interpola(mail.finitura, { topping: ilTopping }),
    `SKU: ${comb.sku}`,
    interpola(mail.grammaturaDiametro, {
      g: fmtNumero(comb.grammatura_gr, lingua),
      cm: fmtNumero(laBase.diametro_cm, lingua),
    }),
    "",
    interpola(mail.quantitaRichiesta, { pedane: pedaneTesto }),
    interpola(mail.equivale, { cartoni, pezzi, peso }),
    comb.ordine_minimo_pedane != null
      ? interpola(mail.minimoRispettato, {
          min: fmtNumero(comb.ordine_minimo_pedane, lingua),
        })
      : mail.minimoNonPrevisto,
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
      url: localizza(
        lingua,
        `/configuratore/${comb.base}/${comb.farcitura}`,
      ),
    }),
  ]
    .filter((r): r is string => r !== null)
    .join("\n");

  const mailto = `mailto:${DESTINATARIO}?subject=${encodeURIComponent(oggetto)}&body=${encodeURIComponent(corpo)}`;

  return { ok: true, sku: comb.sku, quantita: q, mailto };
}
