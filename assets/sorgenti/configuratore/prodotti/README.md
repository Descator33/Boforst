# Foto per stato del configuratore

Una cartella per ogni stato visibile del prodotto durante la configurazione.
**La cartella è il contratto**: il prebuild la scansiona e genera
`lib/configuratore/foto-manifest.json`; il configuratore mostra la prima
immagine in ordine alfabetico. Per pubblicare una foto basta metterla nella
cartella giusta — nessun codice o JSON da modificare a mano, il nome del file
è libero. Cartella vuota = la UI ripiega sullo stato precedente o sul
placeholder tipografico.

**REGOLA ASSOLUTA: sfondo trasparente.** Solo PNG o WebP con canale alfa;
JPEG e formati senza alfa non entrano — il prebuild
(`scripts/valida-configuratore.mjs`) blocca il build se trova una foto
che non rispetta la regola.

I nomi delle cartelle vengono dai vocabolari di
`lib/configuratore/dati-dolci.json`, componenti separate da `--`. Dal
refactor 2026-08-28 il prodotto ha 4 componenti liberamente combinabili
(non più una lista di SKU dichiarate a mano), quindi gli stati possibili
sono 4 livelli di profondità:

1. `<base>` — la base semplice, senza farcitura né altro
   (es. `nuvola`) — 3 cartelle. Foto usata al passo 1 e sul banco.
2. `<base>--<farcitura>` — farcita
   (es. `nuvola--crema`) — fino a 9 cartelle. Foto del banco dopo la
   scelta della farcitura, prima della credenza.
3. `<base>--<farcitura>--<credenza>` — + la voce dalla credenza
   (es. `nuvola--crema--kinder-bueno`) — fino a 54 cartelle. Foto del
   banco dopo la scelta dalla credenza, prima della finitura.
4. `<base>--<farcitura>--<credenza>--<finitura>` — prodotto completo, è
   la SKU
   (es. `nuvola--crema--kinder-bueno--zucchero-a-velo`) — fino a 216
   cartelle. Foto del banco a configurazione completata.

Ogni combinazione dei 4 componenti è un prodotto valido (3 basi × 3
farciture × 6 voci di credenza × 4 finiture = 216): non c'è più una lista
chiusa di combinazioni da rispettare, la cartella si crea quando la foto
arriva, per qualunque combinazione.

Stessa inquadratura e stessa scala tra gli stati dello stesso prodotto.

Nota: le foto del vecchio modello (SKU a matrice chiusa, basi diverse da
Nuvola/Stella/Cuore) sono state spostate in
`_archivio/configuratore-vecchio-modello/` alla radice del repo — non sono
più usate ma non sono state cancellate.
