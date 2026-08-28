#!/usr/bin/env node
/**
 * Validazione del dataset del configuratore dolci (lib/configuratore/dati-dolci.json).
 *
 * Gira come `prebuild`: se una verifica salta, il build fallisce e non pubblica.
 * È pensato per essere eseguibile anche da chi tiene il foglio Excel:
 * ogni errore dice quale prodotto (SKU), quale campo e quale conto non chiude.
 *
 * Le prime cinque verifiche sono le asserzioni della specifica
 * (public/configuratore-dolci-spec-tecnica.md, «Il contratto dati»);
 * le successive controllano le grandezze derivate, che nel foglio si
 * ricalcolano a mano ed è lì che si sbaglia.
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const qui = dirname(fileURLToPath(import.meta.url));
const percorso = join(qui, "..", "lib", "configuratore", "dati-dolci.json");
const dati = JSON.parse(readFileSync(percorso, "utf8"));

const errori = [];
const err = (msg) => errori.push(msg);

const basi = new Map(dati.basi.map((b) => [b.id, b]));
const farciture = new Set(dati.farciture.map((f) => f.id));
const topping = new Set(dati.topping.map((t) => t.id));

/* ── 1. Integrità referenziale: ogni riferimento esiste nel vocabolario ── */
for (const c of dati.combinazioni) {
  if (!basi.has(c.base))
    err(`${c.sku}: la base "${c.base}" non esiste nel vocabolario delle basi`);
  if (!farciture.has(c.farcitura))
    err(`${c.sku}: la farcitura "${c.farcitura}" non esiste nel vocabolario delle farciture`);
  if (!topping.has(c.topping))
    err(`${c.sku}: il topping "${c.topping}" non esiste nel vocabolario dei topping`);
}

/* ── 2. SKU unici e coerenti con il formato {base}--{farcitura} ── */
const visti = new Set();
for (const c of dati.combinazioni) {
  if (visti.has(c.sku)) err(`SKU duplicato: ${c.sku}`);
  visti.add(c.sku);
  if (c.sku !== `${c.base}--${c.farcitura}`)
    err(`${c.sku}: lo SKU non corrisponde a "${c.base}--${c.farcitura}"`);
}

/* ── 3. Dipendenza funzionale: (base, farcitura) → un solo topping ──
   Formalmente implicata dalla 2 con il formato attuale dello SKU, ma resta
   un'asserzione autonoma: protegge da un futuro cambio di formato della chiave. */
const toppingPerCoppia = new Map();
for (const c of dati.combinazioni) {
  const coppia = `${c.base} + ${c.farcitura}`;
  const gia = toppingPerCoppia.get(coppia);
  if (gia && gia !== c.topping)
    err(`${coppia}: compare con due topping diversi ("${gia}" e "${c.topping}")`);
  toppingPerCoppia.set(coppia, c.topping);
}

/* ── 4–5. Coerenza del packaging: le moltiplicazioni della catena chiudono ── */
for (const b of dati.basi) {
  const p = b.packaging;
  if (p.vassoi_per_cartone != null && p.pezzi_per_vassoio != null) {
    const attesi = p.vassoi_per_cartone * p.pezzi_per_vassoio;
    if (attesi !== p.pezzi_per_cartone)
      err(
        `${b.nome}: ${p.vassoi_per_cartone} vassoi × ${p.pezzi_per_vassoio} pz = ${attesi}, ` +
          `ma pezzi_per_cartone dice ${p.pezzi_per_cartone} (listino: "${p.testo_originale}")`
      );
  }
  if (p.cartoni_per_strato != null && p.strati_per_pedana != null) {
    const attesi = p.cartoni_per_strato * p.strati_per_pedana;
    if (attesi !== p.cartoni_per_pedana)
      err(
        `${b.nome}: ${p.cartoni_per_strato} ct/strato × ${p.strati_per_pedana} strati = ${attesi}, ` +
          `ma cartoni_per_pedana dice ${p.cartoni_per_pedana} (listino: "${p.testo_originale}")`
      );
  }
  const pezziPedana = p.pezzi_per_cartone * p.cartoni_per_pedana;
  if (pezziPedana !== p.pezzi_per_pedana)
    err(
      `${b.nome}: ${p.pezzi_per_cartone} pz/ct × ${p.cartoni_per_pedana} ct/pedana = ${pezziPedana}, ` +
        `ma pezzi_per_pedana dice ${p.pezzi_per_pedana}`
    );
}

/* ── Derivate della combinazione: pesi e ordine minimo in pezzi ── */
for (const c of dati.combinazioni) {
  const b = basi.get(c.base);
  if (!b) continue; // già segnalato al punto 1
  const p = b.packaging;

  const pesoCartone = (c.grammatura_gr * p.pezzi_per_cartone) / 1000;
  if (Math.abs(pesoCartone - c.peso_cartone_kg) > 0.005)
    err(
      `${c.sku}: peso_cartone_kg è ${c.peso_cartone_kg} ma ${c.grammatura_gr} g × ` +
        `${p.pezzi_per_cartone} pz fa ${pesoCartone.toFixed(2)} kg`
    );

  const pesoPedana = pesoCartone * p.cartoni_per_pedana;
  if (Math.abs(pesoPedana - c.peso_pedana_kg) > 0.05)
    err(
      `${c.sku}: peso_pedana_kg è ${c.peso_pedana_kg} ma ${pesoCartone.toFixed(2)} kg × ` +
        `${p.cartoni_per_pedana} ct fa ${pesoPedana.toFixed(1)} kg`
    );

  if (c.ordine_minimo_pedane != null) {
    const attesi = c.ordine_minimo_pedane * p.pezzi_per_pedana;
    if (c.ordine_minimo_pezzi !== attesi)
      err(
        `${c.sku}: ordine_minimo_pezzi è ${c.ordine_minimo_pezzi} ma ` +
          `${c.ordine_minimo_pedane} pedane × ${p.pezzi_per_pedana} pz fa ${attesi}`
      );
  }
  if ((c.ordine_minimo_pedane != null) !== c.ordine_minimo_dichiarato_su_riga)
    err(
      `${c.sku}: ordine_minimo_dichiarato_su_riga (${c.ordine_minimo_dichiarato_su_riga}) ` +
        `non è coerente con ordine_minimo_pedane (${c.ordine_minimo_pedane})`
    );
}

/* ── Foto del configuratore: sfondo trasparente obbligatorio ──
   Regola assoluta (2026-08-02): nel configuratore entrano solo foto
   scontornate. Qui si verifica ciò che si può verificare senza decodificare
   i pixel: niente JPEG (il formato non ha un canale alfa), e PNG/WebP
   devono dichiararlo nell'intestazione. In più, ogni cartella deve
   corrispondere a una voce reale del vocabolario: una cartella con un
   refuso nel nome non verrebbe mai mostrata, meglio saperlo al build.
   Tre radici, stesso contratto: prodotti/ (gli stati del prodotto),
   farciture/ (l'ingrediente da solo, tessere del passo 2) e topping/
   (la finitura da sola, tessera del passo 3). */

const radiceFoto = join(qui, "..", "public", "img", "configuratore");
const radici = [
  {
    cartella: "prodotti",
    validi: new Set([
      ...dati.basi.map((b) => b.id),
      ...dati.combinazioni.map((c) => c.sku),
      ...dati.combinazioni.map((c) => `${c.sku}--${c.topping}`),
    ]),
    cosa: "stato del prodotto (base, sku o sku--topping)",
  },
  {
    cartella: "farciture",
    validi: farciture,
    cosa: "farcitura del vocabolario",
  },
  {
    cartella: "topping",
    validi: topping,
    cosa: "topping del vocabolario",
  },
];

/* PNG: il tipo colore sta al byte 25 dell'IHDR — 6 (RGBA) e 4 (grigio+alfa)
   portano l'alfa; gli altri solo se c'è un chunk tRNS. */
const pngConAlfa = (buf) =>
  buf.length > 25 && (buf[25] === 4 || buf[25] === 6 || buf.includes("tRNS"));

/* WebP: VP8X dichiara l'alfa nel bit 0x10 dei flag; VP8L (lossless) nel
   bit 28 dell'intestazione del bitstream; "VP8 " (lossy semplice) non può
   averlo per costruzione. */
const webpConAlfa = (buf) => {
  if (buf.length < 30 || buf.toString("ascii", 0, 4) !== "RIFF") return false;
  const fourcc = buf.toString("ascii", 12, 16);
  if (fourcc === "VP8X") return (buf[20] & 0x10) !== 0;
  if (fourcc === "VP8L")
    return buf[20] === 0x2f && ((buf.readUInt32LE(21) >>> 28) & 1) === 1;
  return false;
};

let fotoVerificate = 0;
for (const { cartella, validi, cosa } of radici) {
  const percorsoRadice = join(radiceFoto, cartella);
  for (const voce of readdirSync(percorsoRadice, { withFileTypes: true })) {
    if (!voce.isDirectory()) continue;
    if (!validi.has(voce.name))
      err(
        `foto: la cartella "${cartella}/${voce.name}" non corrisponde ` +
          `a nessuna ${cosa}`
      );
    for (const file of readdirSync(join(percorsoRadice, voce.name))) {
      if (file === ".DS_Store" || file === "README.md") continue;
      const dove = `${cartella}/${voce.name}/${file}`;
      const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
      if (ext === ".jpg" || ext === ".jpeg") {
        err(
          `foto: ${dove} è un JPEG, che non può avere lo sfondo trasparente: ` +
            `scontornare e salvare in PNG o WebP con alfa`
        );
        continue;
      }
      if (ext !== ".png" && ext !== ".webp") {
        err(`foto: ${dove}: formato non ammesso (solo PNG o WebP con alfa)`);
        continue;
      }
      const buf = readFileSync(join(percorsoRadice, voce.name, file));
      if (!(ext === ".png" ? pngConAlfa(buf) : webpConAlfa(buf)))
        err(
          `foto: ${dove} non ha il canale alfa: la regola del configuratore ` +
            `è sfondo trasparente, sempre`
        );
      else fotoVerificate++;
    }
  }
}

/* ── Campi di testata ── */
if (!dati.versione) err("manca il campo di testata `versione` (versione del listino)");
if (dati.unita_quantita !== "pedane")
  err(`unita_quantita è "${dati.unita_quantita}": il configuratore è scritto per "pedane"`);
if (!Array.isArray(dati.combinazioni) || dati.combinazioni.length === 0)
  err("il dataset non contiene combinazioni");

/* ── Esito ── */
const conMinimo = dati.combinazioni.filter((c) => c.ordine_minimo_pedane != null).length;
if (errori.length > 0) {
  console.error(`\n✗ Dataset configuratore NON valido — ${errori.length} problemi:\n`);
  for (const e of errori) console.error(`  · ${e}`);
  console.error(
    "\nIl build si ferma qui: correggere il foglio (o il JSON generato) e rilanciare.\n"
  );
  process.exit(1);
} else {
  console.log(
    `✓ Dataset configuratore valido — versione ${dati.versione}: ` +
      `${dati.combinazioni.length} combinazioni, ${dati.basi.length} basi, ` +
      `${dati.farciture.length} farciture, ${dati.topping.length} topping, ` +
      `${conMinimo} SKU con ordine minimo, ${fotoVerificate} foto con alfa verificate.`
  );
}
