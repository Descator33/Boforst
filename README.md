# Delsigel — Configuratore (Boforst)

Sito standalone del configuratore dolci Delsigel, estratto dal sito vetrina
([Delsigel_V3](../Delsigel_V3) @ `b89eca7`). Una sola pagina in cinque lingue
(`/{it,en,fr,de,fi}/configuratore`), dataset SKU in
`lib/configuratore/dati-dolci.json`, foto in `public/img/configuratore/`.

## Comandi

```bash
npm install
npm run dev      # sviluppo
npm run build    # passa dal prebuild che valida il dataset SKU
```

## Deploy (Netlify)

- Il repository contiene `netlify.toml`: build `npm run build`, publish `.next`.
  Il lifecycle esegue anche `prebuild`, quindi un dataset o una foto non validi
  fermano il deploy.
- Node è fissato a 22 sia in `.nvmrc` sia in `engines` nel `package.json`.
- L'adapter OpenNext di Netlify viene applicato automaticamente: non installare
  o fissare manualmente `@netlify/plugin-nextjs`.
- In Netlify, impostare `NEXT_PUBLIC_SITE_URL` al dominio HTTPS definitivo
  (vedi `.env.example`); senza, canonical e hreflang puntano a
  `https://www.delsigel.it`.
- `NETLIFY_NEXT_SKEW_PROTECTION=true` è già dichiarato in `netlify.toml`
  per mantenere coerenti navigazione e Server Actions durante un nuovo deploy.
- Collegare il repository con production branch `main`; prima del cambio DNS,
  verificare almeno una Deploy Preview e il flusso quotazione in tutte le lingue.

## Da leggere prima di metterci mano

`docs/handoff-configuratore-standalone.md` — provenienza, invarianti del
dataset e delle foto, lavori rimandati (brand Boforst su header/footer,
invio email reale al posto del `mailto:`, sfoltimento dizionari).
