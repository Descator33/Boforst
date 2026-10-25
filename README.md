# Delsigel — Configuratore Boforst

Configuratore standalone Next.js 16.2.10, in italiano, inglese, francese,
tedesco e finlandese. Il catalogo attuale (2026-10-22) contiene 26 ricette
chiuse: base Nuvola, due farciture, ingredienti compatibili e zucchero a velo.
I documenti dell'estrazione conservano il vecchio modello; non sono il listino attuale.

## Sviluppo e controlli

Node 22. `npm install`, poi `npm run foto` e `npm run dev`.

- `npm test`: ricette, compatibilità, quantità, validazione e trasporto email simulato.
- `npm run lint`: ESLint.
- `npm run build`: ottimizza le foto, verifica matrice e copertura fotografica, compila Next.

## Immagini

Gli originali sono in `assets/sorgenti/configuratore/`, nelle cartelle
`prodotti/<stato>/`, `farciture/<id>/`, `credenza/<id>/`, `finiture/<id>/`.
Solo PNG/WebP con trasparenza effettiva. Ogni SKU e ogni stato intermedio
devono avere una foto, così come ogni ingrediente.

`npm run foto` genera solo gli asset attivi in `public/img/configuratore/`:
WebP, massimo 1000 px per il prodotto e 640 px per gli ingredienti, qualità 85.
Il nome contiene l'hash del contenuto per una cache lunga e sicura ai deploy.
Il manifest di soli URL resta in `lib/configuratore/foto-manifest.json`.
Originali, materiali storici e foglio Excel restano fuori da `public/`.
I PNG GPT delle tessere sono documentati in `docs/foto-tessere-gpt-2026-10-25.md`.

All'ingresso il browser scarica il catalogo con quattro richieste concorrenti,
mostrando avanzamento reale, riprova e possibilità di continuare. Non mantiene
tutte le immagini decodificate in memoria. Ogni nuova foto del dolce viene
preparata prima di cambiare configurazione; le transizioni non aspettano voli decorativi.

## Stato e navigazione

L'URL contiene sempre gli id italiani, anche nelle altre lingue:
`/{lang}/configuratore/{base}/{farcitura}/{credenza}/{finitura}`.
`?modifica=2` o `?modifica=3` apre un componente conservando la ricetta.
Le scelte successive rimangono se compatibili; quelle uniche vengono incluse.
Back/Forward continua a usare la history nativa di Next. Nessuno store di ricette.

Grammatura 70 g, diametro 9,5 cm, 30 pezzi/cartone, 112 cartoni/pedana e
235,2 kg/pedana confermati dal cliente il 2026-10-25. Ordine minimo da confermare.
Ingredienti, allergeni e schede tecniche non vengono inventati: l'interfaccia
permette di richiederli al commerciale indicando la SKU.

## Quotazioni e Resend

Destinatario confermato: `info@delsigel.it`. La Server Action rivalida sempre
ricetta, listino, quantità, email, canale e limiti dei campi.

Per attivare l'invio reale:

1. Creare l'account Resend e verificare il dominio mittente aggiungendo i record DNS indicati dal servizio.
2. Creare una chiave con permesso di invio limitato al dominio scelto.
3. Impostare in Netlify `RESEND_API_KEY` e `QUOTAZIONI_FROM` (mittente del dominio verificato).
4. Fare un test concordato di consegna e risposta prima del rilascio.

Nessuna chiave entra nel client. Il Reply-To è l'email del buyer. L'invio usa
un identificatore stabile e l'hash del contenuto, per poter riprovare senza duplicati
entro la finestra di idempotenza di Resend. Un errore non viene presentato come successo.
Senza credenziali il sito dichiara esplicitamente che l'invio dal sito non è attivo
e offre la richiesta precompilata nell'app di posta. Anche dopo la preparazione
si possono modificare i dati; cambiando quantità, la richiesta viene rivalidata.

## Deploy e dominio

Netlify: build `npm run build`, output `.next`; adapter automatico e Node 22.
`NETLIFY_NEXT_SKEW_PROTECTION=true` è dichiarato in `netlify.toml`.

`NEXT_PUBLIC_SITE_URL` è opzionale finché il dominio non viene deciso.
Senza valore non si pubblicano canonical/hreflang verso il sito aziendale.
Quando sarà noto, impostare il dominio HTTPS definitivo nelle variabili del deploy.
Per indicazione del cliente, non sono stati aggiunti dati societari o link privacy.
