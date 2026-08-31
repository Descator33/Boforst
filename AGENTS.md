# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may
all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation
notices. (Es.: il middleware si chiama `proxy.ts`, non `middleware.ts`; i tipi
`PageProps`/`LayoutProps` sono globali generati dal typegen.)

# Questo progetto

Sito standalone del configuratore Delsigel (progetto «Boforst»), estratto da
Delsigel_V3 (`b89eca7`, 2026-08-28). Una pagina sola: il configuratore dolci,
in cinque lingue sotto `/[lang]`, deploy su Netlify.

Leggi `docs/handoff-configuratore-standalone.md` prima di toccare dataset,
foto o i18n (è un verbale storico dell'estrazione e del modello *originale*
a matrice chiusa: il refactor 2026-08-28 descritto sotto lo ha superato, ma
resta la memoria di dove viene il codice). Gli invarianti in breve:

- **Il prodotto ha 4 componenti indipendenti, tutti a scelta singola e
  obbligatoria: base, farcitura, dalla credenza, finitura.** Dal refactor
  2026-08-28 ogni combinazione è una SKU valida (prodotto cartesiano aperto,
  3×3×6×4 = 216) — non più una lista di 32 combinazioni dichiarate a mano.
  La finitura è una scelta come le altre tre, non più derivata dalla coppia
  (base, farcitura).
- **Gli id SKU sono segmenti URL e nomi delle cartelle foto** — restano in
  italiano in tutte le lingue; rinominare una base/farcitura/voce di
  credenza/finitura senza rinominare le sue cartelle in
  `public/img/configuratore/` fa sparire la foto in silenzio. URL a 4
  segmenti: `/{lang}/configuratore/{base}/{farcitura}/{credenza}/{finitura}`.
- **Foto: solo webp/png con canale alfa, scontornate** — il prebuild
  (`scripts/valida-configuratore.mjs`) rifiuta i JPEG e blocca il build se il
  dataset (`lib/configuratore/dati-dolci.json`) non chiude.
- **Grammatura/peso/ordine minimo vivono sulla base**, non sulla singola
  combinazione: con 216 combinazioni aperte non sono curabili SKU per SKU.
  Farcitura/credenza/finitura sono compositive, non cambiano la logistica.
- **Farciture/voci di credenza/finiture nuove vanno aggiunte ai dizionari**
  (`lib/i18n/dizionari/`, sezione `prodotti`): i `Record` tipizzati fanno
  segnalare le voci mancanti al compilatore.
- **Lo stato vive nell'URL** (`/{lang}/configuratore/{base}/{farcitura}/{credenza}/{finitura}`),
  non in React state: niente store.
- Il form quotazione oggi genera un `mailto:` (provvisorio, vedi
  `app/configuratore/actions.ts`): l'invio reale va collegato quando il
  cliente decide il destinatario.
