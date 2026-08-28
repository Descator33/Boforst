# Configuratore Dolci — Progettazione logica

Documento di brainstorming architetturale per la sub-page configuratore del sito Delsigel (Next.js 16.2.10, App Router). Fonti normative: `public/configuratore-dolci-spec-tecnica.md` **(seconda revisione: integra packaging strutturato, configurazione pedane e ordine minimo)** e `public/configuratore-dolci.json` (32 SKU). Convenzioni verificate su `node_modules/next/dist/docs/` come richiesto da `AGENTS.md`. Le cinque asserzioni della spec e le coerenze aritmetiche del dataset (pesi derivati, `ordine_minimo_pezzi`, catene di packaging) sono state riverificate programmaticamente sul JSON consegnato: passano tutte.

**Cambio di natura introdotto dalla revisione 2:** 12 pedane sono 34.000–48.000 pezzi, cioè 1,9–3 tonnellate. Il configuratore non è un carrello, è la preparazione di una richiesta industriale. L'unità di lavoro è la **pedana** (dichiarata nel dataset: `unita_quantita: "pedane"`, intera, mai frazionaria); pezzi, cartoni e chilogrammi sono traduzioni informative calcolate in tempo reale.

## (a) Sintesi delle scelte raccomandate

1. Route unica `app/configuratore/[[...scelta]]/page.tsx` (optional catch-all): copre `/configuratore`, `/configuratore/{base}`, `/configuratore/{base}/{farcitura}` con un solo punto di parsing e validazione; tutte le 44 varianti (1+11+32) prerenderizzate con `generateStaticParams`.
2. Pagina server sottile che valida i segmenti e passa lo stato iniziale a un'unica isola client `Configuratore.tsx` (pattern `Experience.tsx`); navigazione interna con `window.history.pushState` (shallow routing documentato in Next 16) sincronizzato con `usePathname`.
3. Lo stato prodotto vive nell'URL, che rende **irrappresentabili** gli stati illegali: la farcitura esiste solo come secondo segmento sotto la sua base, quindi "cambiare base azzera la farcitura" è un vincolo strutturale, non una regola da ricordare.
4. Dataset importato staticamente da `lib/configuratore/` (mai fetch da `public/`); le **5 funzioni pure** (le 4 precedenti + `quantita` per la conversione lungo la catena logistica) in `lib/configuratore.ts`, separate da `lib/catalog.ts`; le **5 asserzioni** (3 delle leggi + 2 di coerenza packaging) in `scripts/valida-configuratore.mjs` agganciate come `prebuild`.
5. Passo 3 in tre blocchi: rivelazione della finitura, **scala del formato** (catena logistica a 3 o 4 livelli, mai inventando il vassoio dove non c'è), campo quantità in **pedane intere** con traduzione live in cartoni/pezzi/kg e vincolo di minimo dichiarato prima, non bloccante fino all'invio.
6. Sotto il minimo non si nega: si **devia** verso il contatto commerciale (l'agente di zona, se la ricerca agente esisterà).
7. Invio quotazione via **Server Action** (`app/configuratore/actions.ts`, `useActionState`), che riesegue `validaStato` e confronta `versione_listino`; il payload porta le quantità già convertite in tutte le unità.
8. Salto automatico del passo 2 risolto a livello di history: per le basi a farcitura unica si fa **un solo push** da `/configuratore` all'URL completo, così il Back torna sempre al passo 1.
9. **Blocco pre-implementazione:** l'ambiguità sull'ordine minimo (per SKU, per base o per ordine complessivo) va risolta con Delsigel **prima** di scrivere la validazione della quantità — è l'unica domanda del progetto in cui una risposta sbagliata produce un ordine sbagliato.

---

## (b) Le aree, con opzioni e trade-off

### 1. Architettura della pagina e routing

**Dove vive la pagina.** Opzioni:

- **A. `/configuratore`** — coerente con l'alberatura piatta esistente (`/`, `/chi-siamo`, `/contatti`; non esiste una pagina `/dolci`, solo l'ancora `/#dolci` in home).
- **B. `/dolci/configuratore`** — presuppone una sezione `/dolci` che oggi non esiste; creerebbe un genitore vuoto.
- **C. `/configuratore/dolci/...`** — future-proof per la linea salati (il dataset dichiara `"linea": "dolci"`), ma allunga ogni URL condiviso per un futuro ipotetico.

**Raccomandazione: A**, con una nota di estensibilità verificata sulle docs: in Next i segmenti letterali hanno precedenza su quelli dinamici, quindi se un giorno arrivasse un configuratore salati basterà aggiungere la cartella letterale `app/configuratore/salati/` accanto al catch-all, senza rompere i link dolci già condivisi (nessuna base si chiama "salati"). La voce "Configuratore" si aggiunge all'array di navigazione in `components/Header.tsx`.

**Come portare lo stato nell'URL.** Opzioni:

- **A. Route dinamiche annidate** `app/configuratore/page.tsx` + `[base]/page.tsx` + `[base]/[farcitura]/page.tsx` — tre pagine, tre punti di parsing, logica di validazione triplicata o estratta a fatica; ogni passaggio di passo è una navigazione RSC completa.
- **B. Query string** `/configuratore?base=nuvola&farcitura=ciock-e-lampone` — funziona, ma: `searchParams` opta la pagina nel dynamic rendering (verificato in `03-layouts-and-pages.md`), `useSearchParams` richiede un boundary `Suspense` nelle route prerenderizzate (`use-search-params.md`), e l'URL è meno leggibile/spedibile del path proposto dalla spec (`/configuratore/nuvola/ciock-e-lampone`).
- **C. Optional catch-all** `app/configuratore/[[...scelta]]/page.tsx` — un solo file di pagina per i tre livelli, `params` è `{ scelta?: string[] }` (convenzione `[[...folderName]]` verificata in `dynamic-routes.md`); una sola funzione `parseScelta(scelta)` decide passo di atterraggio, stato iniziale e casi limite.
- **D. Stato solo client + History API** — URL aggiornato a mano senza route dinamica; perde il rendering server dei deep link (il buyer che apre il link del collega riceverebbe una pagina generica) e la metadata per combinazione.

**Raccomandazione: C, con la tecnica di D per la navigazione interna.** Il catch-all opzionale dà il deep link server-renderizzato; una volta idratata, l'isola client avanza tra i passi con `window.history.pushState`, che in Next 16 è integrato nel router e si sincronizza con `usePathname` (sezione "Shallow routing on the client" di `02-guides/single-page-applications.md`): zero round-trip server tra un passo e l'altro, coerente con la spec ("non serve nessuna chiamata al server per navigare"). Lo stato del passo si **deriva** sempre dal pathname: una sola sorgente di verità, e il Back/Forward del browser funziona gratis.

**Ingresso pre-qualificato dalla tessera del catalogo.** La CTA delle card dolci in `components/Tile.tsx` (oggi `Richiedi → /contatti`) diventa/affianca `Configura → /configuratore/{base}`: si atterra al passo 2 con il passo 1 mostrato come completato e riapribile, come da spec. **Attenzione, punto di integrazione reale trovato nel repo:** gli slug di `lib/catalog.ts` non coincidono con gli id del dataset — `bomba-fritta` vs `bomba`/`bomba-super`, `frittella` vs `frittelline`, `lusekatt` (una "s") vs `lussekatt`, e `intriko-midi` non esiste proprio nel catalogo home. Serve una mappa esplicita `TESSERA_A_BASE` in `lib/configuratore.ts` (con `null` per le tipologie non configurabili), non un'assunzione di uguaglianza degli slug.

**Server vs client rendering.** `next.config.ts` è vuoto: `cacheComponents` **non** è attivo, quindi vale il modello classico (guida `caching-without-cache-components.md`): le route statiche si prerenderizzano al build. Con `generateStaticParams` che enumera le 44 combinazioni di path valide (radice, 11 basi, 32 SKU — poche e chiuse per la prima legge), ogni deep link è HTML statico completamente prefetchabile (`04-linking-and-navigating.md`: "Static Route: the full route is prefetched"). Il componente pagina resta server (parsing, `generateMetadata` per SKU — 32 pagine prodotto indicizzabili in regalo), tutta l'interazione sta nell'isola client, come già fa il repo (pagina server sottile `app/page.tsx` → `Experience.tsx` client). Nota Next 16 da rispettare: `params` è una **Promise** (`await params` o `use(params)`), e il tipo si prende dal helper globale `PageProps<'/configuratore/[[...scelta]]'>`.

### 2. Modello di stato

**La macchina.** Stato prodotto: `{ base, farcitura }` — vive nel pathname. Stato di sessione: `{ pedane, vista }` — vive nell'isola client. Passi derivati, mai memorizzati:

- `/configuratore` → passo 1
- `/configuratore/{base}` → passo 2 (base valida, farcitura null)
- `/configuratore/{base}/{farcitura}` → passo 3 (SKU risolto)
- esito/riepilogo → vista client sopra l'URL completo (vedi area 6)

**Transizioni:**

| Evento | Effetto su URL | Effetto su stato client |
| --- | --- | --- |
| Scegli base (farciture > 1) | `push /configuratore/{base}` | pedane azzerate (nuovo prodotto) |
| Scegli base (farcitura unica) | `push /configuratore/{base}/{unica}` (un solo push) | farcitura preselezionata, badge "già decisa" |
| Scegli farcitura | `push /configuratore/{base}/{farcitura}` | — |
| Cambia base dal riepilogo | `push /configuratore/{nuovaBase}` | farcitura azzerata **per costruzione dell'URL** |
| Cambia farcitura dal riepilogo | `push /configuratore/{base}` oppure push diretto della nuova | pedane azzerate |
| Back del browser | pop → passo derivato dal pathname | ricalcolo puro |

La regola "cambiare base azzera la farcitura" non è codice: è la forma dell'URL. Non esiste un modo di rappresentare una farcitura senza la sua base, quindi non esiste il bug. L'azzeramento delle pedane al cambio prodotto è deliberato anche in ottica rev. 2: il minimo, i pesi e la catena logistica cambiano con la combinazione, quindi una quantità trascinata da un prodotto all'altro sarebbe un numero che sembra confermato e non lo è.

**Salto del passo 2 e trappola del Back.** Opzioni valutate:

- **A. Redirect automatico** da `/configuratore/bomba` a `/configuratore/bomba/senza-farcitura` — è esattamente la trappola descritta dalla spec: il Back dal passo 3 torna al passo 2 che si auto-completa e rispinge avanti.
- **B. Un solo push** — dal passo 1, selezionando Bomba/Bomba Super/Lussekatt si naviga direttamente all'URL completo senza entry intermedia in history. Il Back torna al passo 1. L'URL intermedio `/configuratore/bomba` resta comunque **valido se digitato/linkato** (deep link dalla tessera): in quel caso la pagina server lo normalizza con `redirect()` all'URL completo (un redirect server sostituisce l'entry, non inquina la history del client).
- **C. Passo 2 mostrato con un solo elemento** — bocciato dalla spec ("fermare l'utente davanti a un elenco di un elemento è un attrito").

**Raccomandazione: B.** Nel passo 3 e nel riepilogo la farcitura unica va mostrata come "scelta fatta per te", riapribile: riaprirla porta al passo 2 che mostra l'unica opzione selezionata (qui sì, perché è l'utente ad averlo chiesto).

**Implementazione logica:** un `useReducer` non serve nemmeno — lo stato prodotto è `usePathname()` parsato da `parseScelta`, le pedane sono uno `useState` locale al passo 3. Meno stato duplicato, meno bug di sincronizzazione. Le regioni live richieste dalla spec sono due: l'annuncio del cambio passo (`aria-live` sul passo derivato) e la traduzione della quantità che si aggiorna mentre si digita (`aria-live="polite"` sul blocco conversioni).

### 3. Accesso al dato

**Caricamento del JSON.** Opzioni:

- **A. Fetch runtime da `public/configuratore-dolci.json`** — introduce uno stato di loading inutile per ~20 KB, un punto di fallimento di rete, e il file resta pubblicamente servito a un URL stabile che qualcuno prima o poi tratterà come API.
- **B. Import statico a build-time** — il dataset entra nel bundle; le docs (`08-caching.md`, "Working with deterministic operations") confermano che gli import di moduli/JSON si risolvono in prerendering; il dataset e il codice che lo interpreta viaggiano **atomicamente** con lo stesso deploy, il che rende coerente il confronto `versione_listino`.

**Raccomandazione: B.** Il file va **spostato** da `public/` (dov'è solo perché consegnato lì) a `lib/configuratore/dati-dolci.json` e importato. `public/` resta per gli asset serviti as-is (convenzione confermata in `03-file-conventions/public-folder.md` e dall'uso attuale del repo).

**Il packaging strutturato (novità rev. 2).** La catena logistica arriva già spacchettata in campi numerici sull'oggetto `packaging` della base, con tre particolarità che il tipo TypeScript deve rendere esplicite invece di nascondere:

- **Catena a 3 o 4 livelli**: Intriko Midi, Lussekatt e Klejner non hanno il livello vassoio (`vassoi_per_cartone: null`) né la scomposizione in strati. Non è un dato mancante: è una configurazione d'imballo diversa. Il tipo giusto è un campo opzionale ben tipizzato (`vassoio?: {…}`, `strati?: {…}`), non un numero con default inventato; il componente che mostra la scala renderizza 3 o 4 righe di conseguenza.
- **Frittelline a peso**: `cartone_dichiarato_a_peso: true` con `peso_cartone_kg: 2.5` dichiarato; il `pezzi_per_cartone: 72` è derivato dai vassoi. Il flag va portato nel tipo perché segnala che per questa base l'unità naturale del cliente potrebbe essere il chilo (punto aperto).
- **`testo_originale`**: va conservato nel tipo e mostrato come fallback/verifica, come chiede la spec — è la prova documentale della trascrizione e il paracadute se un giorno arriva una stringa che il parser del foglio non sa leggere.

**Le 5 funzioni pure e il rapporto con `lib/catalog.ts`.** Opzioni:

- **A. Estendere `lib/catalog.ts`** — bocciato: `catalog.ts` è dichiaratamente un "modello UI" delle card home (assi, still, colori gusto), con slug divergenti e semantica diversa ("vuoto" come valore di gusto, che contraddice la regola di wording della spec).
- **B. Modulo nuovo `lib/configuratore.ts`** — tipi (`Base`, `Packaging`, `Farcitura`, `Topping`, `Combinazione`, `StatoConfiguratore`), le cinque funzioni della spec (`farcitureDi`, `combinazione`, `toppingDi`, **`quantita`** — la conversione pedane → cartoni/pezzi/kg lungo la catena logistica — e `validaStato`), più `parseScelta` (segmenti URL → stato iniziale + esito: `ok | farcitura-invalida | base-invalida | da-normalizzare`) e la mappa `TESSERA_A_BASE`. Il ponte con il catalogo home resta questa sola mappa, esplicita e revocabile.

**Raccomandazione: B.** `quantita` e `validaStato` sono le due funzioni che client e server devono condividere alla lettera: la traduzione mostrata accanto al campo e quella scritta nel payload devono uscire dalla stessa moltiplicazione, mai da due implementazioni. `validaStato` nella rev. 2 valida anche il tipo della quantità: **pedane intere, ≥ 1** (`QUANTITA_NON_VALIDA`) — mezze pedane non esistono nella catena descritta dal foglio, e un decimale produce richieste che il gestionale non sa evadere.

**Le 5 asserzioni di build (erano 3).** Opzioni:

- **A. Asserzioni a import-time** in `lib/configuratore.ts` che lanciano — fanno fallire `next build`, ma il messaggio d'errore esce impastato nello stack del build, contro l'avvertimento della spec.
- **B. Script dedicato `scripts/valida-configuratore.mjs`** agganciato come `"prebuild"` in `package.json` — coerente con la convenzione del repo (`scripts/*.mjs` già esistenti), eseguibile a mano da chi tiene il foglio, con output leggibile che dica quale riga, quale prodotto e quale moltiplicazione non chiude ("è esattamente il tipo di errore che in un foglio compilato a mano passa inosservato e in un ordine da tre tonnellate non passa inosservato affatto").

**Raccomandazione: B, con A come cintura di sicurezza minima.** Le cinque asserzioni: (1) integrità referenziale di base/farcitura/topping verso i vocabolari; (2) unicità degli SKU e coerenza `sku === base--farcitura`; (3) dipendenza funzionale `(base, farcitura) → topping`; (4) `vassoi_per_cartone × pezzi_per_vassoio === pezzi_per_cartone` dove entrambi esistono; (5) `cartoni_per_strato × strati_per_pedana === cartoni_per_pedana` dove dichiarati. Conviene aggiungere allo script — come verifiche non richieste ma a costo zero, già provate sul dataset attuale — anche la coerenza dei derivati: `pezzi_per_cartone × cartoni_per_pedana === pezzi_per_pedana`, i pesi cartone/pedana ricalcolati dalla grammatura, `ordine_minimo_pezzi === ordine_minimo_pedane × pezzi_per_pedana`, e l'allineamento del flag `ordine_minimo_dichiarato_su_riga`. Tutte passano sul JSON consegnato (riverificato in questa sessione).

### 4. Il terzo passo: finitura, formato e quantità

La rev. 2 struttura il passo in **tre blocchi, di cui solo l'ultimo chiede qualcosa**:

1. **Rivelazione** — "La tua {base} con {farcitura} arriva finita con {topping.nome}": immagine della combinazione (`combinazione.immagine`), mai un menu, mai un controllo. Se lo scontorno della combinazione non esiste ancora (oggi `public/img/configuratore/` **non esiste affatto** nel repo — verificato), fallback all'immagine della base + finitura descritta a parole, mai la foto di un'altra farcitura ("un prodotto mostrato sbagliato in una richiesta da tre tonnellate è un problema commerciale, non estetico"). Il repo ha già la convenzione del placeholder onesto ("Fotografia in arrivo" in `Tile.tsx`) da riusare. Accanto: grammatura (dalla combinazione), diametro e modalità d'uso (dalla base).
2. **Scala del formato** — la catena logistica tradotta in una scala leggibile, dal pezzo alla pedana, con i pesi calcolati sulla grammatura di quella farcitura: *1 vassoio = 5 pezzi · 1 cartone = 6 vassoi, 30 pezzi, 2,25 kg · 1 pedana = 112 cartoni su 14 strati da 8, 3.360 pezzi, 252 kg*. Nessuna grafica: 3 o 4 righe in monospaziato (il carattere che tutto il sito usa per i dati tecnici, pattern `dl` + `font-mono` di `Tile.tsx`). Dove il vassoio non esiste, la scala ha tre righe e non si inventa nulla.
3. **Quantità in pedane** — l'unico campo attivo del passo. Input intero ≥ 1; accanto, **in tempo reale**, la traduzione in cartoni, pezzi e chilogrammi via `quantita()` — è il modo in cui un buyer verifica l'ordine di grandezza prima di premere invio. La traduzione vive in una regione `aria-live="polite"`.

**Il vincolo di ordine minimo** (19 SKU su 32, sempre 12 pedane nel dato attuale) si dichiara **prima**, in quantità e non in divieto: "questa referenza si ordina da 12 pedane, pari a 40.320 pezzi" (`ordine_minimo_pezzi` è già nel dataset, non va ricalcolato in vista), legato al campo con `aria-describedby`. Se l'utente digita meno: messaggio che **propone la correzione** invece di negare, non bloccante fino all'invio. Valore iniziale proposto: il minimo stesso dove esiste, 1 altrove.

**Sotto il minimo: deviazione, non errore terminale.** Il cliente piccolo che scopre qui di essere fuori scala (34.000+ pezzi non sono per tutti) è un contatto che vale: all'invio sotto minimo si offre il contatto con l'agente di zona invece del rifiuto. Dipende dall'esistenza della ricerca agente (punto aperto); in assenza, la deviazione minima è il rimando al modulo contatti con la configurazione precompilata nel messaggio.

**Validazione, dove:**

- **Client**: interattiva e informativa — vincoli sull'input + messaggio inline propositivo. Non è sicurezza, è cortesia.
- **Server**: `validaStato` rieseguita dentro la Server Action con lo **stesso modulo** `lib/configuratore.ts` e lo stesso dataset importato. Errori tipizzati: `COMBINAZIONE_INESISTENTE`, `QUANTITA_NON_VALIDA` (non intera o < 1), `SOTTO_ORDINE_MINIMO` (con `minimo_pedane` e `minimo_pezzi` nella risposta per comporre il messaggio — o la deviazione verso l'agente), più `VERSIONE_OBSOLETA` (area 5). Un URL forgiato o un client con dataset vecchio non entra nel gestionale.

⚠️ **Dipendenza bloccante sulla validazione:** la semantica di `SOTTO_ORDINE_MINIMO` dipende dall'ambiguità irrisolta del dato (vedi area 5-bis). La struttura del passo si può costruire subito; la regola di validazione definitiva va scritta solo dopo la risposta di Delsigel.

### 5. Casi limite

**URL con combinazione inesistente.** Il parsing sta in un punto solo (`parseScelta`, chiamata dalla pagina server). Casistica:

- `base` valida, `farcitura` non valida per quella base (o inesistente): **non** un 404. Raccomandazione: `redirect()` server a `/configuratore/{base}?nd={slug}` con avviso discreto composto dal query param ("la farcitura richiesta non è più disponibile per questa base"), che sparisce alla prima interazione. `redirect` da componente server è il meccanismo canonico (`04-functions/redirect.md`).
- `base` non valida: `redirect('/configuratore')`, passo 1, avviso analogo opzionale.
- Segmenti in eccesso (`/configuratore/a/b/c`): trattati come base+farcitura ignorando il resto, poi normalizzati dallo stesso redirect.
- Nota di modello: `dynamicParams` resta al default `true`, così gli URL fuori da `generateStaticParams` vengono comunque renderizzati a runtime e passano dal parsing (non 404 secchi).

**Dataset aggiornato durante la sessione.** Il client porta nella richiesta la `versione_listino` importata al build del suo bundle. La Server Action confronta: se diversa, risponde `VERSIONE_OBSOLETA` e l'interfaccia chiede una riconferma ricaricando i dati. Se la combinazione è proprio sparita nel nuovo listino, cade nel ramo `COMBINAZIONE_INESISTENTE` con messaggio dedicato (non tecnico) e rientro al passo 2.

**Quantità sotto il minimo.** Trattata come deviazione verso il contatto commerciale, non come errore terminale (vedi area 4).

**Wording `senza-farcitura`.** L'interfaccia usa **sempre** `farcitura.nome` dal vocabolario ("Senza farcitura"), mai stringhe cablate: il giorno in cui il marketing sceglie "Naturale" si cambia il dataset, non i componenti. Il flag `senza_farcitura: true` esiste apposta per varianti di layout. Segnalazione collaterale emersa dal repo: `lib/catalog.ts` usa oggi `"vuoto"` come valore d'asse per Intriko sulla card home — in contrasto con la regola della spec; da allineare quando si tocca la home.

### 5-bis. L'ambiguità sull'ordine minimo — blocco pre-implementazione

Nel foglio, su Nuvola e Intriko il minimo compare **solo sull'ultima riga del blocco**; su Stella, Cuore, Intriko Midi e Klejner su tutte le righe; su Bomba, Bomba Super, Golosone e Frittelline mai. Tre letture possibili, con validazioni diverse:

| Lettura | Significato | SKU vincolati | Validazione |
| --- | --- | --- | --- |
| **Letterale** (nel dataset) | il minimo vale dove è scritto | 19/32 | per combinazione, com'è ora |
| **Per blocco** | l'annotazione qualifica la base intera | 26/32 | per combinazione, dataset da correggere a monte |
| **Per ordine** | 12 pedane è il minimo della spedizione | il vincolo sta sul carrello, non sullo SKU | cambia architettura: servirebbe un multi-riga |

Il dataset mantiene la lettura letterale — l'unica difendibile senza chiedere — e la marca con `ordine_minimo_dichiarato_su_riga` (dato trascritto, non interpretato). La banda di peso quasi costante di 12 pedane (1,9–3 t su basi con pezzi/pedana che variano del 40%) suggerisce un **vincolo di trasporto**, quindi la lettura per ordine è plausibile. Conseguenza architetturale da tenere presente: se vincesse la lettura per ordine, il configuratore mono-referenza attuale resterebbe valido come UI, ma la validazione del minimo migrerebbe dallo SKU alla richiesta complessiva — un motivo in più per tenerla concentrata in `validaStato` e non spalmata nei componenti. **È la domanda più urgente da girare a Delsigel: è l'unica in cui una risposta sbagliata produce un ordine sbagliato invece che una schermata brutta.**

### 6. Esito: riepilogo e invio

**Il riepilogo** mostra i tre livelli cliccabili (ognuno riapre il passo corrispondente; tornare alla base azzera la farcitura, per costruzione dell'URL), l'immagine del prodotto finito, la scheda tecnica, la scala di packaging e la quantità con tutte le sue traduzioni. Collocazione:

- **A. Quarta vista con URL proprio** — condivisibile, ma l'esito contiene l'avvio di un form con dati personali: la cosa condivisibile è la **combinazione**, non il modulo; e il query param riporterebbe i vincoli Suspense di `useSearchParams`.
- **B. Vista client sopra l'URL della combinazione** — il pathname resta `/configuratore/{base}/{farcitura}` (l'oggetto che il buyer manda al collega), il passaggio riepilogo→modulo è stato locale.

**Raccomandazione: B.** Il riepilogo può anche convivere permanentemente come rail laterale/step indicator (i "passi completati e riapribili" della spec) più una vista finale di conferma.

**Il payload e la validazione server.** Opzioni verificate sulle docs:

- **A. Route handler** `app/api/quotazione/route.ts` — giusto per esporre un'API a terzi; per un form interno è boilerplate.
- **B. Server Action** (`07-mutating-data.md` + `02-guides/forms.md`): `app/configuratore/actions.ts` con `'use server'`, funzione `richiediQuotazione(prevState, formData)` consumata via `useActionState` (pattern raccomandato dalle docs: `prevState` + stato errore/successo, `pending` gratis). Le actions sono raggiungibili anche con POST diretti — avvertimento esplicito delle docs — quindi `validaStato` dentro la action **è** la validazione server richiesta dalla spec.

**Raccomandazione: B.** Dentro la action: `validaStato` → confronto `versione_listino` → composizione del payload come da contratto rev. 2 → inoltro. Il payload rev. 2 porta: il prodotto per intero (`topping` incluso benché derivato), **le quantità già convertite in tutte le unità** (`{pedane, cartoni, pezzi, peso_kg}` — chi riceve lavora con l'unità del suo gestionale, e ricalcolare a mano è il punto in cui si sbaglia), il blocco `packaging` di riferimento, `ordine_minimo_pedane` + `ordine_minimo_rispettato`, il `cliente` con il solo campo di profilazione che conta (**canale**: bar/pasticceria/catering/GDO) e la `versione_listino`. Le conversioni nel payload escono da `quantita()`, la stessa funzione che alimenta la UI: un solo punto di verità aritmetica. Destinatario: dipende dalla decisione quotazione/ordine (il recapito esistente nel repo è `info@delsigel.it`, `app/contatti/page.tsx`, il cui form oggi è un `mailto:` senza backend — il configuratore introdurrebbe la prima mutazione server reale del sito, riusabile poi dal form contatti).

---

## (c) Mappa dei componenti e moduli proposti

Coerente con le convenzioni osservate: pagina server sottile + isola client, sottocartella per feature (`components/chi-siamo/*` → `components/configuratore/*`), nomi in italiano, script di build in `scripts/*.mjs`, token cromatici e tipografici da `app/globals.css` (`type-display`, `type-label`, mono per dati tecnici, focus `acido`).

```
app/
  configuratore/
    [[...scelta]]/
      page.tsx            ← server: await params, parseScelta, redirect di
                            normalizzazione, generateStaticParams (44 path),
                            generateMetadata per SKU; monta l'isola client
    actions.ts            ← 'use server': richiediQuotazione(prevState, formData)
                            → validaStato + versione_listino + payload con
                            quantità convertite + inoltro
components/
  configuratore/
    Configuratore.tsx     ← isola client: passo derivato da usePathname,
                            pushState per le transizioni, aria-live sul cambio passo
    PassoBase.tsx         ← griglia delle 11 tessere (sempre tutte), conteggio
                            farciture sotto il nome
    PassoFarcitura.tsx    ← solo farcitureDi(base): filtrate, mai disabilitate
    PassoFinitura.tsx     ← i tre blocchi: rivelazione topping + scheda tecnica,
                            ScalaFormato, CampoPedane
    ScalaFormato.tsx      ← la catena logistica in 3 o 4 righe monospaziate,
                            pesi dalla grammatura della combinazione,
                            testo_originale come fallback
    CampoPedane.tsx       ← input intero in pedane + traduzione live
                            (cartoni/pezzi/kg via quantita()) in aria-live,
                            minimo dichiarato con aria-describedby,
                            messaggio propositivo + deviazione sotto-minimo
    Riepilogo.tsx         ← i tre livelli riapribili + scala + quantità tradotta,
                            stato "scelta fatta per te" per le farciture uniche
    ModuloQuotazione.tsx  ← form cliente (canale incluso) + useActionState
    TesseraScelta.tsx     ← tessera quadrata riusabile (base/farcitura), stato
                            di selezione dichiarato, bersaglio ≥ 48px
lib/
  configuratore.ts        ← tipi (Packaging a 3/4 livelli, flag cartone a peso),
                            dataset importato, farcitureDi / combinazione /
                            toppingDi / quantita / validaStato, parseScelta,
                            TESSERA_A_BASE
  configuratore/
    dati-dolci.json       ← il dataset (spostato da public/)
scripts/
  valida-configuratore.mjs ← le 5 asserzioni + coerenze derivate (pesi,
                             ordine_minimo_pezzi, pezzi_per_pedana), output
                             leggibile per chi tiene il foglio: riga, prodotto,
                             moltiplicazione che non chiude; agganciato come
                             "prebuild" in package.json
```

Modifiche puntuali a file esistenti: `components/Header.tsx` (voce nav), `components/Tile.tsx` (CTA "Configura" per le tipologie mappate in `TESSERA_A_BASE`), `package.json` (script `prebuild`).

---

## (d) Punti aperti per il committente

Da sottoporre così come sono, senza deciderli in implementazione. Risolti dalla rev. 2 rispetto alla lista precedente: l'unità di misura (**pedane**, con traduzioni informative) e la collocazione della quantità (**al passo 3**).

1. **⚠️ L'ambiguità sull'ordine minimo** — vale per SKU (lettura letterale, 19/32), per base (per blocco, 26/32) o per ordine complessivo (vincolo di trasporto, sul carrello)? È la domanda più urgente: una risposta sbagliata produce un ordine sbagliato, e la lettura per ordine cambierebbe la validazione. **Da risolvere prima di scrivere la validazione della quantità.**
2. **Pedane intere o anche cartoni sciolti** — il foglio non lo dice; se si ordina anche a cartoni va aggiunto esplicitamente, non dedotto.
3. **Quotazione o ordine vero** — cambia payload, destinatario (casella commerciale vs gestionale) e tono della CTA finale.
4. **Deviazione sotto-minimo verso l'agente di zona** — presuppone che la ricerca agente esista; in alternativa, rimando al modulo contatti precompilato.
5. **Frittelline a chilogrammi** — il foglio le dichiara a peso (`2.5 kg per ct.`): in interfaccia si vendono a pezzi come le altre o a kg?
6. **Unificazione Ciock/Cioccolato** — decisione di marketing, non di dato; il dataset la tiene volutamente separata.
7. **Wording di `senza-farcitura`** — "Senza farcitura" o "Naturale"; mai "vuoto" (e va allineata anche la card Intriko della home, che oggi usa "vuoto").
8. (Emerso dall'analisi del repo) **Allineamento catalogo home ↔ configuratore**: le tipologie della home non coincidono una a una con le basi del configuratore (`bomba-fritta` vs Bomba/Bomba Super, `frittella` vs Frittelline, `lusekatt` vs Lussekatt, Intriko Midi assente in home): quali tessere devono avere la CTA "Configura", e con quale destinazione?
9. (Emerso dall'analisi del repo) **Budget fotografico**: `public/img/configuratore/` non esiste; servono 11 scontorni base + 32 combinazioni, o l'adozione dichiarata del fallback "immagine base + finitura a parole".

---

## Riferimenti usati per le convenzioni

- Spec e dataset (seconda revisione): `public/configuratore-dolci-spec-tecnica.md`, `public/configuratore-dolci.json`
- Docs Next 16.2.10 verificate: `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` (params come Promise, searchParams→dynamic rendering, PageProps), `.../03-api-reference/03-file-conventions/dynamic-routes.md` (optional catch-all, generateStaticParams), `.../01-getting-started/08-caching.md` e `.../02-guides/caching-without-cache-components.md` (cacheComponents opt-in, non attivo nel repo), `.../02-guides/single-page-applications.md` (shallow routing con `window.history.pushState`), `.../01-getting-started/07-mutating-data.md` e `.../02-guides/forms.md` (Server Actions, useActionState), `.../01-getting-started/15-route-handlers.md`, `.../03-api-reference/04-functions/use-search-params.md` (vincolo Suspense)
- Pattern repo: `app/page.tsx` + `components/Experience.tsx` (pagina sottile + isola client), `app/contatti/page.tsx` e `app/chi-siamo/page.tsx` (metadata, Header/Footer per pagina, sottocartella componenti), `components/Tile.tsx`, `components/Header.tsx`, `components/Reveal.tsx`, `lib/catalog.ts`, `app/globals.css` (token), `assets/catalog/manifest.json`, `scripts/` e `package.json`
