import type { Testi } from "../tipi";

/**
 * Italiano — la lingua madre del sito. Ogni testo qui è quello che
 * stava nei componenti prima dell'internazionalizzazione: questo file
 * È il copy originale, gli altri quattro lo traducono.
 */
export const it: Testi = {
  comune: {
    voci: {
      home: "Home",
      prodotti: "Prodotti",
      configuratore: "Configuratore",
      chiSiamo: "Chi siamo",
      contatti: "Contatti",
    },
    menu: {
      apri: "Apri il menu",
      chiudi: "Chiudi il menu",
      etichettaMenu: "Menu",
      etichettaChiudi: "Chiudi",
      navPrincipale: "Navigazione principale",
      pannello: "Menu di navigazione",
      firma: ["Delsigel Italia", "dal 1960"],
    },
    lingua: {
      selettore: "Seleziona la lingua del sito",
      lista: "Lingua del sito",
    },
    preloader: {
      caricamento: "caricamento esperienza",
      stato: "Caricamento esperienza Delsigel: {pct}%",
    },
  },

  footer: {
    tagline: "L'industria artigianale di Sermoneta, dal 1960.",
    colonne: {
      delsigel: {
        titolo: "Delsigel",
        chiSiamo: "Chi siamo",
        storia: "La nostra storia",
        contatti: "Contatti",
      },
      prodotti: {
        titolo: "Prodotti",
        dolci: "I nostri dolci",
        salati: "I nostri salati",
        catalogo: "Catalogo 2026/27",
      },
      configuratore: {
        titolo: "Configuratore",
        crea: "Crea il tuo dolce",
        comeFunziona: "Come funziona",
        quotazione: "Richiedi una quotazione",
      },
      contatti: { titolo: "Contatti" },
    },
    instagram: "Delsigel su Instagram",
    dove: "Dove siamo",
    mappaTitolo: "Mappa: sede Delsigel in via della Meccanica 1, Sermoneta",
    legale: "© 2026 Delsigel Italia S.r.l. · P.IVA 02241670591",
    termini: "Termini",
    privacy: "Privacy",
    cookie: "Cookie",
    credito: "Design & Development · Hoverture",
  },

  hero: {
    insegna: [
      { testo: "Industria" },
      { testo: "artigianale." },
      { testo: "La tradizione", accento: true },
      { testo: "è innovazione.", accento: true },
    ],
    alt: "Intriko, il dolce di punta Delsigel, tra un nastro corallo e un set color cacao.",
  },

  home: {
    storia: {
      eyebrow: "La nostra storia",
      luogo: "Delsigel · Sermoneta",
      titolo: ["Un forno acceso,", "13 milioni di dolci dopo."],
      testo:
        "Nel 2011 l'incontro tra Del Monte e Siani. Oggi un'industria artigianale certificata IFS Food, Rainforest Alliance e RSPO, una nuova generazione al banco e un piano per raddoppiare.",
      cta: "Scopri la nostra storia",
      prossimoLabel: "Prossimo capitolo",
      prossimoNome: "Catalogo 2026/27",
      continuaAria: "Continua al catalogo 2026/27",
    },
    catalogoAria: "Catalogo dolci Delsigel",
    gammaAria: "Catalogo prodotti Delsigel",
    dolci: {
      eyebrow: "Catalogo 2026/27",
      titolo: "I nostri",
      titoloAccento: "dolci.",
      promessa:
        "Ricette semplici, ingredienti selezionati e tanta passione. Ogni giorno, dolci buoni per davvero.",
      tipologie: "{n} tipologie",
      varianti: "{n} varianti",
    },
    salati: {
      eyebrow: "Catalogo 2026/27",
      titolo: "I nostri",
      titoloAccento: "salati.",
      promessa:
        "Tradizione, gusto e creatività in ogni ricetta. Salati pronti a rendere speciale ogni pausa.",
      tipologie: "{n} tipologie",
      varianti: "{n} varianti",
    },
    ponte: ["Il prossimo", "sei tu."],
    teaser: {
      eyebrow: "Il configuratore",
      titolo: [{ testo: "Crea il tuo" }, { testo: "dolce.", accento: true }],
      copy:
        "Scegli base, crema, topping e dettagli. Con il nostro configuratore componi il tuo dolce ideale in pochi step. Tutto online, tutto su misura, tutto tuo.",
      cta: "Configura il tuo dolce",
    },
    catalogoFisico: {
      eyebrow: "Catalogo fisico 2026/27",
      titolo: [
        { testo: "Il catalogo" },
        { testo: "2026/2027", accento: true },
        { testo: "Da sfogliare" },
      ],
      promessa: [
        "Ispirazioni, tendenze e tutte le novità Delsigel.",
        "Un mondo di dolcezza, tutto da scoprire.",
      ],
      cta: "Scopri la nuova edizione",
      edizione: ["Edizione stampata", "da collezione"],
      trascina: "Trascina per esplorare",
      carosello: "Fotografie del catalogo stampato 2026/2027",
      slideDi: "{i} di {tot}",
      fotoDi: "Fotografia {i} di {tot}: {label}",
      precedente: "Fotografia precedente",
      successiva: "Fotografia successiva",
      novita: "NOVITÀ",
    },
  },

  catalogo: {
    a11y: {
      carosello: "carosello",
      diapositiva: "diapositiva",
      prodottiSalati: "I prodotti della linea salata",
      precedenti: "Mostra i prodotti precedenti",
      successivi: "Mostra i prodotti successivi",
      gruppoDi: "Gruppo {i} di {tot}",
      vaiGruppo: "Vai al gruppo {i} di {tot}",
    },
    claims: {
      intriko: ["Intrecciata", "alla perfezione."],
      "bomba-fritta": ["Classica.", "Senza tempo."],
      nuvola: ["Leggera come", "una nuvola."],
      "pizzetta-al-pomodoro": ["La classica.", "Sempre irresistibile."],
      "pizzetta-fritta": ["Soffice, dorata,", "tutta da gustare."],
      montanarina: ["Napoletana.", "Semplicemente buona."],
    },
    badge: ["BEST", "SELLER"],
    apriScheda: "Apri la scheda di {nome}",
    chiudiScheda: "Chiudi la scheda di {nome}",
    scopriDolci: "Scopri tutti i dolci",
    scopriSalati: "Scopri tutti i salati",
    mostraVetrina: "Mostra solo la vetrina",
    altriDolci: "Altri dolci",
    altriSalati: "Altri salati",
    tipologieCoda: "{n} tipologie",
    varianti: "{n} varianti",
    formatoUnico: "formato unico",
    scheda: {
      lineaDolci: "Dolci",
      lineaSalati: "Salati",
      formato: "Formato",
      peso: "Peso",
      perCartone: "Per cartone",
      pezzi: "{n} pz",
      variantiCatalogo: "Varianti a catalogo",
      set: "Set",
      vediSpaccato: "Vedi lo spaccato",
      vediIntero: "Vedi intero",
      spaccatoAlt: "{nome} tagliato a metà",
      fallbackDescrizione: "Scheda della tipologia {nome}.",
      richiedi: "Richiedi informazioni",
    },
  },

  prodotti: {
    note: {
      golosone: "Lievitato farcito, glassa satinata e granella fondente.",
      "bomba-fritta": "Il lievitato fritto della tradizione, farcito o semplice.",
      cuore: "Sfoglia a cuore, cinque farciture a gamma.",
      frittella: "Il fritto morbido da banco, in due gusti.",
      intriko: "Treccia di sfoglia farcita, quattro varianti più la versione vuota.",
      lusekatt: "La girella nordica allo zafferano.",
      nuvola: "Il lievitato più leggero della gamma, cinque gusti.",
      stella: "Sfoglia a stella, cinque varianti.",
      klejner: "Il nodo fritto della tradizione nordica, senza farcitura.",
      "focaccine-miste-tre-gusti": "Set da tre gusti, pronto per il banco.",
      montanarina: "La base fritta napoletana, due condimenti.",
      "paninetto-colorato-tre-gusti": "Tre impasti colorati, un unico formato.",
      "pizzetta-al-pomodoro": "Il formato classico da rosticceria.",
      "pizzetta-bianca": "Olio e sale, formato classico.",
      "pizzetta-fritta": "Due formati per il banco caldo.",
      "pizzette-fantasia": "Quattro condimenti a rotazione stagionale.",
      rustici: "Sei ripieni su base sfoglia.",
      "vol-au-vent": "La sfoglia monoporzione da farcire.",
    },
    assi: {
      gusto: "Gusto",
      farcitura: "Farcitura",
      finitura: "Finitura",
      formato: "Formato",
    },
    valori: {
      cioccolato: "cioccolato",
      "tre cioccolati": "tre cioccolati",
      crema: "crema",
      pistacchio: "pistacchio",
      marmellata: "marmellata",
      "frutti di bosco": "frutti di bosco",
      semplice: "semplice",
      granella: "granella",
      vuoto: "vuoto",
      mozzarella: "mozzarella",
      pomodoro: "pomodoro",
      bianca: "bianca",
      bianco: "bianco",
      curcuma: "curcuma",
      funghi: "funghi",
      olive: "olive",
      verdure: "verdure",
      wurstel: "wurstel",
      peperoni: "peperoni",
      pizzaiola: "pizzaiola",
      "4 formaggi": "4 formaggi",
      "ricotta e spinaci": "ricotta e spinaci",
      piccola: "piccola",
      media: "media",
    },
    farciture: {
      "ciock-e-lampone": "Ciock e lampone",
      "crema-e-fragola": "Crema e fragola",
      "frutti-di-bosco-e-ribes": "Frutti di bosco e ribes",
      "pistacchio-e-lampone": "Pistacchio e lampone",
      "crema-e-lampone": "Crema e lampone",
      "marmellata-frutti-rossi-e-ribes": "Marmellata frutti rossi e ribes",
      cioccolato: "Cioccolato",
      pistacchio: "Pistacchio",
      crema: "Crema",
      "tre-cioccolati": "Tre cioccolati",
      "frutti-rossi": "Frutti rossi",
      "senza-farcitura": "Senza farcitura",
      caramello: "Caramello",
      "dulce-de-leche": "Dulce de leche",
      cannella: "Cannella",
    },
    topping: {
      "zucchero-a-velo-idrorepellente": "Zucchero a velo idrorepellente",
      "perle-di-zucchero-idrorepellenti-al-cacao":
        "Perle di zucchero idrorepellenti al cacao",
      "perle-di-zucchero-idrorepellenti-bianche":
        "Perle di zucchero idrorepellenti bianche",
      "scagliette-di-cioccolato-tutti-e-3-i-cioccolati":
        "Scagliette di cioccolato (tutti e 3 i cioccolati)",
      "perle-di-zucchero-colorate-rosse": "Perle di zucchero colorate rosse",
      semolato: "Semolato",
    },
    modalitaUso: "DECONGELARE A TEMPERATURA AMBIENTE PER 3 h",
    scattoProdotto: "scatto di prodotto",
  },

  configuratore: {
    percorso: [
      {
        titolo: "Scegli la base",
        testo: "Seleziona la base che preferisci e dai forma al tuo dolce.",
      },
      {
        titolo: "Aggiungi la farcitura",
        testo: "Scegli la crema o il ripieno che più ti ispira.",
      },
      {
        titolo: "Completa con il topping",
        testo: "Aggiungi croccantezze, frutta, golosità e decorazioni.",
      },
      {
        titolo: "Ottieni il tuo dolce",
        testo: "Visualizza il risultato e completa la tua creazione.",
      },
    ],
    statiNastro: [
      "Nuvola vuota, la base senza farcitura",
      "Nuvola farcita con crema e fragola",
      "Nuvola alla crema e fragola con zucchero a velo",
    ],
    intro: {
      titolo: [
        { testo: "Crea" },
        { testo: "il tuo" },
        { testo: "dolce!", accento: true },
      ],
      copy: ["Gioca, combina, personalizza.", "Il dolce che immagini,", "lo crei tu!"],
      comeFunziona: "Come funziona",
    },
    comeFunziona: {
      titolo: "Come funziona",
      passi: [
        {
          titolo: "Level 01 — scegli il player",
          testo:
            "Dieci basi, tutte disponibili. Trascinala sul palco con il mouse, oppure toccala: il risultato è identico.",
        },
        {
          titolo: "Level 02 — carica la farcitura",
          testo:
            "Compaiono solo le farciture che esistono davvero per quella base: niente scelte che poi non si possono fare.",
        },
        {
          titolo: "Level 03 — chiudi la combo",
          testo:
            "La finitura la decide la ricetta, ma la posi tu. Poi arrivano formato, ordine minimo e quantità in pedane, e la richiesta parte già completa.",
        },
      ],
      chiudi: "Chiudi",
      ok: "Ho capito, si comincia",
    },
    titoli: {
      passo1: "Scegli la tua base",
      passo2: "Ora riempiamolo",
      passo3: "Il tocco finale",
      completo: "Boom. È pronto!",
    },
    passoDi: "Passo {n} di 3 — {titolo}",
    avvisoFarcituraSparita:
      "La farcitura del link che hai aperto non è più disponibile per questa base: scegline una tra quelle a listino.",
    riepilogo: {
      base: "Base",
      farcitura: "Farcitura",
      finitura: "Finitura",
      cambia: "cambia",
      tornaAlPasso: "Torna al passo {n}, {etichetta}: {valore}",
      avanzamento: "Avanzamento del configuratore",
    },
    banco: {
      ariaVuoto:
        "Palco del configuratore, vuoto: trascina o tocca una base per posarla sul palco",
      ariaConDolce: "Palco del configuratore: {nome}{stato}",
      mancaPasso1: ". Manca la tua base",
      mancaPasso2: ". Manca la farcitura",
      mancaPasso3: ". Manca la finitura",
      completoAria: ". Il dolce è completo",
      mollaQui: "Sì! Molla qui!",
      trascinaVuoto: ["Trascina qui", "la tua base"],
      toccaVuoto: ["Tocca qui", "la tua base"],
      trascinaPasso2: "Trascina qui la farcitura",
      trascinaPasso3: "Trascina qui la finitura",
      toccaPasso2: "Tocca la farcitura per lanciarla",
      toccaPasso3: "Tocca la finitura per lanciarla",
      oppureLista: "oppure sceglila nella lista",
      fotoSenzaFinitura: "Foto senza finitura — descritta accanto",
      cambiaFarcitura: "Cambia farcitura",
      cambiaBase: "Cambia base",
      ricomincia: "Ricomincia",
    },
    tessera: {
      prendimi: "Prendimi!",
      inVolo: "In volo!",
      diventa: "diventa {nome}",
      dallaRicetta: "dalla ricetta",
      farciture: { uno: "1 farcitura a listino", molti: "{n} farciture a listino" },
    },
    finitura: {
      bossLevel:
        "Boss level: {nome} · {farcitura} vuole la sua finitura. Mettila tu e chiudi la combo.",
      boom: "Boom! {nome} · {farcitura} è completo, con {topping}.",
      combo:
        "Tre livelli, tre mosse: la combo è pronta. Ora scegli la quantità e mandala in quotazione.",
      grammatura: "Grammatura",
      diametro: "Diametro",
      modalitaUso: "Modalità d'uso",
      copiaLink: "Copia il link del tuo dolce",
      linkCopiato: "Link copiato!",
      linkCopiatoAria: "Link copiato negli appunti",
      richiediQuotazione: "Richiedi la quotazione →",
    },
    scala: {
      titolo: "Il formato",
      vassoio: "1 vassoio",
      cartone: "1 cartone",
      pedana: "1 pedana",
      pezzi: { uno: "1 pezzo", molti: "{n} pezzi" },
      vassoi: { uno: "1 vassoio", molti: "{n} vassoi" },
      cartoni: { uno: "1 cartone", molti: "{n} cartoni" },
      pedane: { uno: "1 pedana", molti: "{n} pedane" },
      suStrati: "su {strati} strati da {perStrato}",
      cartoneAPeso:
        "Il listino dichiara il cartone a peso ({peso}): il conteggio dei pezzi è derivato dai vassoi.",
      dalListino: "Dal listino: “{testo}”",
    },
    quantita: {
      titolo: "La quantità",
      pedane: "Pedane",
      equivale: "= {cartoni} · {pezzi} · {peso}",
      indicaIntero:
        "Indica un numero intero di pedane: è l'unità con cui viaggia il prodotto.",
      minimoDichiarato: "Questa referenza si ordina da {min} pedane",
      minimoPezzi: ", pari a {pezzi} pezzi",
      sottoMinimo: "Con {pedane} sei sotto il minimo di {min}.",
      portaA: "Porta a {min} pedane",
      oppureScrivi: "oppure, se ti serve un quantitativo più piccolo,",
      scriviCommerciale: "scrivi al commerciale",
      contattoValeDiPiu: ": un contatto vale più di un rifiuto.",
      mailOggetto: "Quantitativo sotto il minimo — {base}",
      mailCorpo:
        "Sarei interessato a {base} ({sku}) per un quantitativo inferiore alle {min} pedane di ordine minimo. È possibile parlarne?",
    },
    modulo: {
      titolo: "Richiedi la quotazione",
      ragioneSociale: "Ragione sociale",
      ragioneSocialePh: "La tua azienda",
      canale: "Canale",
      canalePh: "Scegli il canale…",
      canali: {
        bar: "bar",
        pasticceria: "pasticceria",
        catering: "catering",
        GDO: "GDO",
      },
      email: "Email",
      emailPh: "nome@azienda.it",
      telefono: "Telefono",
      facoltativo: "(facoltativo)",
      telefonoPh: "+39 …",
      note: "Note",
      notePh: "Zona di consegna, tempi, altre referenze…",
      verifica: "Verifica e prepara →",
      verificaInCorso: "Verifica in corso…",
      prontaTitolo: "Richiesta pronta",
      prontaTesto:
        "Configurazione verificata sul listino {versione}: {pedane} = {cartoni} · {pezzi} · {peso}. Manca solo l'invio: parte dal tuo programma di posta, con tutti i dati già scritti.",
      inviaRichiesta: "Invia la richiesta →",
      alzaOppure: "Puoi alzare la quantità qui sopra, oppure",
      scriviCommerciale: "scrivere al commerciale",
      surMisura: "per un quantitativo su misura.",
      errori: {
        campiMancanti:
          "Per rispondere con il listino giusto servono ragione sociale, canale ed email.",
        versioneObsoleta:
          "Il listino è stato aggiornato mentre la pagina era aperta. Ricarica la pagina e riconferma la configurazione.",
        combinazioneInesistente:
          "Questa combinazione non è più a listino. Torna alla scelta della farcitura per vedere quelle disponibili.",
        quantitaNonValida:
          "La quantità va espressa in pedane intere, almeno una: è l'unità con cui viaggia il prodotto.",
        sottoMinimo: "Questa referenza si ordina da {min} pedane{pezzi}.",
        sottoMinimoPezzi: ", pari a {n} pezzi",
      },
      mail: {
        oggetto: "Richiesta quotazione — {nome} · {farcitura} — {pedane}",
        intestazione: "Richiesta di quotazione dal configuratore Delsigel",
        prodotto: "Prodotto: {nome} · {farcitura}",
        finitura: "Finitura: {topping}",
        grammaturaDiametro: "Grammatura: {g} g · Diametro: {cm} cm",
        quantitaRichiesta: "Quantità richiesta: {pedane}",
        equivale: "= {cartoni} · {pezzi} · {peso}",
        minimoRispettato: "Ordine minimo: {min} pedane — rispettato",
        minimoNonPrevisto: "Ordine minimo: non previsto per questa referenza",
        cliente: "Cliente: {nome} ({canale})",
        email: "Email: {email}",
        telefono: "Telefono: {telefono}",
        note: "Note: {note}",
        versione: "Versione listino: {versione}",
        riferimento: "Riferimento: {url}",
      },
    },
    salvataggio: {
      haiIdea: "Hai già un'idea?",
      condividi: "Salva la tua creazione e condividila!",
      salva: "Salva il tuo dolce",
      copiato: "Link copiato!",
      copiatoAria: "Link del dolce copiato negli appunti",
    },
  },

  chiSiamo: {
    intro: {
      eyebrow: "Chi siamo · Delsigel Italia",
      titolo: [
        { testo: "Un'industria" },
        { testo: "artigianale" },
        { testo: "a Sermoneta" },
      ],
      sigillo: "dal 1960 · IFS Food · Rainforest Alliance · RSPO",
      fotoAlt: "Quattro colleghe Delsigel abbracciate e sorridenti in laboratorio",
    },
    album: "L'album dello stabilimento:",
    storia: {
      eyebrow: "Delsigel · dal 1960",
      titolo: ["La nostra", "storia"],
      testo:
        "Sei capitoli con dentro numeri veri e mani vere. E una promessa che non cambia: fare del nostro meglio, ogni giorno.",
      marquee: ["mani", "tempo", "cura", "materia", "futuro"],
      progressoScorri: "scorri per continuare",
      tappe: {
        origini: {
          titolo: "2011",
          sottotitolo: "L'incontro",
          descrizione:
            "Del Monte, maestra dei fritti dolci. Siani, casa della pasta sfoglia. Nel 2011 due aziende dolciarie affermate uniscono ricette e mestiere: nasce Delsigel, a Sermoneta.",
          frase: "Due passioni, un'unica grande eccellenza.",
          alt: "Composizione editoriale evocativa di un pasticcere che apre il forno all'alba",
        },
        unione: {
          titolo: "L'ossimoro",
          sottotitolo: "Industria artigianale",
          descrizione:
            "Sembra una contraddizione, ma è il nostro segreto. Abbiamo unito il cuore e le ricette della pasticceria artigianale alla precisione delle tecnologie più avanzate. Il risultato? Prodotti che conservano l'amore e il gusto autentico del fatto a mano.",
          frase: "Mani d'artigiano, passo d'industria.",
          alt: "Composizione editoriale evocativa di due pasticceri che uniscono le mani sul banco",
        },
        qualita: {
          titolo: "La qualità",
          sottotitolo: "Certificata, ogni giorno",
          descrizione:
            "Materie prime selezionate e verifica di ogni processo produttivo attraverso i più rigidi standard internazionali: sicurezza alimentare, garantita dalla certificazione IFS Food; tutela dell'ambiente, sostenuta dagli standard Rainforest Alliance; etica e sostenibilità, certificata da RSPO per il rispetto di chi coltiva.",
          frase: "Certificata da chi non fa sconti.",
          alt: "Composizione editoriale evocativa di mani che piegano la sfoglia sul banco infarinato",
        },
        traguardo: {
          titolo: "13 milioni",
          sottotitolo: "2025 · Intriko",
          descrizione:
            "Nel 2025 abbiamo raggiunto un traguardo straordinario: 13 milioni di Intriko nati dall'unione tra la forza delle nostre macchine e la cura del lavoro manuale.",
          frase: "",
          alt: "Composizione editoriale evocativa di un pasticcere che controlla una linea moderna",
        },
        generazione: {
          titolo: "2026",
          sottotitolo: "La nuova generazione",
          descrizione:
            "Le grandi storie aziendali sono fatte di cicli naturali e di evoluzione. Entra in azienda la seconda generazione. La squadra si arricchisce di forze giovani, pronte a proseguire il percorso aziendale. La promessa: passano i testimoni, ma la formula di artigianalità e tecnologia resta la stessa. Ogni giorno.",
          frase: "",
          alt: "Composizione editoriale evocativa del passaggio di un ricettario tra due generazioni",
        },
        futuro: {
          titolo: "25 milioni",
          sottotitolo: "Il piano 2026–27",
          descrizione:
            "Abbiamo già tracciato la rotta per i prossimi anni. Nuovi investimenti per il 2027 permetteranno di raddoppiare la capacità produttiva. Nuove idee trasformate in nuovi prodotti, fedeli alla nostra identità.",
          frase: "",
          alt: "Composizione editoriale evocativa di una squadra di pasticceri al lavoro",
        },
      },
      certificazioni: {
        ifs: "Logo della certificazione IFS Food — International Featured Standards",
        rainforest: "Logo Rainforest Alliance, People & Nature",
        rspo: "Marchio RSPO — Certified Sustainable Palm Oil",
      },
      finale: {
        eyebrow: "La storia continua",
        frase: ["Cambiano le mani.", "Non cambia la cura."],
        coda: "Dal 1960, a Sermoneta · del nostro meglio, ogni giorno",
      },
      azione: "Conosci la squadra",
    },
    squadra: {
      titolo: "La squadra.",
      testo:
        "Ventuno volti, un solo laboratorio: l'industria artigianale al completo, dal 1960.",
      scritta: "una squadra coi fiocchi!",
      indietro: "Scorri la squadra indietro",
      avanti: "Scorri la squadra avanti",
      anniIn: "anni in Delsigel",
      reparto: "reparto",
      ruoli: {
        Fornaio: "Fornaio",
        Decoratrice: "Decoratrice",
        Impastatore: "Impastatore",
        Sfoglina: "Sfoglina",
        Pasticcere: "Pasticcere",
        Farcitrice: "Farcitrice",
        "Addetta linea": "Addetta linea",
        "L'anima del lab": "L'anima del lab",
        "Controllo qualità": "Controllo qualità",
        "Mastro fornaio": "Mastro fornaio",
        Glassatrice: "Glassatrice",
        "Addetto linea": "Addetto linea",
        "Capo turno": "Capo turno",
        Manutentore: "Manutentore",
        Mulettista: "Mulettista",
        "Custode dei -20°": "Custode dei -20°",
        "Capo produzione": "Capo produzione",
        Logistica: "Logistica",
        Apprendista: "Apprendista",
        Comunicazione: "Comunicazione",
        Commerciale: "Commerciale",
      },
      reparti: {
        Forni: "Forni",
        Dolci: "Dolci",
        Farina: "Farina",
        Linea: "Linea",
        Lab: "Lab",
        Motori: "Motori",
        Scorte: "Scorte",
        Cella: "Cella",
        Uffici: "Uffici",
      },
      ritratto: "{nome}, {ruolo} Delsigel",
    },
    nastri: [
      "Dal sacco di farina al sigillo",
      "Cinque stazioni · un solo standard",
      "Nessuna scorciatoia ★★★★★",
    ],
    marquee:
      "Delsigel / L'industria artigianale / Innovazione e Tradizione / Dal 1960 / ",
    linea: {
      eyebrow: "Il cuore tech · Sermoneta",
      titolo: [{ testo: "La linea" }, { testo: "produttiva" }],
      testo:
        "Cinque stazioni in linea, un solo standard su ogni lotto: è la parte tecnologica dell'azienda, quella che tiene insieme qualità costante e consegne puntuali.",
      statistiche: {
        stazioni: "stazioni in linea",
        certificato: "certificato · ogni lotto",
      },
      stazioneLabel: "Staz. {n}",
      stazioni: {
        sfoglia: {
          nome: "Sfoglia",
          alt: "Un operatore Delsigel regola la sfogliatrice al pannello di controllo",
        },
        formatura: {
          nome: "Formatura",
          alt: "Un'addetta Delsigel forma i dolci alla macchina della linea",
        },
        cottura: {
          nome: "Cottura in linea",
          alt: "I fritti dolci Delsigel avanzano dorati sul nastro di cottura",
        },
        confezionamento: {
          nome: "Confezionamento",
          alt: "Il carico dei vassoi sui carrelli della linea Delsigel",
        },
        spedizione: {
          nome: "Spedizione",
          alt: "Il mulettista Delsigel movimenta i pallet pronti alla spedizione",
        },
      },
      comeFunziona: "Come funziona",
      punti: [
        "Farine selezionate e impasti riposati in cella a temperatura controllata.",
        "Creme e ripieni dosati una referenza alla volta, senza compromessi.",
        "Forni in linea con la stessa curva di cottura su ogni lotto.",
        "Verifica finale e sigillo prima della partenza per il banco.",
        "Consegne puntuali, tracciate lotto per lotto: cambia la scala, mai il gesto.",
      ],
      vieniLabel: "Vieni a vederla",
      vieniCta: "Vieni a trovarci",
      vieniCoda: "Sermoneta · il forno è acceso",
    },
  },

  contatti: {
    titolo: "Contatti",
    promessaPrima: "Un listino, una campionatura, una visita in linea:",
    promessaForte: "scrivici e rispondiamo",
    promessaEvidenziata: "entro un giorno lavorativo.",
    recapiti: {
      email: { label: "Email", azione: "Scrivi a Delsigel" },
      telefono: { label: "Telefono", azione: "Chiama Delsigel" },
      pec: { label: "PEC", azione: "Scrivi alla PEC Delsigel" },
      stabilimento: {
        label: "Stabilimento",
        azione: "Apri lo stabilimento su Google Maps",
      },
    },
    reparti: {
      "commerciale-distribuzione": "Commerciale / Distribuzione",
      "prodotti-personalizzazioni": "Prodotti / Personalizzazioni",
      "qualita-certificazioni": "Qualità / Certificazioni",
      "amministrazione-contabilita": "Amministrazione / Contabilità",
      "lavora-con-noi": "Lavora con noi",
      altro: "Altro",
    },
    form: {
      titolo: "Scrivici",
      nome: "Nome",
      nomePh: "Es. Piera",
      cognome: "Cognome",
      cognomePh: "Es. Ollearo",
      telefono: "Telefono",
      telefonoPh: "+39 000 0000000",
      email: "Email",
      emailPh: "nome@azienda.it",
      azienda: "Azienda",
      aziendaPh: "Ragione sociale",
      ruolo: "Ruolo",
      ruoloPh: "Es. Buyer, titolare, R&D",
      reparto: "Reparto di interesse",
      repartoPh: "Seleziona un reparto",
      messaggio: "Messaggio",
      messaggioPh: "Raccontaci cosa ti serve: referenze, quantità, zona di consegna...",
      facoltativo: "(facoltativo)",
      privacy:
        "Dichiaro di aver letto l'Informativa Privacy e acconsento al trattamento dei miei dati personali ai sensi del Regolamento UE 2016/679 (GDPR).",
      invia: "Invia la richiesta",
      invioInCorso: "Invio in corso...",
      inviata: "Richiesta inviata",
      apriPosta: "Apri nel programma di posta",
      honeypot: "Sito web",
    },
    errori: {
      nomeCorto: "Serve un nome per sapere con chi stiamo parlando.",
      nomeLungo: "Il nome non può superare i {max} caratteri.",
      cognomeCorto: "Inserisci il cognome.",
      cognomeLungo: "Il cognome non può superare i {max} caratteri.",
      telefonoMancante: "Inserisci un numero di telefono.",
      telefonoErrato: "Controlla il numero di telefono e il prefisso.",
      emailMancante: "Senza un'email non possiamo risponderti.",
      emailLunga: "L'email non può superare i {max} caratteri.",
      emailErrata: "Controlla l'indirizzo: manca la chiocciola o il dominio.",
      aziendaCorta: "Inserisci il nome dell'azienda.",
      aziendaLunga: "L'azienda non può superare i {max} caratteri.",
      ruoloCorto: "Inserisci il tuo ruolo in azienda.",
      ruoloLungo: "Il ruolo non può superare i {max} caratteri.",
      repartoMancante: "Seleziona il reparto a cui vuoi inviare la richiesta.",
      messaggioCorto:
        "Scrivi almeno {min} caratteri: cosa ti serve, e in che quantità.",
      messaggioLungo: "Il messaggio non può superare i {max} caratteri.",
      privacyMancante:
        "Devi accettare l'informativa privacy per inviare la richiesta.",
    },
    esiti: {
      ricevuto: "Messaggio ricevuto. Ti rispondiamo entro un giorno lavorativo.",
      troppoInFretta:
        "Richiesta inviata troppo in fretta. Riprova fra qualche secondo.",
      controllaCampi: "Controlla i campi segnalati: manca qualcosa per risponderti.",
      troppiInvii:
        "Hai già inviato più richieste di fila. Aspetta qualche minuto, oppure chiamaci: +39 0773 319437.",
      canaleAssente:
        "L'invio dal sito non è ancora attivo. Apri il messaggio nel tuo programma di posta: è già compilato.",
      invioFallito:
        "Non siamo riusciti a inviare il messaggio. Riprova, oppure aprilo nel tuo programma di posta: è già compilato.",
    },
    mailRipiego: {
      oggetto: "Richiesta dal sito — {nome}",
      contatto: "contatto",
      nome: "Nome",
      cognome: "Cognome",
      telefono: "Telefono",
      email: "Email",
      azienda: "Azienda",
      ruolo: "Ruolo",
      reparto: "Reparto di interesse",
    },
  },

  slideCatalogo: {
    orecchini: {
      label: "Dolci da indossare",
      alt: "Modella con cappello leopardato indossa due dolci Delsigel come orecchini, su fondo giallo",
    },
    gioielli: {
      label: "Piccoli gioielli",
      alt: "Due bignè in scatoline regalo blu circondati da perle, orecchini e un orologio dorato, su fondo arancione",
    },
    borsa: {
      label: "Moda e pasticceria",
      alt: "Borsa lilla all'uncinetto con dentro due dolci ripieni di confettura, su fondo rosso",
    },
    "linea-salata": {
      label: "La linea salata",
      alt: "Ragazzo appoggiato a un piano arancione circondato da pizzette Delsigel",
    },
    condividere: {
      label: "Da condividere",
      alt: "Quattro mani prendono girelle e sfogliatine da piatti colorati, su fondo fucsia",
    },
    collezione: {
      label: "Da collezione",
      alt: "Due bomboloni su alzatine di cristallo con perle e papillon nero, su fondo rosso",
    },
    "finger-food": {
      label: "Finger food",
      alt: "Bocconcini salati farciti in equilibrio su vasi scultorei, su fondo blu",
    },
    pennello: {
      label: "Rifiniti a mano",
      alt: "Una mano rifinisce con un pennello un dolce a forma di fiore, accanto a una tavolozza di colori",
    },
    morso: {
      label: "Un morso alla volta",
      alt: "Ragazza con cerchietto di perle morde un bombolone alla confettura, su fondo arancione",
    },
    "san-valentino": {
      label: "Edizione San Valentino",
      alt: "Due bomboloni a forma di cuore su fondo blu disegnato a cuoricini",
    },
    scacchiera: {
      label: "Gioco di gusto",
      alt: "Bomboloni disposti come pedine su una scacchiera rosa e arancione",
    },
    coppette: {
      label: "Bocconcini salati",
      alt: "Tre bignè salati farciti in coppette a fantasia, su fondo giallo",
    },
    vaso: {
      label: "Sfoglia salata",
      alt: "Sfogliatine salate raccolte in un vaso di vetro fumé, su fondo verde",
    },
    vassoio: {
      label: "Il classico",
      alt: "Una mano prende uno di due bomboloni farciti da un vassoio ovale, su fondo giallo",
    },
  },

  metadata: {
    home: {
      titolo: "Delsigel Italia · L'industria artigianale",
      descrizione:
        "Delsigel, l'industria artigianale: innovativa e buona per tutti. Dolci e salati da laboratorio, prodotti su scala, dal 1960. Scopri il catalogo 2026/27.",
    },
    chiSiamo: {
      titolo: "Chi siamo · Delsigel Italia",
      descrizione:
        "Il team Delsigel e la linea produttiva: l'industria artigianale di Sermoneta, dal 1960.",
    },
    contatti: {
      titolo: "Contatti · Delsigel Italia",
      descrizione:
        "Richiedi il listino, prenota una visita in stabilimento o scrivi a Delsigel. Sermoneta (LT), dal 1960.",
    },
    configuratore: {
      radiceTitolo: "Configuratore dolci · Delsigel Italia",
      radiceDescrizione:
        "Componi il tuo prodotto: base, farcitura e formato, con la catena logistica e l'ordine minimo dichiarati prima dell'invio.",
      baseTitolo: "{base} · Configuratore Delsigel",
      baseDescrizione: "Scegli la farcitura per {base} e componi la tua richiesta.",
      combTitolo: "{nome} · {farcitura} · Configuratore Delsigel",
      combDescrizione:
        "{nome} con {farcitura}, finitura {topping}, {g} g. Configura quantità e richiedi la quotazione.",
    },
  },
};
