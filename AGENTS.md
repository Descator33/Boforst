# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may
all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation
notices. (Es.: il middleware si chiama `proxy.ts`, non `middleware.ts`; i tipi
`PageProps`/`LayoutProps` sono globali generati dal typegen.)

# Questo progetto

Sito standalone del configuratore Delsigel (progetto «Boforst»), estratto da
Delsigel_V3 (`b89eca7`, 2026-08-28). Una pagina sola: il configuratore dolci,
in cinque lingue sotto `/[lang]`, deploy su Vercel.

Leggi `docs/handoff-configuratore-standalone.md` prima di toccare dataset,
foto o i18n. Gli invarianti in breve:

- **Gli id SKU sono segmenti URL e nomi delle cartelle foto** — restano in
  italiano in tutte le lingue; rinominare una base senza rinominare la sua
  cartella in `public/img/configuratore/` fa sparire la foto in silenzio.
- **Foto: solo webp/png con canale alfa, scontornate** — il prebuild
  (`scripts/valida-configuratore.mjs`) rifiuta i JPEG e blocca il build se il
  dataset (`lib/configuratore/dati-dolci.json`) non chiude.
- **Farciture/topping nuovi vanno aggiunti ai dizionari** (`lib/i18n/dizionari/`,
  sezione `prodotti`): i `Record` tipizzati fanno segnalare le voci mancanti
  al compilatore.
- **Lo stato vive nell'URL** (`/{lang}/configuratore/{base}/{farcitura}`),
  non in React state: niente store.
- Il form quotazione oggi genera un `mailto:` (provvisorio, vedi
  `app/configuratore/actions.ts`): l'invio reale va collegato quando il
  cliente decide il destinatario.
