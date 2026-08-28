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

## Deploy (Vercel)

- Next 16 riconosciuto in automatico; `npm run build` esegue il lifecycle
  `prebuild` → un dataset rotto ferma il deploy.
- Node fissato a 22 via `engines` nel package.json.
- Env: `NEXT_PUBLIC_SITE_URL` col dominio definitivo (vedi `.env.example`);
  senza, canonical e hreflang puntano a www.delsigel.it.

## Da leggere prima di metterci mano

`docs/handoff-configuratore-standalone.md` — provenienza, invarianti del
dataset e delle foto, lavori rimandati (brand Boforst su header/footer,
invio email reale al posto del `mailto:`, sfoltimento dizionari).
