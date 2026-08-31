# Foto delle finiture (il topping da solo)

Una cartella per topping, nome = `id` del vocabolario `topping` in
`lib/configuratore/dati-dolci.json`. **La cartella è il contratto**,
come per `../prodotti/` e `../farciture/`: il configuratore la scansiona
da solo (`lib/configuratore/foto.ts`) e mostra la prima immagine in
ordine alfabetico. Per pubblicare una foto basta metterla nella cartella
giusta, il nome del file è libero. Cartella vuota = la tessera ripiega
sul placeholder tipografico.

Qui sta la finitura **da sola** (la nevicata di zucchero a velo, le
perle, le scagliette): è l'immagine della tessera del passo 3, la cosa
che si trascina sul dolce farcito. Il prodotto completo — la foto in
`../prodotti/<base>--<farcitura>--<topping>/` — compare sul banco solo
dopo il rilascio: sulla tessera non va mai, mostrerebbe il risultato
prima del gesto.

**REGOLA ASSOLUTA: sfondo trasparente.** Solo PNG o WebP con canale
alfa; il prebuild (`scripts/valida-configuratore.mjs`) blocca il build
se trova una foto che non rispetta la regola, o una cartella che non
corrisponde a nessun topping del vocabolario.
