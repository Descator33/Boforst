/** Solo derivati ottimizzati e indirizzati per contenuto entrano in public/. */
import { readdir, readFile, mkdir, writeFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";
import sharp from "sharp";
const root = resolve(import.meta.dirname, "..");
const dati = JSON.parse(
  await readFile(join(root, "lib/configuratore/dati-dolci.json"), "utf8"),
);
const stati = new Set();
for (const c of dati.combinazioni) {
  const segmenti = [c.base, c.farcitura, c.credenza, c.finitura];
  for (let n = 1; n <= 4; n++) stati.add(segmenti.slice(0, n).join("--"));
}
const gruppi = {
  prodotti: [...stati],
  farciture: dati.farciture.map((v) => v.id),
  credenza: dati.credenza.map((v) => v.id),
  finiture: dati.finiture.map((v) => v.id),
};
let numero = 0,
  bytes = 0;
for (const [gruppo, ids] of Object.entries(gruppi))
  for (const id of ids) {
    const sorgente = join(root, "assets/sorgenti/configuratore", gruppo, id);
    const nomi = await readdir(sorgente).catch((e) => {
      if (e.code === "ENOENT") return [];
      throw e;
    });
    if (nomi.some((nome) => /\.jpe?g$/i.test(nome)))
      throw new Error(`JPEG non ammesso: ${gruppo}/${id}`);
    const nome = nomi.filter((n) => /\.(png|webp)$/i.test(n)).sort()[0];
    if (!nome) throw new Error(`Foto sorgente mancante: ${gruppo}/${id}`);
    const originale = await readFile(join(sorgente, nome));
    const meta = await sharp(originale).metadata();
    const stats = await sharp(originale).stats();
    if (!meta.hasAlpha || stats.channels[meta.channels - 1].min === 255)
      throw new Error(`Canale alfa mancante: ${gruppo}/${id}/${nome}`);
    const foto = await sharp(originale)
      .resize({
        width: gruppo === "prodotti" ? 1000 : 640,
        withoutEnlargement: true,
      })
      .webp({ quality: 85, alphaQuality: 100 })
      .toBuffer();
    const hash = createHash("sha256").update(foto).digest("hex").slice(0, 12);
    const destinazione = join(root, "public/img/configuratore", gruppo, id);
    await mkdir(destinazione, { recursive: true });
    const file = `${id}.${hash}.webp`;
    await writeFile(join(destinazione, file), foto);
    for (const vecchio of await readdir(destinazione))
      if (vecchio !== file && /\.[a-f0-9]{12}\.webp$/.test(vecchio))
        await rm(join(destinazione, vecchio));
    numero++;
    bytes += foto.length;
  }
console.log(
  `${numero} foto ottimizzate: ${(bytes / 1e6).toFixed(2)} MB. Originali conservati fuori da public/.`,
);
