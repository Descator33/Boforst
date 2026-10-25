/**
 * Importa i render Nuvola nel contratto foto del configuratore.
 *
 * Le sorgenti sono RGB su fondo bianco. La maschera non usa una chiave
 * cromatica pixel-per-pixel (che cancellerebbe lo zucchero a velo): trova
 * invece il fondo connesso ai bordi e conserva tutto ciò che è racchiuso
 * dal prodotto, inclusi i dettagli bianchi interni. I file sorgente non
 * vengono mai modificati.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sorgenti = join(root, "assets", "sorgenti", "Nuvola");
const prodotti = join(root, "assets", "sorgenti", "configuratore", "prodotti");
const riferimentoChiave = "nuvola--crema--kinder-bueno-dark--zucchero-a-velo";
const riferimento = join(prodotti, riferimentoChiave, `${riferimentoChiave}.png`);

const crema = [
  ["frutti-di-bosco", "Con frutti rossi.png"],
  ["kiwi", "Con kiwi.png"],
  ["banana", "Con banana.png"],
  ["kit-kat", "Con kitkat.png"],
  ["happy-hippo", "Con happy hippo.png"],
  ["smarties", "Con smarties.png"],
  ["kinder-bueno-dark", "Con kinder bueno.png"],
  ["kinder", "Con kinder.png"],
  ["quadretti-di-cioccolato", "Con quadratini.png"],
  ["oreo", "Con oreo.png"],
  ["cocco", "Con cocco.png"],
  ["mini-cookies", "Con cookies.png"],
];

const cioccolato = [
  ["frutti-di-bosco", "Con frutti rossi.png"],
  ["kiwi", "Con kiwi.png"],
  ["banana", "Con banana.png"],
  ["kit-kat", "Con kitkat.png"],
  ["happy-hippo", "Con Happy Hippo.png"],
  ["smarties", "Con smarties.png"],
  ["kinder-bueno-white", "Con Kinder bueno.png"],
  ["kinder", "Con kinder.png"],
  ["quadretti-di-cioccolato", "Con quadratini.png"],
  ["oreo", "Con oreo.png"],
  ["cocco", "Con cocco.png"],
  ["mini-cookies", "Con cookies.png"],
];

const finale = (farcitura, credenza, file) => ({
  sorgente: join(sorgenti, `Farcita + ${farcitura}`, "Con zucchero a velo", file),
  chiave: `nuvola--${farcitura}--${credenza}--zucchero-a-velo`,
});
const intermedio = (farcitura, credenza, file) => ({
  sorgente: join(sorgenti, `Farcita + ${farcitura}`, "Senza zucchero a velo", file),
  chiave: `nuvola--${farcitura}--${credenza}`,
});

const lavori = [
  { sorgente: join(sorgenti, "Semplice.png"), chiave: "nuvola" },
  /* Le due nuove fotografie sostituiscono gli stati di sola farcitura. */
  { sorgente: join(sorgenti, "crema.png"), chiave: "nuvola--crema" },
  { sorgente: join(sorgenti, "Cioccolato.png"), chiave: "nuvola--cioccolato" },
  ...crema.map(([c, f]) => intermedio("crema", c, f)),
  ...cioccolato.map(([c, f]) => intermedio("cioccolato", c, f)),
  /* Sostituzioni fotografiche degli stati intermedi crema/cioccolato +
     fragola: non sono le versioni con zucchero a velo. */
  {
    sorgente: join(sorgenti, "crema fragola.png"),
    chiave: "nuvola--crema--fragola",
  },
  {
    sorgente: join(sorgenti, "Cioccolato fragola.png"),
    chiave: "nuvola--cioccolato--fragola",
  },
  {
    /* La variante finale conserva la sua fotografia con zucchero a velo. */
    sorgente: join(sorgenti, "Crema e fragola.png"),
    chiave: "nuvola--crema--fragola--zucchero-a-velo",
  },
  finale("cioccolato", "fragola", "Con Fragola.png"),
];

/* I nomi dei file con zucchero a velo hanno maiuscole e parole leggermente
   diverse da quelli degli stati intermedi: questa tabella è la mappa
   controllata visivamente, non una derivazione automatica del filename. */
const fileFinali = new Map([
  ["crema--frutti-di-bosco", "Con frutti di bosco.png"],
  ["crema--kiwi", "Con Kiwi.png"],
  ["crema--banana", "Con banana.png"],
  ["crema--kit-kat", "Con KitKat.png"],
  ["crema--happy-hippo", "Con Happy Hippo.png"],
  ["crema--smarties", "Con smarties.png"],
  ["crema--kinder-bueno-dark", "Con kinder bueno.png"],
  ["crema--kinder", "Con kinder.png"],
  ["crema--quadretti-di-cioccolato", "Con quadratini di cioccolato.png"],
  ["crema--oreo", "Con oreo.png"],
  ["crema--cocco", "Con cocco.png"],
  ["crema--mini-cookies", "Con cookies.png"],
  ["cioccolato--frutti-di-bosco", "Con frutti rossi.png"],
  ["cioccolato--kiwi", "Con Kiwi.png"],
  ["cioccolato--fragola", "Con Fragola.png"],
  ["cioccolato--banana", "Con Banana.png"],
  ["cioccolato--kit-kat", "Con KitKat.png"],
  ["cioccolato--happy-hippo", "Con Happy Hippo.png"],
  ["cioccolato--smarties", "Con Smarties.png"],
  ["cioccolato--kinder-bueno-white", "Con Kinder Bueno.png"],
  ["cioccolato--kinder", "Con Kinder.png"],
  ["cioccolato--quadretti-di-cioccolato", "Con quadratini di cioccolato.png"],
  ["cioccolato--oreo", "Con Oreo.png"],
  ["cioccolato--cocco", "Con cocco.png"],
  ["cioccolato--mini-cookies", "Con Cookies.png"],
]);

for (const [farcitura, voci] of [["crema", crema], ["cioccolato", cioccolato]]) {
  for (const [credenza] of voci) {
    const file = fileFinali.get(`${farcitura}--${credenza}`);
    if (file) lavori.push(finale(farcitura, credenza, file));
  }
}

/** Maschera a componenti connesse. Una lieve dilatazione del segnale del
 * dolce chiude i micro-varchi fra i granelli di zucchero: il flood-fill può
 * quindi togliere il fondale bianco e l'ellisse del piano, senza entrare
 * nella spolverata. */
async function scontorna(input) {
  const { data, info } = await sharp(input)
    .rotate()
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const px = width * height;
  const segnale = new Uint8Array(px);
  const eSoggetto = (i) => {
    const p = i * channels;
    const r = data[p], g = data[p + 1], b = data[p + 2];
    // Il piano di posa e la sua ombra sono quasi neutri e molto chiari.
    // Una soglia più severa li lascia raggiungibili dal flood-fill; il
    // prodotto (crosta, creme e topping) resta invece la barriera che
    // protegge anche lo zucchero racchiuso nella sua silhouette.
    return Math.min(r, g, b) < 220 || Math.max(r, g, b) - Math.min(r, g, b) > 18;
  };
  for (let i = 0; i < px; i++) if (eSoggetto(i)) segnale[i] = 1;
  const dilataOrizzontale = new Uint8Array(px);
  const barriera = new Uint8Array(px);
  const raggio = 4;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let dx = -raggio; dx <= raggio; dx++) {
        const xx = x + dx;
        if (xx >= 0 && xx < width && segnale[y * width + xx]) {
          dilataOrizzontale[y * width + x] = 1;
          break;
        }
      }
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let dy = -raggio; dy <= raggio; dy++) {
        const yy = y + dy;
        if (yy >= 0 && yy < height && dilataOrizzontale[yy * width + x]) {
          barriera[y * width + x] = 1;
          break;
        }
      }
    }
  }
  const sfondo = new Uint8Array(px);
  const coda = new Int32Array(px);
  let testa = 0;
  let fine = 0;
  const aggiungi = (i) => {
    if (!barriera[i] && !sfondo[i]) {
      sfondo[i] = 1;
      coda[fine++] = i;
    }
  };
  for (let x = 0; x < width; x++) {
    aggiungi(x);
    aggiungi((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y++) {
    aggiungi(y * width);
    aggiungi(y * width + width - 1);
  }
  while (testa < fine) {
    const i = coda[testa++];
    const x = i % width;
    if (x > 0) aggiungi(i - 1);
    if (x + 1 < width) aggiungi(i + 1);
    if (i >= width) aggiungi(i - width);
    if (i + width < px) aggiungi(i + width);
  }
  const rgba = Buffer.allocUnsafe(px * 4);
  for (let i = 0; i < px; i++) {
    const src = i * channels;
    const dst = i * 4;
    rgba[dst] = data[src];
    rgba[dst + 1] = data[src + 1];
    rgba[dst + 2] = data[src + 2];
    rgba[dst + 3] = sfondo[i] ? 0 : 255;
  }
  return sharp(rgba, { raw: { width, height, channels: 4 } })
    .blur(0.45)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Restituisce il rettangolo che contiene i pixel visibili. */
async function rettangoloAlfa(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let sinistra = info.width;
  let alto = info.height;
  let destra = -1;
  let basso = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        sinistra = Math.min(sinistra, x);
        alto = Math.min(alto, y);
        destra = Math.max(destra, x);
        basso = Math.max(basso, y);
      }
    }
  }
  if (destra < 0) throw new Error("Immagine senza soggetto visibile");
  return {
    canvas: { width: info.width, height: info.height },
    box: { left: sinistra, top: alto, width: destra - sinistra + 1, height: basso - alto + 1 },
  };
}

/* Tutte le immagini del palco usano la tela e l'ingombro della fotografia
   approvata di riferimento: object-contain nel browser non può più farle
   apparire di dimensioni diverse solo perché la sorgente aveva un canvas
   verticale o quadrato. */
const misuraRiferimento = await rettangoloAlfa(riferimento);
async function normalizzaNelQuadro(input) {
  const misura = await rettangoloAlfa(input);
  const ritaglio = await sharp(input)
    .ensureAlpha()
    .extract(misura.box)
    .resize({
      width: misuraRiferimento.box.width,
      height: misuraRiferimento.box.height,
      fit: "inside",
      withoutEnlargement: false,
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const elaborata = await sharp(ritaglio).metadata();
  const left = Math.round(
    misuraRiferimento.box.left + (misuraRiferimento.box.width - elaborata.width) / 2,
  );
  const top = Math.round(
    misuraRiferimento.box.top + (misuraRiferimento.box.height - elaborata.height) / 2,
  );
  return sharp({
    create: {
      width: misuraRiferimento.canvas.width,
      height: misuraRiferimento.canvas.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: ritaglio, left, top }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

for (const lavoro of lavori) {
  const output = join(prodotti, lavoro.chiave, `${lavoro.chiave}.png`);
  await mkdir(dirname(output), { recursive: true });
  const immagine = lavoro.alfaEsistente
    ? await readFile(lavoro.sorgente)
    : await scontorna(lavoro.sorgente);
  await writeFile(
    output,
    lavoro.chiave === riferimentoChiave ? immagine : await normalizzaNelQuadro(immagine),
  );
  console.log(`${lavoro.chiave} ← ${lavoro.sorgente.replace(`${root}/`, "")}`);
}
