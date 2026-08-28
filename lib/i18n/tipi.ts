/**
 * Il contratto dei dizionari: ogni lingua deve compilare TUTTO questo.
 *
 * Il tipo è scritto a mano (e non derivato con `typeof it`) perché è
 * il contratto a comandare i dizionari, non il contrario: una chiave
 * dimenticata in finlandese è un errore di compilazione, non un buco
 * che si scopre in pagina.
 *
 * Due regole di forma, imparate dalle lingue difficili:
 *
 *  1. NIENTE COMPOSIZIONE DI FRASI NEL CODICE. Dove l'italiano
 *     incastrava un pezzo in una frase ("Trascina qui" + "la tua
 *     base"), il dizionario tiene la frase INTERA per ogni caso: in
 *     finlandese l'oggetto cambia caso grammaticale (partitivo,
 *     genitivo) e in tedesco l'ordine delle parole non è quello
 *     italiano. I soli segnaposto ammessi sono valori — numeri, nomi
 *     propri — mai pezzi di sintassi.
 *
 *  2. LE RIGHE SONO DELLA LINGUA. I titoli mascherati riga per riga
 *     (hero, teaser, catalogo fisico) sono array: ogni lingua decide i
 *     propri a-capo, perché "Crea il tuo dolce" si spezza in punti
 *     diversi in tedesco e in finlandese.
 *
 * I dizionari viaggiano dal server al client come prop: devono restare
 * JSON puro, senza funzioni. Per i valori dentro i testi si usano i
 * segnaposto {nome} con lib/i18n/interpola.ts.
 */

/** Riga di un titolo mascherato; `accento` la colora come nell'hero. */
export type RigaInsegna = { testo: string; accento?: boolean };

/* Le chiavi dei dati prodotto: unioni esplicite, così una traduzione
   mancante per un singolo dolce è un errore di tipo. Gli id vengono da
   lib/catalog.ts e dal dataset del configuratore e NON si traducono
   mai — sono slug di URL, nomi di cartelle foto e chiavi di colore. */

export type SlugCatalogo =
  | "golosone"
  | "bomba-fritta"
  | "cuore"
  | "frittella"
  | "intriko"
  | "lusekatt"
  | "nuvola"
  | "stella"
  | "klejner"
  | "focaccine-miste-tre-gusti"
  | "montanarina"
  | "paninetto-colorato-tre-gusti"
  | "pizzetta-al-pomodoro"
  | "pizzetta-bianca"
  | "pizzetta-fritta"
  | "pizzette-fantasia"
  | "rustici"
  | "vol-au-vent";

export type ValoreAsse =
  | "cioccolato"
  | "tre cioccolati"
  | "crema"
  | "pistacchio"
  | "marmellata"
  | "frutti di bosco"
  | "semplice"
  | "granella"
  | "vuoto"
  | "mozzarella"
  | "pomodoro"
  | "bianca"
  | "bianco"
  | "curcuma"
  | "funghi"
  | "olive"
  | "verdure"
  | "wurstel"
  | "peperoni"
  | "pizzaiola"
  | "4 formaggi"
  | "ricotta e spinaci"
  | "piccola"
  | "media";

export type IdFarcitura =
  | "ciock-e-lampone"
  | "crema-e-fragola"
  | "frutti-di-bosco-e-ribes"
  | "pistacchio-e-lampone"
  | "crema-e-lampone"
  | "marmellata-frutti-rossi-e-ribes"
  | "cioccolato"
  | "pistacchio"
  | "crema"
  | "tre-cioccolati"
  | "frutti-rossi"
  | "senza-farcitura"
  | "caramello"
  | "dulce-de-leche"
  | "cannella";

export type IdTopping =
  | "zucchero-a-velo-idrorepellente"
  | "perle-di-zucchero-idrorepellenti-al-cacao"
  | "perle-di-zucchero-idrorepellenti-bianche"
  | "scagliette-di-cioccolato-tutti-e-3-i-cioccolati"
  | "perle-di-zucchero-colorate-rosse"
  | "semolato";

export type IdTappaStoria =
  | "origini"
  | "unione"
  | "qualita"
  | "traguardo"
  | "generazione"
  | "futuro";

export type IdSlideCatalogo =
  | "orecchini"
  | "gioielli"
  | "borsa"
  | "linea-salata"
  | "condividere"
  | "collezione"
  | "finger-food"
  | "pennello"
  | "morso"
  | "san-valentino"
  | "scacchiera"
  | "coppette"
  | "vaso"
  | "vassoio";

/** «1 pedana» / «{n} pedane»: il plurale è un testo intero, mai un
 *  suffisso — il finlandese conta col partitivo («3 lavaa»). */
export type Conteggio = { uno: string; molti: string };

export interface Testi {
  /* ------------------------------ guscio ------------------------------ */
  comune: {
    voci: {
      home: string;
      prodotti: string;
      configuratore: string;
      chiSiamo: string;
      contatti: string;
    };
    menu: {
      apri: string; // aria-label del burger chiuso
      chiudi: string; // aria-label del burger aperto
      etichettaMenu: string; // il testo «Menu» nel bottone
      etichettaChiudi: string; // il testo «Chiudi»
      navPrincipale: string; // aria-label delle due nav
      pannello: string; // aria-label del dialog a schermo pieno
      firma: [string, string]; // «Delsigel Italia» / «dal 1960»
    };
    lingua: {
      selettore: string; // aria-label del bottone
      lista: string; // aria-label della listbox
    };
    preloader: {
      caricamento: string; // la riga sotto la barra
      stato: string; // aria-label: {pct} è la percentuale
    };
  };

  footer: {
    tagline: string;
    colonne: {
      delsigel: { titolo: string; chiSiamo: string; storia: string; contatti: string };
      prodotti: { titolo: string; dolci: string; salati: string; catalogo: string };
      configuratore: { titolo: string; crea: string; comeFunziona: string; quotazione: string };
      contatti: { titolo: string };
    };
    instagram: string; // aria-label
    dove: string; // «Dove siamo»
    mappaTitolo: string; // title dell'iframe
    legale: string; // riga © — resta con P.IVA
    termini: string;
    privacy: string;
    cookie: string;
    credito: string;
  };

  /* ------------------------------- hero ------------------------------- */
  hero: {
    insegna: RigaInsegna[];
    alt: string; // alt del key visual
  };

  /* ------------------------------- home ------------------------------- */
  home: {
    storia: {
      eyebrow: string;
      luogo: string; // «Delsigel · Sermoneta»
      titolo: string[]; // righe mascherate
      testo: string;
      cta: string;
      prossimoLabel: string;
      prossimoNome: string;
      continuaAria: string;
    };
    catalogoAria: string; // aria-label sezione dolci in scena
    gammaAria: string; // aria-label del contenitore salati
    dolci: {
      eyebrow: string;
      titolo: string; // parte in tinta esclusa
      titoloAccento: string;
      promessa: string;
      tipologie: string; // «{n} tipologie»
      varianti: string; // «{n} varianti»
    };
    salati: {
      eyebrow: string;
      titolo: string;
      titoloAccento: string;
      promessa: string;
      tipologie: string;
      varianti: string;
    };
    ponte: string[]; // le righe di «Il prossimo / sei tu.»
    teaser: {
      eyebrow: string;
      titolo: RigaInsegna[];
      copy: string;
      cta: string;
    };
    catalogoFisico: {
      eyebrow: string;
      titolo: RigaInsegna[]; // l'ultima riga chiude col punto in tinta
      promessa: string[]; // due frasi, a capo gestito dal componente
      cta: string;
      edizione: string[]; // «Edizione stampata / da collezione»
      trascina: string;
      carosello: string; // aria-label del carosello
      slideDi: string; // «{i} di {tot}»
      fotoDi: string; // annuncio sr: «Fotografia {i} di {tot}: {label}»
      precedente: string;
      successiva: string;
      novita: string; // il sigillo — resta corto, sta in una stella
    };
  };

  /* ----------------------------- catalogo ----------------------------- */
  catalogo: {
    a11y: {
      carosello: string;
      diapositiva: string;
      prodottiSalati: string;
      precedenti: string;
      successivi: string;
      gruppoDi: string;
      vaiGruppo: string;
    };
    claims: Record<
      | "intriko"
      | "bomba-fritta"
      | "nuvola"
      | "pizzetta-al-pomodoro"
      | "pizzetta-fritta"
      | "montanarina",
      [string, string]
    >;
    badge: [string, string]; // «BEST / SELLER» nel sigillo a stella
    apriScheda: string; // «Apri la scheda di {nome}»
    chiudiScheda: string; // «Chiudi la scheda di {nome}»
    scopriDolci: string;
    scopriSalati: string;
    mostraVetrina: string;
    altriDolci: string;
    altriSalati: string;
    tipologieCoda: string; // «{n} tipologie» nella riga della coda
    varianti: string; // «{n} varianti» sulla tessera
    formatoUnico: string;
    scheda: {
      lineaDolci: string;
      lineaSalati: string;
      formato: string;
      peso: string;
      perCartone: string; // etichetta
      pezzi: string; // «{n} pz»
      variantiCatalogo: string;
      set: string;
      vediSpaccato: string;
      vediIntero: string;
      spaccatoAlt: string; // «{nome} tagliato a metà»
      fallbackDescrizione: string; // sr-only quando manca la nota
      richiedi: string;
    };
  };

  /* --------------------- dati prodotto (overlay) ---------------------- */
  prodotti: {
    note: Record<SlugCatalogo, string>;
    assi: { gusto: string; farcitura: string; finitura: string; formato: string };
    valori: Record<ValoreAsse, string>;
    farciture: Record<IdFarcitura, string>;
    topping: Record<IdTopping, string>;
    /** oggi identica per tutte le basi; l'italiano resta nel dataset */
    modalitaUso: string;
    scattoProdotto: string; // ripiego dell'alt quando manca la nota
  };

  /* --------------------------- configuratore --------------------------- */
  configuratore: {
    percorso: { titolo: string; testo: string }[]; // le 4 tappe in home
    statiNastro: [string, string, string]; // alt dei tre stati della Nuvola
    intro: {
      titolo: RigaInsegna[]; // l'ultima riga porta la sottolineatura
      copy: string[];
      comeFunziona: string;
    };
    comeFunziona: {
      titolo: string;
      passi: { titolo: string; testo: string }[];
      chiudi: string;
      ok: string;
    };
    titoli: { passo1: string; passo2: string; passo3: string; completo: string };
    passoDi: string; // sr: «Passo {n} di 3 — {titolo}»
    avvisoFarcituraSparita: string;
    riepilogo: {
      base: string;
      farcitura: string;
      finitura: string;
      cambia: string;
      tornaAlPasso: string; // «Torna al passo {n}, {etichetta}: {valore}»
      avanzamento: string; // aria-label del rail
    };
    banco: {
      ariaVuoto: string;
      ariaConDolce: string; // «Palco…: {nome}. {stato}»
      mancaPasso1: string;
      mancaPasso2: string;
      mancaPasso3: string;
      completoAria: string;
      mollaQui: string;
      trascinaVuoto: [string, string]; // le due righe sopra la freccia
      toccaVuoto: [string, string];
      trascinaPasso2: string;
      trascinaPasso3: string;
      toccaPasso2: string;
      toccaPasso3: string;
      oppureLista: string;
      fotoSenzaFinitura: string;
      cambiaFarcitura: string;
      cambiaBase: string;
      ricomincia: string;
    };
    tessera: {
      prendimi: string;
      inVolo: string;
      diventa: string; // «diventa {nome}»
      dallaRicetta: string;
      farciture: Conteggio; // «{n} farciture a listino» per l'aria-label
    };
    finitura: {
      bossLevel: string; // «Boss level: {nome} · {farcitura} vuole…»
      boom: string; // «Boom! {nome} · {farcitura} è completo, con {topping}.»
      combo: string;
      grammatura: string;
      diametro: string;
      modalitaUso: string;
      copiaLink: string;
      linkCopiato: string;
      linkCopiatoAria: string;
      richiediQuotazione: string;
    };
    scala: {
      titolo: string;
      vassoio: string;
      cartone: string;
      pedana: string;
      pezzi: Conteggio;
      vassoi: Conteggio;
      cartoni: Conteggio;
      pedane: Conteggio;
      suStrati: string; // «su {strati} strati da {perStrato}»
      cartoneAPeso: string; // «Il listino dichiara… ({peso})…»
      dalListino: string; // «Dal listino: “{testo}”»
    };
    quantita: {
      titolo: string;
      pedane: string; // etichetta del campo
      equivale: string; // «= {cartoni} cartoni · {pezzi} pezzi · {peso}»
      indicaIntero: string;
      minimoDichiarato: string; // «…si ordina da {min} pedane»
      minimoPezzi: string; // «, pari a {pezzi} pezzi»
      sottoMinimo: string; // «Con {n} … sotto il minimo di {min}.»
      portaA: string; // «Porta a {min} pedane»
      oppureScrivi: string;
      scriviCommerciale: string;
      contattoValeDiPiu: string;
      mailOggetto: string; // oggetto del mailto sotto-minimo
      mailCorpo: string; // corpo del mailto sotto-minimo
    };
    modulo: {
      titolo: string;
      ragioneSociale: string;
      ragioneSocialePh: string;
      canale: string;
      canalePh: string;
      canali: Record<"bar" | "pasticceria" | "catering" | "GDO", string>;
      email: string;
      emailPh: string;
      telefono: string;
      facoltativo: string;
      telefonoPh: string;
      note: string;
      notePh: string;
      verifica: string;
      verificaInCorso: string;
      prontaTitolo: string;
      prontaTesto: string; // «…listino {versione}: {pedane} pedane = …»
      inviaRichiesta: string;
      alzaOppure: string;
      scriviCommerciale: string;
      surMisura: string;
      errori: {
        campiMancanti: string;
        versioneObsoleta: string;
        combinazioneInesistente: string;
        quantitaNonValida: string;
        sottoMinimo: string; // «…si ordina da {min} pedane{pezzi}.»
        sottoMinimoPezzi: string; // «, pari a {n} pezzi»
      };
      mail: {
        oggetto: string; // «Richiesta quotazione — {nome} · {farcitura} — {pedane} pedane»
        intestazione: string;
        prodotto: string;
        finitura: string;
        grammaturaDiametro: string; // «Grammatura: {g} g · Diametro: {cm} cm»
        quantitaRichiesta: string;
        equivale: string;
        minimoRispettato: string;
        minimoNonPrevisto: string;
        cliente: string; // «Cliente: {nome} ({canale})»
        email: string;
        telefono: string;
        note: string;
        versione: string;
        riferimento: string;
      };
    };
    salvataggio: {
      haiIdea: string;
      condividi: string;
      salva: string;
      copiato: string;
      copiatoAria: string;
    };
  };

  /* ----------------------------- chi siamo ----------------------------- */
  chiSiamo: {
    intro: {
      eyebrow: string;
      titolo: RigaInsegna[]; // il punto in tinta chiude l'ultima riga
      sigillo: string; // «dal 1960 · IFS Food · …»
      fotoAlt: string;
    };
    album: string;
    storia: {
      eyebrow: string;
      titolo: [string, string]; // la foto-pillola sta prima della seconda
      testo: string;
      marquee: string[];
      progressoScorri: string;
      tappe: Record<
        IdTappaStoria,
        {
          titolo: string;
          sottotitolo: string;
          descrizione: string;
          frase: string;
          alt: string;
        }
      >;
      certificazioni: Record<"ifs" | "rainforest" | "rspo", string>; // alt dei loghi
      finale: { eyebrow: string; frase: [string, string]; coda: string };
      azione: string; // «Conosci la squadra»
    };
    squadra: {
      titolo: string;
      testo: string;
      scritta: string;
      indietro: string;
      avanti: string;
      anniIn: string;
      reparto: string;
      ruoli: Record<string, string>; // ruolo italiano → tradotto
      reparti: Record<string, string>;
      ritratto: string; // alt: «{nome}, {ruolo} Delsigel»
    };
    nastri: [string, string, string];
    marquee: string; // la STRIP ripetuta
    linea: {
      eyebrow: string;
      titolo: RigaInsegna[];
      testo: string;
      statistiche: { stazioni: string; certificato: string };
      stazioneLabel: string; // «Staz. {n}»
      stazioni: Record<
        "sfoglia" | "formatura" | "cottura" | "confezionamento" | "spedizione",
        { nome: string; alt: string }
      >;
      comeFunziona: string;
      punti: string[];
      vieniLabel: string;
      vieniCta: string;
      vieniCoda: string;
    };
  };

  /* ----------------------------- contatti ------------------------------ */
  contatti: {
    titolo: string;
    promessaPrima: string; // la riga prima del grassetto
    promessaForte: string; // dentro <strong>
    promessaEvidenziata: string; // dentro il pennarello
    recapiti: {
      email: { label: string; azione: string };
      telefono: { label: string; azione: string };
      pec: { label: string; azione: string };
      stabilimento: { label: string; azione: string };
    };
    reparti: Record<
      | "commerciale-distribuzione"
      | "prodotti-personalizzazioni"
      | "qualita-certificazioni"
      | "amministrazione-contabilita"
      | "lavora-con-noi"
      | "altro",
      string
    >;
    form: {
      titolo: string;
      nome: string;
      nomePh: string;
      cognome: string;
      cognomePh: string;
      telefono: string;
      telefonoPh: string;
      email: string;
      emailPh: string;
      azienda: string;
      aziendaPh: string;
      ruolo: string;
      ruoloPh: string;
      reparto: string;
      repartoPh: string;
      messaggio: string;
      messaggioPh: string;
      facoltativo: string;
      privacy: string;
      invia: string;
      invioInCorso: string;
      inviata: string;
      apriPosta: string;
      honeypot: string; // label del campo trappola (mai visto da umani)
    };
    errori: {
      nomeCorto: string;
      nomeLungo: string; // {max}
      cognomeCorto: string;
      cognomeLungo: string; // {max}
      telefonoMancante: string;
      telefonoErrato: string;
      emailMancante: string;
      emailLunga: string; // {max}
      emailErrata: string;
      aziendaCorta: string;
      aziendaLunga: string; // {max}
      ruoloCorto: string;
      ruoloLungo: string; // {max}
      repartoMancante: string;
      messaggioCorto: string; // {min}
      messaggioLungo: string; // {max}
      privacyMancante: string;
    };
    esiti: {
      ricevuto: string;
      troppoInFretta: string;
      controllaCampi: string;
      troppiInvii: string;
      canaleAssente: string;
      invioFallito: string;
    };
    mailRipiego: {
      oggetto: string; // «Richiesta dal sito — {nome}»
      contatto: string; // il ripiego quando manca il nominativo
      nome: string;
      cognome: string;
      telefono: string;
      email: string;
      azienda: string;
      ruolo: string;
      reparto: string;
    };
  };

  /* ------------------------- slide catalogo fisico ---------------------- */
  slideCatalogo: Record<IdSlideCatalogo, { label: string; alt: string }>;

  /* ------------------------------ metadata ------------------------------ */
  metadata: {
    home: { titolo: string; descrizione: string };
    chiSiamo: { titolo: string; descrizione: string };
    contatti: { titolo: string; descrizione: string };
    configuratore: {
      radiceTitolo: string;
      radiceDescrizione: string;
      baseTitolo: string; // «{base} · Configuratore Delsigel»
      baseDescrizione: string; // «Scegli la farcitura per {base}…»
      combTitolo: string; // «{nome} · {farcitura} · Configuratore Delsigel»
      combDescrizione: string; // «{nome} con {farcitura}, finitura {topping}, {g} g…»
    };
  };
}
