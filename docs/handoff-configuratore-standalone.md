# Handoff — Configuratore standalone (nuovo sito, deploy Vercel)

> Questo documento è il ponte tra Delsigel_V3 e il nuovo progetto che conterrà
> **solo il configuratore**, su dominio dedicato e con SKU leggermente diverse.
> Copialo nel nuovo repo al primo commit: è la memoria di dove viene il codice
> e di quali regole non vanno rotte.

## Provenienza

- Repo sorgente: `/Users/davide/Dev/Delsigel_V3`
- Commit di estrazione: `b89eca723b6074c2e0adfab39281ff641d1faca0` (2026-08-28)
- Ricognizione completa di estraibilità fatta il 2026-08-28 (assessment quotato e
  accettato dal cliente).

## Cosa portare (elenco minimo)

Codice e dati:

```
app/[lang]/configuratore/[[...scelta]]/page.tsx   la route (unica)
app/configuratore/actions.ts                      Server Action quotazione (vedi «Lavori dopo la copia»)
components/configuratore/                         15 file, ~2.800 righe — il cuore
components/LinguaProvider.tsx                     richiesto da 14 componenti su 15
lib/configuratore.ts                              modello + logica pura
lib/configuratore/foto.ts                         scansione cartelle foto (solo server)
lib/configuratore/dati-dolci.json                 ← LA fonte SKU: qui si fanno le modifiche
lib/i18n/{tipi,dizionario,interpola,lingue,sito}.ts + dizionari/   (da sfoltire)
scripts/valida-configuratore.mjs                  prebuild: protegge il dataset
public/img/configuratore/                         17 MB, 71 webp/png + 3 README (contratto naming)
public/configuratore-dolci-spec-tecnica.md        fonte normativa del dataset
docs/configuratore-dolci-progettazione-logica.md  razionale del modello dati
proxy.ts                                          SOLO se il nuovo sito resta multilingua
```

Scaffolding (copiare da questo repo, non rigenerare con create-next-app, perché
le versioni sono bloccate):

```
tsconfig.json  postcss.config.mjs  eslint.config.mjs
next.config.ts        tenerne solo images.deviceSizes/qualities; il blocco
                      headers() riguarda la hero e va tolto
app/fonts.ts          ridotto a: Archivo, Space Mono, Caveat
package.json          nuovo, con SOLO: motion, next 16.2.10 (esatta), react e
                      react-dom 19.2.4, tailwind 4 + @tailwindcss/postcss,
                      typescript, eslint + eslint-config-next 16.2.10, sharp
                      (serve al prebuild per la verifica alfa).
                      Mantenere lo script "prebuild": node scripts/valida-configuratore.mjs
```

Comando di semina (da lanciare dalla radice di Delsigel_V3, destinazione la
nuova cartella; le parentesi quadre vanno quotate in zsh):

```bash
rsync -avR \
  "app/[lang]/configuratore/" \
  app/configuratore/actions.ts \
  components/configuratore/ \
  components/LinguaProvider.tsx \
  lib/configuratore.ts \
  lib/configuratore/ \
  lib/i18n/ \
  scripts/valida-configuratore.mjs \
  "public/img/configuratore/" \
  public/configuratore-dolci-spec-tecnica.md \
  docs/configuratore-dolci-progettazione-logica.md \
  docs/handoff-configuratore-standalone.md \
  proxy.ts \
  ../NUOVA_CARTELLA/
```

Primo commit consigliato: `Estratto configuratore da Delsigel_V3 @ b89eca7`.

## Cosa NON portare

- `components/Header.tsx`, `Footer.tsx`, `Preloader*` — sono cornice del sito
  vetrina e tirano dentro GSAP, three.js, lucide, MenuStato. Sul nuovo dominio
  servono header/footer nuovi e minimi.
- Dipendenze: gsap, @gsap/react, three, lenis, embla, radix, vaul, lucide-react.
  Il configuratore usa solo `motion`.
- `netlify.toml` — il nuovo deploy è su Vercel.
- `backup-foto-configuratore*` (gitignored) — materiale di lavorazione, non asset.
- La regola CSS `.configuratore-page > header` (stila l'header del sito vecchio).

## Lavori dopo la copia

1. **CSS** (~½ g): estrarre da `app/globals.css` (4.199 righe) i blocchi del
   configuratore — righe ~1669–3388 al commit di estrazione («Configuratore: il
   palco» e «Configuratore 2026-08-21 — direzione candy cream») — più il blocco
   `:root` delle variabili (righe 8–61) e il blocco `@theme inline` di
   Tailwind 4 (che espone `bg-panna`, `rounded-palco`, ecc.).
2. **i18n** (~1–2 g): decidere le lingue col cliente. Monolingua → tenere
   `LinguaProvider` con il solo `it.ts` sfoltito (sezioni `configuratore`,
   `prodotti`, `metadata.configuratore`) e togliere `proxy.ts` e `[lang]`.
   Multilingua → portare i 5 dizionari sfoltiti + `proxy.ts`. In nessun caso
   rimuovere il provider: costa più di quanto rende.
3. **Header/footer nuovi**: la pagina monta `<Header/>`/`<Footer/>` in
   `page.tsx` — sostituire con la cornice del nuovo brand/dominio.
4. **Invio quotazioni**: `actions.ts` oggi termina in un `mailto:` verso
   info@delsigel.it (dichiarato provvisorio). Sul dominio dedicato va sostituito
   con invio reale: il pattern è in `lib/contatti/consegna.ts` (Resend) del repo
   sorgente. Richiede `RESEND_API_KEY` + mittente sul nuovo dominio (SPF/DKIM).
5. **SKU**: modificare `lib/configuratore/dati-dolci.json` e far girare
   `npm run build` — il prebuild valida tutto e blocca se i conti non chiudono.

## Invarianti da non rompere

- **Gli id delle SKU sono segmenti URL e nomi delle cartelle foto.** Restano in
  italiano in tutte le lingue. Rinominare una base senza rinominare la sua
  cartella in `public/img/configuratore/` fa sparire la foto in silenzio (la UI
  ripiega, non si rompe: il difetto non si vede in build).
- **Foto: solo webp/png con canale alfa, scontornate.** Il prebuild rifiuta i
  JPEG e verifica l'alfa dentro i file. Una per variante, solo relight, zero
  styling aggiunto (preferenza cliente consolidata).
- **Ogni farcitura/topping nuovo va aggiunto ai dizionari** (`prodotti.farciture`
  / `prodotti.topping`): `IdFarcitura` e `IdTopping` sono `Record` tipizzati, il
  compilatore segnala le voci mancanti.
- **Il topping non si sceglie**: è derivato dalla coppia (base, farcitura). La
  matrice è chiusa: 32 SKU dichiarate, non un prodotto cartesiano.
- **Lo stato del configuratore vive nell'URL** (`/{configuratore}/{base}/{farcitura}`,
  avanzamento con `history.pushState`), non in React state: non introdurre store.

## Deploy Vercel

- Next 16.2.10 viene riconosciuto da solo; il build command di default
  (`npm run build`) passa dal lifecycle `prebuild` → la validazione dataset
  ferma il deploy se il JSON è rotto, come oggi su Netlify. Non serve config.
- Fissare **Node 22** (Project Settings → Node.js Version, o `"engines"` nel
  package.json): Next 16 vuole ≥ 20.9 e il default di piattaforma cambia nel
  tempo.
- Niente `vercel.json` necessario all'inizio. `proxy.ts` (il middleware di
  Next 16) gira su Vercel senza modifiche.
- Env vars: nessuna finché non si collega Resend; poi `RESEND_API_KEY` +
  mittente/destinatario.
- SEO: due domini con configuratore quasi identico si cannibalizzano — decidere
  canonical/differenziazione quando il dominio è noto.

## AGENTS.md per il nuovo repo (copiare tal quale)

```markdown
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may
all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation
notices. (Es.: il middleware si chiama `proxy.ts`, non `middleware.ts`.)

# Questo progetto

Sito standalone del configuratore Delsigel, estratto da Delsigel_V3
(`b89eca7`). Leggi `docs/handoff-configuratore-standalone.md` prima di toccare
dataset, foto o i18n: lì ci sono gli invarianti (SKU = URL = cartelle foto,
webp con alfa, prebuild di validazione, dizionari tipizzati).
```
