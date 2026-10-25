#!/usr/bin/env node
/**
 * Validazione del dataset del configuratore dolci (lib/configuratore/dati-dolci.json).
 *
 * Gira come `prebuild`: se una verifica salta, il build fallisce e non pubblica.
 *
 * La matrice 2026-10-22 dichiara esplicitamente ogni SKU consentita. Le
 * ricette vengono validate contro i quattro vocabolari; grammatura/peso/
 * ordine minimo vivono sulla base e devono chiudere lì.
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const qui = dirname(fileURLToPath(import.meta.url));
const percorso = join(qui, "..", "lib", "configuratore", "dati-dolci.json");
const percorsoManifestoFoto = join(
  qui,
  "..",
  "lib",
  "configuratore",
  "foto-manifest.json"
);
const dati = JSON.parse(readFileSync(percorso, "utf8"));

const errori = [];
const err = (msg) => errori.push(msg);

/* ── 1. Id unici in ciascun vocabolario ── */
const controllaUnicita = (elenco, nomeVocabolario) => {
  const visti = new Set();
  for (const voce of elenco ?? []) {
    if (visti.has(voce.id)) err(`${nomeVocabolario}: id duplicato "${voce.id}"`);
    visti.add(voce.id);
  }
};
controllaUnicita(dati.basi, "basi");
controllaUnicita(dati.farciture, "farciture");
controllaUnicita(dati.credenza, "credenza");
controllaUnicita(dati.finiture, "finiture");

/* ── 1b. Integrità della matrice chiusa ── */
const chiaviCombinazione = new Set();
const vocabolari = {
  base: new Set((dati.basi ?? []).map((v) => v.id)),
  farcitura: new Set((dati.farciture ?? []).map((v) => v.id)),
  credenza: new Set((dati.credenza ?? []).map((v) => v.id)),
  finitura: new Set((dati.finiture ?? []).map((v) => v.id)),
};
for (const c of dati.combinazioni ?? []) {
  for (const [campo, voci] of Object.entries(vocabolari))
    if (!voci.has(c[campo])) err(`combinazione: ${campo} inesistente "${c[campo]}"`);
  const chiave = `${c.base}--${c.farcitura}--${c.credenza}--${c.finitura}`;
  if (chiaviCombinazione.has(chiave)) err(`combinazioni: SKU duplicata "${chiave}"`);
  chiaviCombinazione.add(chiave);
}
if (!Array.isArray(dati.combinazioni) || dati.combinazioni.length === 0)
  err("il dataset non contiene combinazioni");

/* ── 2. Coerenza del packaging e delle grandezze derivate, per base ──
   Grammatura, peso e ordine minimo vivono sulla base: farcitura, voce
   dalla credenza e finitura sono compositive e non le cambiano. */
for (const b of dati.basi ?? []) {
  const p = b.packaging ?? {};
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

  const pesoCartone = (b.grammatura_gr * p.pezzi_per_cartone) / 1000;
  if (Math.abs(pesoCartone - b.peso_cartone_kg) > 0.005)
    err(
      `${b.nome}: peso_cartone_kg è ${b.peso_cartone_kg} ma ${b.grammatura_gr} g × ` +
        `${p.pezzi_per_cartone} pz fa ${pesoCartone.toFixed(2)} kg`
    );

  const pesoPedana = pesoCartone * p.cartoni_per_pedana;
  if (Math.abs(pesoPedana - b.peso_pedana_kg) > 0.05)
    err(
      `${b.nome}: peso_pedana_kg è ${b.peso_pedana_kg} ma ${pesoCartone.toFixed(2)} kg × ` +
        `${p.cartoni_per_pedana} ct fa ${pesoPedana.toFixed(1)} kg`
    );

  if (b.ordine_minimo_pedane != null) {
    const attesi = b.ordine_minimo_pedane * p.pezzi_per_pedana;
    if (b.ordine_minimo_pezzi !== attesi)
      err(
        `${b.nome}: ordine_minimo_pezzi è ${b.ordine_minimo_pezzi} ma ` +
          `${b.ordine_minimo_pedane} pedane × ${p.pezzi_per_pedana} pz fa ${attesi}`
      );
  }
}

/* ── Foto del configuratore: sfondo trasparente obbligatorio ──
   Regola assoluta (2026-08-02): nel configuratore entrano solo foto
   scontornate. Qui si verifica ciò che si può verificare senza decodificare
   i pixel: niente JPEG (il formato non ha un canale alfa), e PNG/WebP
   devono dichiararlo nell'intestazione. In più, ogni cartella deve
   corrispondere a una voce reale del vocabolario: una cartella con un
   refuso nel nome non verrebbe mai mostrata, meglio saperlo al build.
   Quattro radici, stesso contratto: prodotti/ (gli stati del prodotto, ai
   4 livelli della ricetta), farciture/, credenza/ e finiture/
   (l'ingrediente/la finitura da soli, tessere dei passi 2-4). */

const radiceFoto = join(qui, "..", "public", "img", "configuratore");

const idFarciture = new Set((dati.farciture ?? []).map((f) => f.id));
const idCredenza = new Set((dati.credenza ?? []).map((c) => c.id));
const idFiniture = new Set((dati.finiture ?? []).map((f) => f.id));

/* Gli stati validi sono solo quelli raggiungibili dalla matrice chiusa. */
const statiProdotto = new Set();
for (const c of dati.combinazioni ?? []) {
  statiProdotto.add(c.base);
  statiProdotto.add(`${c.base}--${c.farcitura}`);
  statiProdotto.add(`${c.base}--${c.farcitura}--${c.credenza}`);
  statiProdotto.add(`${c.base}--${c.farcitura}--${c.credenza}--${c.finitura}`);
}

const radici = [
  { cartella: "prodotti", validi: statiProdotto, cosa: "stato del prodotto (base, base--farcitura, base--farcitura--credenza o sku completo)" },
  { cartella: "farciture", validi: idFarciture, cosa: "farcitura del vocabolario" },
  { cartella: "credenza", validi: idCredenza, cosa: "voce dalla credenza del vocabolario" },
  { cartella: "finiture", validi: idFiniture, cosa: "finitura del vocabolario" },
];

/* Il manifest porta nel runtime solo gli URL, non i file binari. Senza
   questo passaggio la scansione con node:fs dentro alla pagina verrebbe
   interpretata dall'output file tracing di Next come dipendenza runtime e
   copierebbe tutte le foto anche nella funzione serverless. Gli asset restano
   invece in public/ e vengono serviti dal CDN del provider. */
const manifestoFoto = Object.fromEntries(
  radici.map(({ cartella }) => [cartella, {}])
);

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
for (const { cartella, validi } of radici) {
  const percorsoRadice = join(radiceFoto, cartella);
  for (const voce of readdirSync(percorsoRadice, { withFileTypes: true })) {
    if (!voce.isDirectory()) continue;
    /* Gli asset pre-matrice restano in public finché non arriveranno le
       nuove foto; sono esclusi dal manifest e non possono apparire nella UI. */
    if (!validi.has(voce.name)) continue;
    const fotoValide = [];
    for (const file of readdirSync(join(percorsoRadice, voce.name)).sort()) {
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
      else {
        fotoVerificate++;
        fotoValide.push(file);
      }
    }
    const primaFoto = fotoValide[0];
    if (primaFoto)
      manifestoFoto[cartella][voce.name] =
        `/img/configuratore/${cartella}/${encodeURIComponent(voce.name)}/${encodeURIComponent(primaFoto)}`;
  }
}

// Una tessera o uno stato previsto senza foto è un errore di pubblicazione.
for (const {cartella, validi} of radici)
  for (const id of validi)
    if (!manifestoFoto[cartella][id]) err(`foto mancante: ${cartella}/${id}`);

/* ── Campi di testata ── */
if (!dati.versione) err("manca il campo di testata `versione` (versione del listino)");
if (dati.unita_quantita !== "pedane")
  err(`unita_quantita è "${dati.unita_quantita}": il configuratore è scritto per "pedane"`);
if (!Array.isArray(dati.basi) || dati.basi.length === 0) err("il dataset non contiene basi");
if (!Array.isArray(dati.farciture) || dati.farciture.length === 0) err("il dataset non contiene farciture");
if (!Array.isArray(dati.credenza) || dati.credenza.length === 0) err("il dataset non contiene voci dalla credenza");
if (!Array.isArray(dati.finiture) || dati.finiture.length === 0) err("il dataset non contiene finiture");

/* ── Esito ── */
if (errori.length > 0) {
  console.error(`\n✗ Dataset configuratore NON valido — ${errori.length} problemi:\n`);
  for (const e of errori) console.error(`  · ${e}`);
  console.error(
    "\nIl build si ferma qui: correggere il dataset e rilanciare.\n"
  );
  process.exit(1);
} else {
  writeFileSync(
    percorsoManifestoFoto,
    `${JSON.stringify(manifestoFoto, null, 2)}\n`,
    "utf8"
  );
  const totale = dati.combinazioni?.length ?? 0;
  console.log(
    `✓ Dataset configuratore valido — versione ${dati.versione}: ` +
      `${dati.basi.length} basi, ${dati.farciture.length} farciture, ` +
      `${dati.credenza.length} voci dalla credenza, ${dati.finiture.length} finiture ` +
      `(${totale} combinazioni dichiarate), ${fotoVerificate} foto con alfa verificate; ` +
      `manifest foto aggiornato.`
  );
}
