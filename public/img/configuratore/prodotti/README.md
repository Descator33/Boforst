# Foto per stato del configuratore

Una cartella per ogni stato visibile del prodotto durante la configurazione.
**La cartella è il contratto**: il configuratore la scansiona da solo
(`lib/configuratore/foto.ts`) e mostra la prima immagine in ordine
alfabetico. Per pubblicare una foto basta metterla nella cartella giusta —
nessun codice o JSON da toccare, il nome del file è libero. Cartella
vuota = la UI ripiega sullo stato precedente o sul placeholder tipografico.

**REGOLA ASSOLUTA: sfondo trasparente.** Solo PNG o WebP con canale alfa;
JPEG e formati senza alfa non entrano — il prebuild
(`scripts/valida-configuratore.mjs`) blocca il build se trova una foto
che non rispetta la regola.

I nomi delle cartelle vengono da `lib/configuratore/dati-dolci.json`,
componenti separate da `--`:

1. `<base>` — la base semplice, senza farcitura né topping
   (es. `nuvola`) — 10 cartelle. Foto usata al passo 1 e sul banco.
2. `<base>--<farcitura>` — farcito, senza topping; è il campo `sku`
   (es. `nuvola--ciock-e-lampone`) — 32 cartelle. Foto usata SOLO sul
   banco, dopo il rilascio della farcitura e prima del gesto della
   finitura: le tessere del passo 2 mostrano l'ingrediente da solo
   (vedi `../farciture/`), mai il semiprodotto.
3. `<base>--<farcitura>--<topping>` — prodotto completo, `sku` + `--` +
   campo `topping`
   (es. `nuvola--ciock-e-lampone--zucchero-a-velo-idrorepellente`) —
   32 cartelle. Foto del banco a finitura applicata.

Stessa inquadratura e stessa scala tra gli stati dello stesso prodotto.

Nota: i campi `immagine` rimasti in `dati-dolci.json` sono un residuo
della trascrizione e non vengono letti; la vecchia cartella `../basi/`
non esiste più (gli scontorni sono confluiti qui).
