/** Download condivisi senza conservare tutte le immagini decodificate in RAM. */
const scaricate = new Map<string, Promise<void>>();
export function scaricaFoto(url: string): Promise<void> {
  const presente = scaricate.get(url);
  if (presente) return presente;
  const richiesta = fetch(url, {
    cache: "force-cache",
    signal: AbortSignal.timeout(15000),
  })
    .then(async (r) => {
      if (!r.ok) throw new Error("image");
      await r.arrayBuffer();
    })
    .catch((e) => {
      scaricate.delete(url);
      throw e;
    });
  scaricate.set(url, richiesta);
  return richiesta;
}
export async function preparaFoto(url: string): Promise<void> {
  await scaricaFoto(url);
  const img = new Image();
  img.src = url;
  await img.decode();
}
