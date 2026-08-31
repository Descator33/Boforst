# Foto delle voci "dalla credenza" (l'ingrediente da solo)

Una cartella per voce, nome = `id` del vocabolario `credenza` in
`lib/configuratore/dati-dolci.json` (`kinder-bueno`, `cioccolato-a-pezzi`,
`corn-flakes`, `fragola`, `banana`, `biscotti`). **La cartella è il
contratto**, come per `../prodotti/`, `../farciture/` e `../finiture/`: il
configuratore la scansiona da solo (`lib/configuratore/foto.ts`) e mostra
la prima immagine in ordine alfabetico. Per pubblicare una foto basta
metterla nella cartella giusta, il nome del file è libero. Cartella vuota
= la tessera ripiega sul placeholder tipografico.

Qui sta l'ingrediente **da solo** (il pezzo di Kinder Bueno, i corn
flakes, la fetta di banana): è l'immagine delle tessere del passo 3, la
cosa che si trascina sul dolce farcito. Il dolce con la credenza applicata
— la foto dello stato `<base>--<farcitura>--<credenza>` in
`../prodotti/` — compare sul banco solo dopo il rilascio: sulla tessera
non va mai, mostrerebbe il risultato prima del gesto.

**REGOLA ASSOLUTA: sfondo trasparente.** Solo PNG o WebP con canale
alfa; il prebuild (`scripts/valida-configuratore.mjs`) blocca il build
se trova una foto che non rispetta la regola, o una cartella che non
corrisponde a nessuna voce del vocabolario.
