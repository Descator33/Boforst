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
foto o i18n (è il verbale storico dell'estrazione; catalogo e pipeline attuali sono
descritti qui e nel README). Gli invarianti in breve:

- **Catalogo attuale: matrice chiusa del 2026-10-22, 26 ricette Nuvola.**
  Base, farcitura, credenza e finitura restano i quattro componenti, ma sono
  valide solo le ricette in `combinazioni`. Nuvola e zucchero a velo sono
  uniche e vengono incluse automaticamente. Il vecchio modello aperto a
  216 combinazioni è storico, non il contratto attuale.
- **Gli id SKU sono segmenti URL e nomi delle cartelle foto** — restano in
  italiano in tutte le lingue; rinominare una base/farcitura/voce di
  credenza/finitura senza rinominare le sue cartelle in
  `assets/sorgenti/configuratore/` interrompe la generazione e il build. URL a 4
  segmenti: `/{lang}/configuratore/{base}/{farcitura}/{credenza}/{finitura}`.
- **Foto: solo webp/png con canale alfa, scontornate** — il prebuild
  (`scripts/prepara-foto.mjs` + `scripts/valida-configuratore.mjs`) ottimizza
  gli originali in `assets/sorgenti/configuratore/` e blocca foto mancanti,
  immagini senza trasparenza o dataset non coerenti. In `public/` solo
  WebP attivi con hash e manifest aggiornato.
- **Grammatura/peso/ordine minimo vivono sulla base**, non sulla singola
  combinazione. I valori Nuvola sono confermati; ordine minimo da confermare.
  Farcitura/credenza/finitura sono compositive, non cambiano la logistica.
- **Farciture/voci di credenza/finiture nuove vanno aggiunte ai dizionari**
  (`lib/i18n/dizionari/`, sezione `prodotti`): i `Record` tipizzati fanno
  segnalare le voci mancanti al compilatore.
- **Lo stato vive nell'URL** (`/{lang}/configuratore/{base}/{farcitura}/{credenza}/{finitura}`),
  non in React state: niente store. `?modifica=N` apre un componente e
  conserva gli altri se compatibili.
- Quotazioni a `info@delsigel.it` tramite Resend, attivo solo con
  `RESEND_API_KEY` e `QUOTAZIONI_FROM` server-side. Ripiego `mailto:` esplicito
  se non configurato. Nessun invio reale nei test: usare il mock di `fetch`.
- Per indicazione del cliente non aggiungere per ora dati societari o link
  privacy; non inventare il dominio. Senza `NEXT_PUBLIC_SITE_URL`, nessun
  canonical/hreflang verso un dominio di fallback.
