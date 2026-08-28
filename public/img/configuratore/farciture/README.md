# Foto delle farciture (l'ingrediente da solo)

Una cartella per farcitura, nome = `id` del vocabolario `farciture` in
`lib/configuratore/dati-dolci.json`. **La cartella è il contratto**,
come per `../prodotti/` e `../topping/`: il configuratore la scansiona da solo
(`lib/configuratore/foto.ts`) e mostra la prima immagine in ordine
alfabetico. Per pubblicare una foto basta metterla nella cartella
giusta, il nome del file è libero. Cartella vuota = la tessera ripiega
sul placeholder tipografico — mai sulla foto del semiprodotto.

Qui sta la farcitura **da sola** (il ciuffo di crema, la composta, le
scaglie): è l'immagine delle tessere del passo 2, la cosa che si
trascina sulla base. Il dolce farcito — la foto dello sku in
`../prodotti/<base>--<farcitura>/` — compare sul banco solo dopo il
rilascio: sulla tessera non va mai, mostrerebbe il risultato prima del
gesto.

`senza-farcitura/` esiste per completezza del vocabolario ma resterà
tipografica: non c'è un ingrediente da fotografare.

**REGOLA ASSOLUTA: sfondo trasparente.** Solo PNG o WebP con canale
alfa; il prebuild (`scripts/valida-configuratore.mjs`) blocca il build
se trova una foto che non rispetta la regola, o una cartella che non
corrisponde a nessuna farcitura del vocabolario.
