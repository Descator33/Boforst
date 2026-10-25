# Foto delle finiture (la finitura da sola)

Una cartella per finitura, nome = `id` del vocabolario `finiture` in
`lib/configuratore/dati-dolci.json` (`zucchero`, `zucchero-a-velo`,
`zucchero-di-canna`, `cacao`). **La cartella è il contratto**, come per
`../prodotti/`, `../farciture/` e `../credenza/`: il prebuild la scansiona,
aggiorna `lib/configuratore/foto-manifest.json` e il configuratore mostra la
prima immagine in ordine alfabetico. Per pubblicare una foto basta metterla
nella cartella giusta, il nome del file è libero. Cartella vuota = la tessera
ripiega sul placeholder tipografico.

Qui sta la finitura **da sola** (la nevicata di zucchero a velo, lo
zucchero di canna, il cacao): è l'immagine della tessera del passo 4, la
cosa che si trascina sul dolce farcito. Il prodotto completo — la foto
dello stato `<base>--<farcitura>--<credenza>--<finitura>` in
`../prodotti/` — compare sul banco solo dopo il rilascio: sulla tessera
non va mai, mostrerebbe il risultato prima del gesto.

Dal refactor 2026-08-28 la finitura è una scelta come le altre tre (prima
era determinata dalla combinazione base+farcitura e mai scelta
dall'utente): questa cartella sostituisce la vecchia `../topping/`
(archiviata, non cancellata, in `_archivio/configuratore-vecchio-modello/`).

**REGOLA ASSOLUTA: sfondo trasparente.** Solo PNG o WebP con canale
alfa; il prebuild (`scripts/valida-configuratore.mjs`) blocca il build
se trova una foto che non rispetta la regola, o una cartella che non
corrisponde a nessuna finitura del vocabolario.
