# Delsigel — Configuratore dolci: specifica tecnica

Documento di lavoro, luglio 2026. Spiega come costruire il configuratore a partire dal modello dati ricavato da `PRODOTTI SITO.xlsx`, sezione DOLCI. Il dataset normalizzato è nel file `configuratore-dolci.json` consegnato insieme a questo documento.

Seconda revisione: rispetto alla prima sono state integrate le informazioni di packaging, configurazione delle pedane e ordine minimo, che sono ciò che permette al cliente di passare dalla configurazione all'ordine.

## Premessa: come si legge la matrice

Ogni riga del foglio è un **prodotto finito**, non una schedina di ingredienti. La riga `Nuvola | Ciock e Lampone | zucchero a velo idrorepellente` non descrive tre scelte indipendenti che si sommano, descrive una combinazione che esiste in produzione. Le tre colonne sono i tre livelli del configuratore: colonna A la **base**, colonna D la **farcitura**, colonna F il **topping**.

Da qui discende la cosa più importante di tutto il progetto, e conviene dirla subito perché condiziona ogni scelta successiva: **il configuratore non genera combinazioni, le seleziona**. Non è un prodotto cartesiano in cui l'utente compone liberamente tre pezzi; è una matrice sparsa in cui solo le combinazioni presenti a foglio sono ammesse. `Nuvola + Frutti di bosco e ribes + Semolato` non è un prodotto raro o da quotare: non esiste, e il configuratore non deve permettere di arrivarci nemmeno per un istante.

Una nota di lettura sulla farcitura, perché è il punto in cui è facile sbagliare. Quando il valore contiene una "e" — `Ciock e lampone`, `Marmellata frutti rossi e ribes` — resta **un solo valore atomico**, non due componenti da scegliere separatamente. È il nome di quella farcitura, che è composta di due gusti ma si ordina e si produce come una cosa sola.

## Il dato in numeri

| Grandezza | Valore |
| --- | --- |
| Combinazioni valide (SKU) | 32 |
| Basi | 11 |
| Farciture distinte | 15 |
| Topping distinti | 6 |
| Combinazioni teoriche (11 × 15 × 6) | 990 |
| **Densità della matrice** | **3,2%** |
| SKU con ordine minimo dichiarato | 19 su 32 |
| Pezzi per pedana | da 2.880 a 8.064 secondo la base |

Il 3,2% è il numero che giustifica l'intera architettura. Su novecentonovanta combinazioni immaginabili ne esistono trentadue: qualsiasi interfaccia che presenti i tre livelli come menu indipendenti produrrà, nella quasi totalità dei casi, un prodotto inesistente. La validazione non è un controllo di sicurezza da mettere alla fine, è la logica primaria dell'interfaccia.

## Le tre leggi del modello

Tutto il comportamento del configuratore discende da tre proprietà che ho verificato sui 32 SKU reali, non ipotizzate.

**Prima legge — la matrice è sparsa e chiusa.** L'insieme delle combinazioni valide è enumerato, non calcolato. Non esiste una regola generativa che dica quali farciture stanno su quali basi: va letta dal dataset. Le farciture per base vanno da una sola (Bomba, Bomba Super, Lussekatt) a sei (Intriko Midi).

**Seconda legge — il topping è funzionalmente determinato dalla coppia (base, farcitura).** Ho controllato tutte e 32 le combinazioni: non esiste un solo caso in cui la stessa base con la stessa farcitura compaia con due topping diversi. Questo significa che **il topping non è mai una scelta dell'utente**. Una volta scelte base e farcitura, il topping è già deciso. Vale sia dove il topping è costante per tutta la base (Nuvola, Stella, Cuore sempre zucchero a velo; Intriko Midi, Klejner, Frittelline sempre semolato) sia dove cambia da farcitura a farcitura dentro la stessa base — che sono solo due casi, Intriko e Golosone:

| Base | Farcitura | Topping determinato |
| --- | --- | --- |
| Intriko | Cioccolato | perle di zucchero idrorepellenti al cacao |
| Intriko | Crema | perle di zucchero idrorepellenti bianche |
| Intriko | Pistacchio | perle di zucchero idrorepellenti bianche |
| Intriko | Tre cioccolati | scagliette di cioccolato (tutti e 3 i cioccolati) |
| Intriko | Frutti rossi | perle di zucchero colorate rosse |
| Golosone | Crema | perle di zucchero idrorepellenti bianche |
| Golosone | Cioccolato | perle di zucchero idrorepellenti al cacao |

**Terza legge — gli attributi vivono su due piani distinti.** Il packaging, il diametro e la modalità d'uso sono costanti per tutta la base e stanno lì. La grammatura invece sta sulla combinazione: la grammatura di Nuvola non è una proprietà di Nuvola, è 75 g con Ciock e lampone, 85 g con Crema e fragola, 73 g con Frutti di bosco e ribes. Lo stesso vale per l'ordine minimo, che dentro Nuvola è dichiarato sulla sola variante Pistacchio e lampone. La conseguenza pratica è che **tutti i pesi sono grandezze derivate della combinazione, non della base**: il numero di pezzi in un cartone è una proprietà della base, ma quanto quel cartone pesa dipende dalla farcitura scelta.

## Packaging e configurazione delle pedane

È l'informazione che trasforma una configurazione in un ordine, ed è per questo che va portata dentro il configuratore e non lasciata alla scheda tecnica. Un buyer che ha scelto Nuvola con crema e fragola non ha ancora nessuna delle informazioni che gli servono per decidere: quanti pezzi si porta a casa, in quanti cartoni, quanto occupa, quanto pesa.

La stringa che il foglio porta in colonna G — per esempio `6 vassoi 5 pz./ 30 pz. per ct./ 112 ct. per pallet (8 ct. per fila)` — non è un'annotazione libera, è una **catena logistica a quattro livelli** che va spacchettata in campi numerici. I livelli sono il vassoio, il cartone, lo strato e la pedana, e ciascuno moltiplica il precedente.

| Base | Vassoi/cartone | Pezzi/vassoio | Pezzi/cartone | Cartoni/strato | Strati | Cartoni/pedana | **Pezzi/pedana** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Nuvola | 6 | 5 | 30 | 8 | 14 | 112 | **3.360** |
| Stella | 6 | 5 | 30 | 8 | 14 | 112 | **3.360** |
| Cuore | 6 | 5 | 30 | 8 | 14 | 112 | **3.360** |
| Intriko | 3 | 10 | 30 | 8 | 14 | 112 | **3.360** |
| Bomba | 3 | 12 | 36 | 8 | 11 | 88 | **3.168** |
| Bomba Super | 3 | 12 | 36 | 8 | 11 | 88 | **3.168** |
| Golosone | 6 | 6 | 36 | 8 | 14 | 112 | **4.032** |
| Frittelline | 6 | 12 | 72 | 8 | 14 | 112 | **8.064** |
| Intriko Midi | — | — | 42 | — | — | 96 | **4.032** |
| Lussekatt | — | — | 40 | — | — | 72 | **2.880** |
| Klejner | — | — | 40 | — | — | 72 | **2.880** |

Tre osservazioni tecniche su questa tabella, tutte da portare in fase di implementazione.

Le ultime tre basi **non hanno il livello vassoio**: Intriko Midi, Lussekatt e Klejner dichiarano solo pezzi per cartone. Non è un dato mancante da colmare con una stima, è una configurazione di imballo diversa, e l'interfaccia deve saper mostrare una catena a tre livelli invece che a quattro senza inventare un vassoio che non c'è.

Le Frittelline sono l'unico caso in cui **il cartone è dichiarato a peso e non a pezzi**: `2.5 kg per ct.` invece di un conteggio. Il numero di pezzi si ricava dalla catena dei vassoi, 6 × 12 = 72, e la verifica torna — 72 pezzi da 35 g fanno 2,52 kg, coerente con i 2,5 kg dichiarati. Nel dataset ho messo `pezzi_per_cartone: 72` con il flag `cartone_dichiarato_a_peso: true`, così chi implementa sa che quel 72 è derivato e che per le Frittelline l'unità naturale con cui il cliente ragiona potrebbe essere il chilo.

Il numero di strati infine è a volte scritto (`14 strati da 8 ct`) e a volte lasciato implicito (`8 ct. per fila`, da cui 112 ÷ 8 = 14). Le due formulazioni dicono la stessa cosa e ho verificato che tornano su tutte le basi che le dichiarano. Va normalizzato a due campi numerici, cartoni per strato e strati per pedana, perché è l'informazione che serve a chi deve dire se la merce entra in un mezzo.

Da questa catena discendono i due numeri che il configuratore deve mostrare e che dipendono anche dalla farcitura, perché coinvolgono la grammatura: il **peso del cartone** e il **peso della pedana**. Per Nuvola con Ciock e lampone, 30 pezzi da 75 g fanno un cartone da 2,25 kg e una pedana da 252 kg; con Crema e fragola, che pesa 85 g, la stessa pedana diventa 286 kg. Sono nel dataset come `peso_cartone_kg` e `peso_pedana_kg` a livello di combinazione.

## L'ordine minimo

Diciannove SKU su trentadue portano l'indicazione `ordine minimo 12 pedane`. Tradotto nella catena logistica appena vista, quel vincolo significa questo:

| Base | Pezzi per pedana | 12 pedane = pezzi | Peso indicativo |
| --- | --- | --- | --- |
| Klejner | 2.880 | 34.560 | ≈ 1.900 kg |
| Lussekatt | 2.880 | 34.560 | ≈ 2.074 kg |
| Nuvola, Stella, Cuore, Intriko | 3.360 | 40.320 | 2.822 – 3.024 kg |
| Intriko Midi | 4.032 | 48.384 | ≈ 2.903 kg |

**Dodici pedane sono fra le 34.000 e le 48.000 unità, cioè fra 1,9 e 3 tonnellate di prodotto.** Questo numero va scritto in cima al progetto dell'interfaccia perché cambia la natura dello strumento: il configuratore non è un carrello, è la preparazione di una richiesta industriale. Una schermata che chiede "quante ne vuoi?" con un campo che parte da 1 pezzo sta mentendo sull'ordine di grandezza della conversazione. L'unità di lavoro è la pedana, e il pezzo serve solo come traduzione informativa accanto.

Una cosa che vale la pena notare, perché suggerisce dove andare a chiedere conferma: il peso di dodici pedane è quasi identico su tutte le basi, fra 1,9 e 3 tonnellate, nonostante il numero di pezzi vari del quaranta per cento. Un minimo espresso in pedane che si traduce in una banda di peso così stretta somiglia più a un **vincolo di trasporto** — il carico che rende sensato far partire un mezzo — che a un vincolo di produzione. Se è così, la domanda giusta da fare a Delsigel non è "quali prodotti hanno il minimo" ma "il minimo è per prodotto o per ordine complessivo", e la risposta cambia completamente la validazione.

### Un'ambiguità nel dato che va risolta prima di scrivere il codice

Guardando dove l'annotazione compare nel foglio emerge un problema che non si vede leggendo i dati riga per riga. Su Stella, Cuore, Intriko Midi e Klejner il minimo è ripetuto su **ogni** variante del blocco. Su Nuvola e Intriko compare **solo sull'ultima riga** del blocco:

| Base | Varianti | Dove compare il minimo |
| --- | --- | --- |
| Nuvola | 4 | solo su Pistacchio e lampone (ultima riga) |
| Intriko | 5 | solo su Frutti rossi (ultima riga) |
| Stella, Cuore, Intriko Midi, Klejner | 4, 4, 6, 2 | su tutte le righe |
| Lussekatt | 1 | sull'unica riga |
| Bomba, Bomba Super, Golosone, Frittelline | 1, 1, 2, 2 | mai |

Scrivere una nota una volta sola in fondo a un blocco, intendendola valida per tutto il blocco, è il gesto più naturale del mondo per chi compila un foglio a mano. Ci sono quindi tre letture possibili, e portano a numeri diversi.

La lettura **letterale** dice che il minimo vale esattamente sui 19 SKU dove è scritto, e che Nuvola con crema e fragola si può ordinare senza vincoli mentre Nuvola con pistacchio e lampone no. È tecnicamente quello che il foglio dice, ed è quella implementata nel dataset, ma è commercialmente strana.

La lettura **per blocco** dice che l'annotazione qualifica la base intera, e allora gli SKU vincolati diventano 26 su 32, con le sole Bomba, Bomba Super, Golosone e Frittelline libere. È la lettura più probabile secondo me, ma resta un'inferenza.

La lettura **per ordine** dice che le dodici pedane sono il minimo della spedizione e non della singola referenza, e allora il vincolo non appartiene affatto allo SKU ma al carrello: si può ordinare una pedana di Nuvola e undici di Stella. È quella suggerita dalla banda di peso costante.

Nel dataset ho mantenuto la lettura letterale, che è l'unica difendibile senza chiedere, e ho aggiunto su ogni combinazione il campo `ordine_minimo_dichiarato_su_riga` per rendere esplicito che si tratta di un dato trascritto e non interpretato. **Questa è la domanda più urgente da girare a Delsigel**, perché è l'unica di tutto il progetto in cui una risposta sbagliata produce un ordine sbagliato invece che una schermata brutta.

## Normalizzazione preliminare

Il foglio è un documento di lavoro umano e va ripulito una volta sola, a monte, non a runtime. Gli spazi in coda sono ovunque (`"NUVOLA "`, `"CIOCK E LAMPONE "`) e vanno tagliati. I valori `VUOTA` di Bomba e `VUOTO` di Klejner e Lussekatt sono lo stesso concetto scritto in due modi: nel dataset li ho unificati in un unico identificativo `senza-farcitura`, ed è il caso in cui in interfaccia la parola giusta da mostrare non è "vuoto" ma "senza farcitura" o "naturale". Il diametro è a volte numero e a volte testo (`9.5` contro `"9.5"`) e va tipizzato. L'ordine minimo è scritto in due modi (`"ordine minimo di 12 pedane"` e `"ordine minimo 12 pedane"`) e va portato all'intero `12`. La stringa di packaging va spacchettata nei sei campi numerici visti sopra, e contiene un refuso da assorbire senza segnalarlo (`6 vassi` per `6 vassoi`, sulle Frittelline). Infine `CIOCK` dentro `Ciock e lampone` è quasi certamente lo stesso ingrediente di `CIOCCOLATO`: **questa unificazione non l'ho fatta**, perché è una decisione di marketing e non di dato.

## Il contratto dati

Il dataset è un unico file JSON con quattro collezioni: tre vocabolari e la lista delle combinazioni valide, che è l'unica sorgente di verità su cosa esiste.

```json
{
  "versione": "2026-07-29",
  "linea": "dolci",
  "unita_quantita": "pedane",
  "basi": [
    {
      "id": "nuvola",
      "nome": "Nuvola",
      "diametro_cm": 9.5,
      "modalita_uso": "DECONGELARE A TEMPERATURA AMBIENTE PER 3 h",
      "packaging": {
        "vassoi_per_cartone": 6,
        "pezzi_per_vassoio": 5,
        "pezzi_per_cartone": 30,
        "peso_cartone_kg": null,
        "cartone_dichiarato_a_peso": false,
        "cartoni_per_strato": 8,
        "strati_per_pedana": 14,
        "cartoni_per_pedana": 112,
        "pezzi_per_pedana": 3360,
        "testo_originale": "6 vassoi 5 pz./ 30 pz. per ct./ 112 ct. per pallet (8 ct. per fila)"
      },
      "immagine": "/img/configuratore/basi/nuvola.png"
    }
  ],
  "farciture": [
    { "id": "ciock-e-lampone", "nome": "Ciock e lampone", "senza_farcitura": false }
  ],
  "topping": [
    { "id": "zucchero-a-velo-idrorepellente", "nome": "Zucchero a velo idrorepellente" }
  ],
  "combinazioni": [
    {
      "sku": "nuvola--ciock-e-lampone",
      "base": "nuvola",
      "farcitura": "ciock-e-lampone",
      "topping": "zucchero-a-velo-idrorepellente",
      "grammatura_gr": 75,
      "peso_cartone_kg": 2.25,
      "peso_pedana_kg": 252.0,
      "ordine_minimo_pedane": null,
      "ordine_minimo_pezzi": null,
      "ordine_minimo_dichiarato_su_riga": false,
      "immagine": "/img/configuratore/prodotti/nuvola--ciock-e-lampone.png"
    }
  ]
}
```

Lo SKU è costruito come `{base}--{farcitura}` e non contiene il topping, proprio perché il topping è derivato: metterlo nella chiave suggerirebbe un grado di libertà che non c'è. La chiave è unica sulle 32 righe, verificato.

Il `testo_originale` del packaging va conservato anche dopo lo spacchettamento. Serve a due cose: permette a chi rilegge di verificare la trascrizione senza tornare all'Excel, e resta disponibile come fallback da mostrare se un giorno arriva una stringa che il parser non sa leggere.

Il file va validato in fase di build con cinque asserzioni. Le prime tre sono la traduzione diretta delle tre leggi: ogni riferimento a base, farcitura e topping esiste nel rispettivo vocabolario; nessuno SKU è duplicato; nessuna coppia `(base, farcitura)` compare con più di un topping. Le altre due riguardano il packaging: dove esistono entrambi, `vassoi × pezzi_per_vassoio` deve dare `pezzi_per_cartone`, e `cartoni_per_strato × strati_per_pedana` deve dare `cartoni_per_pedana`. Se una di queste salta dopo un aggiornamento del listino, il build deve fallire e non pubblicare — è esattamente il tipo di errore che in un foglio compilato a mano passa inosservato e in un ordine da tre tonnellate non passa inosservato affatto.

## Conseguenza sul disegno: il terzo passo non è una scelta

I documenti di progetto descrivono il configuratore come tre passi — base, farcitura, topping. La seconda legge dice che il terzo passo non contiene una decisione: il topping arriva già deciso. Presentarlo come un menu con una sola opzione selezionabile è la cosa peggiore che si possa fare, perché chiede un'azione a vuoto proprio nel punto in cui l'utente sta per convertire.

Ci sono due modi onesti di risolverlo, e consiglio il secondo.

Il primo è **comprimere a due passi**, base e farcitura, mostrando il topping come attributo nella schermata di riepilogo. È il più fedele al dato, ma perde il ritmo a tre tempi che regge tutta l'impaginazione già disegnata e costringe a rifare la sezione S5 della home.

Il secondo è **tenere i tre passi ma cambiare cosa contiene il terzo**: il topping compare come *rivelazione* — la finitura che quella combinazione porta con sé, mostrata e non chiesta — e nello stesso passo si mette la decisione che nel B2B è davvero l'ultima e davvero è una scelta, cioè **quantità e formato**, con tutta la catena logistica e il vincolo di ordine minimo. Il passo resta un passo pieno, il conteggio a tre regge, l'impaginazione non cambia, e soprattutto la conversazione con il buyer finisce dove deve finire: su quante pedane. È la variante su cui è scritta la specifica che segue.

## Il flusso, passo per passo

### Passo 0 — Ingresso e stato iniziale

Il configuratore si carica con il dataset già in memoria: 32 combinazioni sono poche decine di kilobyte, non serve nessuna chiamata al server per navigare. Lo stato iniziale è `{ base: null, farcitura: null, pedane: null }`.

L'ingresso può essere già parzialmente qualificato. Se l'utente arriva da una tessera del catalogo in home, la base è già scelta e si atterra direttamente sul passo 2, con il passo 1 mostrato come completato e riapribile. L'URL porta lo stato — `/configuratore/nuvola/ciock-e-lampone` — così ogni configurazione è condivisibile e ripescabile, il che nel B2B conta perché il buyer manda il link al collega.

### Passo 1 — Base

Si mostrano tutte e 11 le basi, sempre tutte, sempre selezionabili: non esiste una scelta a monte che possa escluderne una. Ogni base è una tessera quadrata a tinta piena con il prodotto scontornato, secondo la regola già fissata nei documenti di design — nome sotto il quadrato, mai dentro, per la questione dei contrasti.

Sotto ogni nome conviene mostrare il numero di farciture disponibili, come fa già il catalogo in home. È l'informazione che orienta la scelta, e ha un effetto pratico: chi vede "1 farcitura" su Bomba sa già che quel ramo è corto e non si aspetta un ventaglio al passo dopo.

Alla selezione, lo stato diventa `{ base: "nuvola" }` e si avanza. Cambiare base più tardi **azzera la farcitura**, sempre, senza tentativi di conservarla: anche quando la farcitura scelta esistesse anche sulla nuova base, il prodotto è un altro, con grammatura, topping e packaging potenzialmente diversi.

### Passo 2 — Farcitura

Questo è l'unico passo dove la matrice sparsa si vede, e va costruito filtrando: si mostrano **solo le farciture che compaiono in una combinazione valida con la base scelta**. Non si mostrano tutte e quindici disabilitandone alcune. Disabilitare comunica "esiste ma non per te" e invita a chiedere perché; filtrare comunica "queste sono le tue", che è la verità.

Il ventaglio che ne risulta:

| Base | Farciture disponibili |
| --- | --- |
| Nuvola | Ciock e lampone · Crema e fragola · Frutti di bosco e ribes · Pistacchio e lampone |
| Stella | Ciock e lampone · Crema e lampone · Marmellata frutti rossi e ribes · Pistacchio e lampone |
| Cuore | Ciock e lampone · Crema e lampone · Marmellata frutti rossi e ribes · Pistacchio e lampone |
| Intriko | Cioccolato · Pistacchio · Crema · Tre cioccolati · Frutti rossi |
| Intriko Midi | Caramello · Cioccolato · Crema · Pistacchio · Frutti rossi · Dulce de leche |
| Golosone | Crema · Cioccolato |
| Frittelline | Crema · Cioccolato |
| Klejner | Senza farcitura · Cannella |
| Bomba | Senza farcitura |
| Bomba Super | Crema |
| Lussekatt | Senza farcitura |

Tre basi hanno una sola farcitura. Per quelle il passo va **saltato automaticamente**, preselezionando l'unica opzione e mostrandola nel riepilogo come già decisa: fermare l'utente davanti a un elenco di un elemento è un attrito che non produce informazione. Il passo resta comunque riapribile dal riepilogo, così l'utente vede che una scelta è stata fatta per lui e non si sente scavalcato.

Alla selezione lo stato è completo dal punto di vista del prodotto: la coppia `(base, farcitura)` identifica esattamente uno SKU, e da lì si leggono topping, grammatura, pesi e ordine minimo.

### Passo 3 — Finitura, formato e quantità

Il passo si compone di tre blocchi, di cui solo l'ultimo chiede qualcosa.

**La finitura si mostra, non si chiede.** Il primo blocco dice qual è il topping di quella combinazione, con l'immagine del prodotto finito, e accanto i dati che ora sono tutti noti: grammatura, diametro, modalità d'uso.

**Il formato si legge dalla catena logistica.** Il secondo blocco traduce il packaging in una scala leggibile, dal pezzo alla pedana, con i pesi calcolati sulla grammatura di quella farcitura. Per Nuvola con Ciock e lampone si legge così: *1 vassoio = 5 pezzi · 1 cartone = 6 vassoi, 30 pezzi, 2,25 kg · 1 pedana = 112 cartoni su 14 strati da 8, 3.360 pezzi, 252 kg*. Non serve nessuna grafica: è una scala di quattro righe in monospaziato, che è il carattere che tutto il sito usa per i dati tecnici. Dove il vassoio non esiste — Intriko Midi, Lussekatt, Klejner — la scala ha tre righe invece di quattro, e non si inventa nulla.

**La quantità si chiede in pedane.** È l'unico campo attivo del passo. Accanto al campo, in tempo reale, la traduzione in pezzi, cartoni e chilogrammi, perché è il modo in cui un buyer verifica che l'ordine di grandezza sia quello giusto prima di premere invio.

Il vincolo di ordine minimo si dichiara **prima** ed è espresso in quantità, non in divieto: "questa referenza si ordina da 12 pedane, pari a 40.320 pezzi". Va scritto accanto al campo nel momento in cui la combinazione lo prevede, non fatto scoprire con un errore rosso dopo l'invio. Se l'utente digita un valore inferiore, il messaggio propone la correzione invece di limitarsi a negare, e resta non bloccante fino al momento dell'invio.

Il caso da trattare con cura è quello del cliente piccolo che scopre solo qui di essere fuori scala. Trentaquattromila pezzi non sono per tutti, e un configuratore che si limita a rifiutare l'invio ha perso un contatto che poteva valere. Il messaggio giusto in quel punto non è un errore ma una deviazione: sotto il minimo, si offre di mettere comunque in contatto con l'agente di zona. Questo però presuppone che la ricerca dell'agente esista, che è una delle cose ancora da verificare dai documenti precedenti.

### Esito — Riepilogo e invio

Il riepilogo mostra la combinazione per intero nei suoi tre livelli, con l'immagine del prodotto finito, la scheda tecnica completa, la scala di packaging e la quantità richiesta con tutte le sue traduzioni. Ogni livello è cliccabile per tornare al passo corrispondente senza perdere il resto, con la sola eccezione già detta: tornare alla base azzera la farcitura.

Se il configuratore chiude con una richiesta di quotazione — cosa ancora da confermare — il payload da mandare al gestionale o alla casella commerciale è questo:

```json
{
  "linea": "dolci",
  "sku": "nuvola--ciock-e-lampone",
  "base": "nuvola",
  "farcitura": "ciock-e-lampone",
  "topping": "zucchero-a-velo-idrorepellente",
  "grammatura_gr": 75,
  "quantita": {
    "pedane": 12,
    "cartoni": 1344,
    "pezzi": 40320,
    "peso_kg": 3024
  },
  "packaging": {
    "pezzi_per_cartone": 30,
    "cartoni_per_pedana": 112,
    "cartoni_per_strato": 8,
    "strati_per_pedana": 14
  },
  "ordine_minimo_pedane": 12,
  "ordine_minimo_rispettato": true,
  "cliente": {
    "ragione_sociale": "…",
    "canale": "pasticceria",
    "email": "…",
    "telefono": "…",
    "note": "…"
  },
  "versione_listino": "2026-07-29"
}
```

Tre campi meritano attenzione. Il `topping` va mandato anche se è derivato, perché il destinatario della mail deve leggere il prodotto per intero senza ricostruire nulla. Le quantità vanno mandate **già convertite in tutte le unità**, non solo in pedane: chi riceve la richiesta lavora con l'unità del suo gestionale, e ricalcolare a mano è il punto in cui si sbaglia. E la `versione_listino` serve a sapere, quando fra sei mesi si guarderà una richiesta vecchia, su quale versione del catalogo era stata fatta.

Il canale del cliente — bar, pasticceria, catering, GDO — è l'unico campo di profilazione che vale la pena chiedere, ed è quello che permette al commerciale di rispondere con il listino giusto.

## La logica, in pseudocodice

Tutta la macchina sta in cinque funzioni pure sul dataset. Non serve stato lato server per navigare.

```js
// farciture ammesse per una base
const farcitureDi = (base) =>
  dataset.combinazioni
    .filter(c => c.base === base)
    .map(c => dataset.farciture.find(f => f.id === c.farcitura));

// la combinazione è unica: (base, farcitura) -> SKU
const combinazione = (base, farcitura) =>
  dataset.combinazioni.find(c => c.base === base && c.farcitura === farcitura) ?? null;

// il topping è derivato, mai scelto
const toppingDi = (base, farcitura) => combinazione(base, farcitura)?.topping ?? null;

// conversione della quantità lungo la catena logistica
const quantita = (base, farcitura, pedane) => {
  const c = combinazione(base, farcitura);
  const p = dataset.basi.find(b => b.id === base).packaging;
  return {
    pedane,
    cartoni: pedane * p.cartoni_per_pedana,
    pezzi:   pedane * p.pezzi_per_pedana,
    peso_kg: Math.round(pedane * c.peso_pedana_kg),
  };
};

// validazione dello stato completo, prima dell'invio
const validaStato = (s) => {
  const c = combinazione(s.base, s.farcitura);
  if (!c) return { ok: false, errore: "COMBINAZIONE_INESISTENTE" };
  if (!Number.isInteger(s.pedane) || s.pedane < 1)
    return { ok: false, errore: "QUANTITA_NON_VALIDA" };
  if (c.ordine_minimo_pedane && s.pedane < c.ordine_minimo_pedane)
    return { ok: false, errore: "SOTTO_ORDINE_MINIMO",
             minimo_pedane: c.ordine_minimo_pedane,
             minimo_pezzi: c.ordine_minimo_pezzi };
  return { ok: true, sku: c.sku, quantita: quantita(s.base, s.farcitura, s.pedane) };
};
```

Due note. La quantità va tenuta **intera in pedane**: mezze pedane non esistono nella catena descritta dal foglio, e permettere un decimale significa produrre richieste che il gestionale non sa evadere. Se emergesse che si ordina anche a cartoni sciolti, è un'informazione che il foglio non contiene e va aggiunta esplicitamente, non dedotta.

E `validaStato` va richiamata **anche lato server** alla ricezione, con lo stesso dataset. Un URL costruito a mano o un dataset aggiornato mentre l'utente aveva la pagina aperta possono produrre una combinazione che non esiste più, e non deve entrare nel gestionale.

## Casi limite e comportamenti attesi

Il caso più probabile in produzione è l'**URL con una combinazione inesistente**, che nasce da un link vecchio o modificato a mano. Il configuratore non deve mostrare un errore tecnico: se la base esiste ma la farcitura no, si atterra sul passo 2 con la base selezionata e un avviso discreto che quella farcitura non è più disponibile; se non esiste nemmeno la base, si riparte dal passo 1.

Il secondo è il **dataset che cambia sotto i piedi** durante una sessione lunga. La `versione_listino` nello stato permette di accorgersene all'invio e di chiedere una riconferma invece di mandare al commerciale un prodotto che non si fa più.

Il terzo riguarda le **basi a farcitura unica**, dove il salto automatico del passo 2 non deve rompere la navigazione all'indietro: il pulsante indietro dal passo 3 deve tornare al passo 1, non al passo 2 che è stato saltato, altrimenti l'utente resta intrappolato in un passo che si auto-completa e lo rispinge avanti.

Il quarto è la **quantità sotto il minimo**, che come detto va trattata come deviazione verso il contatto commerciale e non come errore terminale.

Il quinto è `senza-farcitura`: in interfaccia non va mai scritto "vuoto", che su un prodotto da vendere suona come una mancanza. Vanno usate parole come "naturale" o "senza farcitura", da confermare con il marketing.

## Immagini

Servono due insiemi distinti di scontorni, e vanno prodotti una volta sola e salvati come PNG con trasparenza, mai generati a runtime, come già stabilito nei documenti di design. Il primo insieme sono le **11 basi**, usate nelle tessere del passo 1. Il secondo sono le **32 combinazioni**, usate al passo 3 e nel riepilogo, dove il prodotto va mostrato finito perché è quello che il cliente riceverà.

Trentadue scontorni sono un lavoro reale ma finito, ed è la parte più costosa del configuratore in termini di produzione. Se il budget fotografico non li copre tutti, la scorciatoia accettabile è mostrare al passo 3 l'immagine della base con la finitura descritta a parole, mai un'immagine di un'altra farcitura: un prodotto mostrato sbagliato in una richiesta da tre tonnellate è un problema commerciale, non estetico.

Tutte le immagini vanno servite in formato moderno con ripiego, in tre misure, con spazio riservato in anticipo per non far saltare il layout. Solo quelle del passo 1 vanno caricate subito; quelle delle combinazioni si caricano quando si entra nel passo 3.

## Accessibilità

Valgono le regole già fissate per la home, con tre aggiunte proprie del configuratore. Il passo corrente va annunciato come regione live quando cambia, perché chi naviga da tastiera o con uno screen reader deve sapere che il contenuto sotto è cambiato senza che la pagina sia ricaricata. Il vincolo di ordine minimo va legato al campo quantità con una descrizione accessibile, così che venga letto insieme al campo e non solo visto accanto. E la conversione della quantità in pezzi e chilogrammi va aggiornata in una regione live cortese, perché è informazione che cambia mentre si digita e che a un utente non vedente serve quanto e più che a uno vedente.

Le tessere di base e farcitura sono controlli, non decorazioni: devono essere raggiungibili da tastiera in ordine, avere uno stato di selezione dichiarato e non solo colorato, e rispettare il minimo di 48 pixel di bersaglio. L'anello di focus è quello giallo con scostamento di 3 pixel già definito, che regge su tutti i fondi della palette.

## Checklist di implementazione

Nell'ordine in cui conviene procedere: normalizzare il foglio e generare il JSON con lo script di build, incluso lo spacchettamento delle stringhe di packaging; scrivere le cinque asserzioni di validazione del dataset e collegarle al build; **risolvere con Delsigel l'ambiguità sull'ordine minimo** prima di scrivere la validazione della quantità; costruire i tre passi come componenti che leggono solo dal dataset, senza logica di prodotto scritta a mano; implementare il filtro delle farciture e il salto automatico per le basi a farcitura unica; derivare topping, attributi tecnici e catena di packaging dalla combinazione; implementare il campo pedane con conversione in tempo reale e il vincolo di minimo; portare lo stato nell'URL e gestire i casi di URL non valido; implementare il riepilogo e il payload di invio; ripetere la validazione lato server; produrre gli scontorni.

Un ultimo avvertimento sulla manutenzione. Il listino cambierà, e cambierà nel foglio Excel, non nel codice. Vale la pena che lo script di normalizzazione sia eseguibile da chi tiene il foglio e non solo da chi ha scritto il sito, e che il suo output sia leggibile: se il build fallisce perché una configurazione di pedana non torna, il messaggio d'errore deve dire quale riga del foglio, quale prodotto e quale moltiplicazione non chiude.

## Cosa resta da decidere

**L'ambiguità sull'ordine minimo** è la prima e la più urgente: vale per SKU, per base o per ordine complessivo. È l'unica domanda di tutto il progetto in cui la risposta sbagliata produce un ordine sbagliato.

Poi: se si ordina solo a pedane intere o anche a cartoni, perché il foglio non lo dice e la validazione cambia. Se il configuratore chiude con una richiesta di quotazione o con un ordine vero, che è la domanda già aperta nei documenti precedenti e qui diventa concreta perché cambia il payload e il destinatario. Se sotto il minimo si devia verso l'agente di zona, che presuppone che la ricerca agente esista. Se `Ciock` e `Cioccolato` sono lo stesso ingrediente e vanno unificati nel vocabolario. Come chiamare in interfaccia le farciture `senza-farcitura`. E infine se le Frittelline, che il foglio dichiara a peso, vanno vendute a chilogrammi anche in interfaccia invece che a pezzi.

---

Delsigel — specifica tecnica del configuratore dolci, seconda revisione. Documento di lavoro, luglio 2026.

Modello dati estratto da `PRODOTTI SITO.xlsx`, foglio "Foglio1", righe 3–43. Le tre leggi del modello, la catena di packaging e le conversioni di quantità sono verificate programmaticamente su tutte e 32 le combinazioni.
