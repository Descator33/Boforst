import type { Lingua } from "./lingue";
export type TestiEsperienza = {
  postilla: string;
  caricamento: string;
  progresso: string;
  attendi: string;
  riprova: string;
  continua: string;
  erroreFoto: string;
  immagineCaricamento: string;
  immagineErrore: string;
  condividi: string;
  copia: string;
  linkManuale: string;
  chiudi: string;
  completaPrima: string;
  incluso: string;
  modifica: string;
  annulla: string;
  completato: string;
  datiIndicativi: string;
  scheda: string;
  schedaTesto: string;
  contatta: string;
  datiCliente: string;
  invia: string;
  invioInCorso: string;
  inviato: string;
  inviatoTesto: string;
  invioFallito: string;
  invioAssente: string;
  campiInvalidi: string;
  privacy: string;
  privacyTesto: string;
  minimoConferma: string;
  emailApp: string;
};
export const ESPERIENZA: Record<Lingua, TestiEsperienza> = {
  it: {
    postilla:
      "Questo configuratore è uno strumento puramente illustrativo e ludico a disposizione dei clienti per personalizzare visivamente le proprie preferenze. Tutti i marchi di prodotti terzi visualizzati o menzionati (es. Oreo, ecc.) appartengono ai rispettivi proprietari. Il nostro laboratorio artigianale non è in alcun modo collegato, associato, sponsorizzato o approvato dai titolari di tali marchi, i quali vengono utilizzati esclusivamente a scopo descrittivo e per la guarnizione dei dolci su richiesta dell’utente.",
    caricamento: "Prepariamo il tuo laboratorio",
    progresso: "Immagini caricate: {n} di {totale}",
    attendi: "Un momento, prepariamo le immagini dei tuoi dolci.",
    riprova: "Riprova",
    continua: "Continua comunque",
    erroreFoto:
      "Alcune immagini non sono state caricate. Puoi riprovare o continuare: le caricheremo quando serviranno.",
    immagineCaricamento: "Caricamento immagine…",
    immagineErrore: "Immagine non disponibile",
    condividi: "Condividi il tuo dolce",
    copia: "Copia link",
    linkManuale: "Seleziona e copia questo link",
    chiudi: "Chiudi",
    completaPrima: "Completa il dolce per condividerlo",
    incluso: "Incluso",
    modifica: "Modifica",
    annulla: "Torna al riepilogo",
    completato: "Configurazione completata",
    datiIndicativi:
      "Grammatura, peso, diametro e condizioni di ordine sono indicativi e soggetti a conferma commerciale.",
    scheda: "Informazioni sul prodotto",
    schedaTesto:
      "Per ingredienti, allergeni, conservazione e scheda tecnica aggiornata, contatta il commerciale indicando questa configurazione. Le immagini sono illustrative.",
    contatta: "Richiedi la scheda tecnica",
    datiCliente: "Modifica i dati",
    invia: "Invia la richiesta",
    invioInCorso: "Invio in corso…",
    inviato: "Richiesta inviata",
    inviatoTesto:
      "La richiesta è stata consegnata al nostro servizio email. Il commerciale ti risponderà all’indirizzo indicato.",
    invioFallito:
      "Non siamo riusciti a confermare l’invio. Riprova: la stessa richiesta non verrà duplicata. In alternativa, apri il messaggio nella tua app di posta.",
    invioAssente:
      "L’invio dal sito è in preparazione. Puoi aprire la richiesta nella tua app di posta; dovrai inviarla da lì.",
    campiInvalidi:
      "Controlla email, canale e lunghezza dei campi. Azienda: massimo 160 caratteri; telefono: 40; note: 2000.",
    privacy: "Privacy",
    privacyTesto:
      "I dati servono per rispondere alla tua richiesta di quotazione.",
    minimoConferma: "Ordine minimo da confermare con il commerciale.",
    emailApp: "Apri nella tua app di posta",
  },
  en: {
    postilla:
      "This configurator is a purely illustrative and recreational tool available to customers to visually customise their preferences. All third-party product trademarks displayed or mentioned (e.g. Oreo, etc.) belong to their respective owners. Our artisan pastry workshop is in no way connected with, associated with, sponsored by or endorsed by the owners of these trademarks, which are used exclusively for descriptive purposes and to decorate pastries at the user’s request.",
    caricamento: "Getting your pastry lab ready",
    progresso: "Images loaded: {n} of {totale}",
    attendi: "One moment while we prepare your pastry images.",
    riprova: "Try again",
    continua: "Continue anyway",
    erroreFoto:
      "Some images could not load. Retry or continue; we will load them when needed.",
    immagineCaricamento: "Loading image…",
    immagineErrore: "Image unavailable",
    condividi: "Share your pastry",
    copia: "Copy link",
    linkManuale: "Select and copy this link",
    chiudi: "Close",
    completaPrima: "Complete your pastry to share it",
    incluso: "Included",
    modifica: "Edit",
    annulla: "Back to summary",
    completato: "Configuration complete",
    datiIndicativi:
      "Weight, diameter and order conditions are indicative and subject to confirmation by our sales team.",
    scheda: "Product information",
    schedaTesto:
      "For ingredients, allergens, storage instructions and the current technical sheet, contact our sales team with this configuration. Images are illustrative.",
    contatta: "Request the technical sheet",
    datiCliente: "Edit your details",
    invia: "Send request",
    invioInCorso: "Sending…",
    inviato: "Request sent",
    inviatoTesto:
      "Your request has been handed to our email service. Our sales team will reply to the email address provided.",
    invioFallito:
      "We could not confirm delivery. Try again; the same request will not be duplicated. You can also open the message in your email app.",
    invioAssente:
      "Sending from this site is being set up. You can open the request in your email app and send it from there.",
    campiInvalidi:
      "Check your email, channel and field lengths. Company: up to 160 characters; phone: 40; notes: 2000.",
    privacy: "Privacy",
    privacyTesto: "Your details are used to respond to your quotation request.",
    minimoConferma: "Minimum order to be confirmed by our sales team.",
    emailApp: "Open in your email app",
  },
  fr: {
    postilla:
      "Ce configurateur est un outil purement illustratif et ludique mis à la disposition des clients pour personnaliser visuellement leurs préférences. Toutes les marques de produits tiers affichées ou mentionnées (par ex. Oreo, etc.) appartiennent à leurs propriétaires respectifs. Notre atelier artisanal n’est en aucun cas lié, associé, sponsorisé ou approuvé par les titulaires de ces marques, qui sont utilisées exclusivement à des fins descriptives et pour la garniture des pâtisseries à la demande de l’utilisateur.",
    caricamento: "Préparons votre atelier",
    progresso: "Images chargées : {n} sur {totale}",
    attendi: "Un instant, nous préparons les images de vos douceurs.",
    riprova: "Réessayer",
    continua: "Continuer quand même",
    erroreFoto:
      "Certaines images n’ont pas été chargées. Réessayez ou continuez ; elles seront chargées au besoin.",
    immagineCaricamento: "Chargement de l’image…",
    immagineErrore: "Image indisponible",
    condividi: "Partager votre douceur",
    copia: "Copier le lien",
    linkManuale: "Sélectionnez et copiez ce lien",
    chiudi: "Fermer",
    completaPrima: "Terminez votre douceur pour la partager",
    incluso: "Inclus",
    modifica: "Modifier",
    annulla: "Retour au récapitulatif",
    completato: "Configuration terminée",
    datiIndicativi:
      "Poids, diamètre et conditions de commande sont indicatifs et soumis à confirmation commerciale.",
    scheda: "Informations produit",
    schedaTesto:
      "Pour les ingrédients, allergènes, conditions de conservation et la fiche technique à jour, contactez notre équipe avec cette configuration. Images illustratives.",
    contatta: "Demander la fiche technique",
    datiCliente: "Modifier vos coordonnées",
    invia: "Envoyer la demande",
    invioInCorso: "Envoi en cours…",
    inviato: "Demande envoyée",
    inviatoTesto:
      "La demande a été transmise à notre service e-mail. Notre équipe répondra à l’adresse indiquée.",
    invioFallito:
      "L’envoi n’a pas pu être confirmé. Réessayez : la même demande ne sera pas dupliquée. Vous pouvez aussi ouvrir le message dans votre messagerie.",
    invioAssente:
      "L’envoi depuis le site est en préparation. Ouvrez la demande dans votre messagerie et envoyez-la depuis celle-ci.",
    campiInvalidi:
      "Vérifiez l’e-mail, le circuit et la longueur des champs. Entreprise : 160 caractères maximum ; téléphone : 40 ; notes : 2000.",
    privacy: "Confidentialité",
    privacyTesto: "Vos données servent à répondre à votre demande de devis.",
    minimoConferma: "Commande minimale à confirmer avec notre équipe.",
    emailApp: "Ouvrir dans votre messagerie",
  },
  de: {
    postilla:
      "Dieser Konfigurator ist ein rein anschauliches und spielerisches Werkzeug, mit dem Kunden ihre Vorlieben visuell individuell gestalten können. Alle angezeigten oder erwähnten Marken von Drittprodukten (z. B. Oreo usw.) gehören ihren jeweiligen Eigentümern. Unsere handwerkliche Backstube ist in keiner Weise mit den Inhabern dieser Marken verbunden oder assoziiert und wird von ihnen weder gesponsert noch unterstützt. Die Marken werden ausschließlich zu beschreibenden Zwecken und zur Garnierung der Backwaren auf Wunsch des Nutzers verwendet.",
    caricamento: "Wir bereiten Ihre Backstube vor",
    progresso: "Bilder geladen: {n} von {totale}",
    attendi: "Einen Moment, wir bereiten die Produktbilder vor.",
    riprova: "Erneut versuchen",
    continua: "Trotzdem fortfahren",
    erroreFoto:
      "Einige Bilder konnten nicht geladen werden. Versuchen Sie es erneut oder fahren Sie fort; wir laden sie bei Bedarf.",
    immagineCaricamento: "Bild wird geladen…",
    immagineErrore: "Bild nicht verfügbar",
    condividi: "Ihre Kreation teilen",
    copia: "Link kopieren",
    linkManuale: "Diesen Link auswählen und kopieren",
    chiudi: "Schließen",
    completaPrima: "Vervollständigen Sie Ihre Kreation, um sie zu teilen",
    incluso: "Enthalten",
    modifica: "Ändern",
    annulla: "Zurück zur Übersicht",
    completato: "Konfiguration abgeschlossen",
    datiIndicativi:
      "Gewicht, Durchmesser und Bestellbedingungen sind Richtwerte und müssen vom Vertrieb bestätigt werden.",
    scheda: "Produktinformationen",
    schedaTesto:
      "Für Zutaten, Allergene, Lagerung und das aktuelle Datenblatt wenden Sie sich mit dieser Konfiguration an den Vertrieb. Bilder dienen der Illustration.",
    contatta: "Datenblatt anfordern",
    datiCliente: "Angaben ändern",
    invia: "Anfrage senden",
    invioInCorso: "Wird gesendet…",
    inviato: "Anfrage gesendet",
    inviatoTesto:
      "Ihre Anfrage wurde an unseren E-Mail-Dienst übergeben. Der Vertrieb antwortet an die angegebene Adresse.",
    invioFallito:
      "Der Versand konnte nicht bestätigt werden. Versuchen Sie es erneut; dieselbe Anfrage wird nicht doppelt gesendet. Alternativ öffnen Sie die Nachricht in Ihrem E-Mail-Programm.",
    invioAssente:
      "Der Versand über die Website wird vorbereitet. Öffnen und senden Sie die Anfrage in Ihrem E-Mail-Programm.",
    campiInvalidi:
      "Prüfen Sie E-Mail, Vertriebskanal und Feldlängen. Firma: maximal 160 Zeichen; Telefon: 40; Hinweise: 2000.",
    privacy: "Datenschutz",
    privacyTesto:
      "Ihre Angaben werden zur Beantwortung Ihrer Angebotsanfrage verwendet.",
    minimoConferma: "Mindestbestellung mit dem Vertrieb bestätigen.",
    emailApp: "Im E-Mail-Programm öffnen",
  },
  fi: {
    postilla:
      "Tämä konfiguraattori on puhtaasti havainnollistava ja viihteellinen työkalu, jonka avulla asiakkaat voivat mukauttaa mieltymyksiään visuaalisesti. Kaikki esitetyt tai mainitut kolmansien osapuolten tuotemerkit (esim. Oreo jne.) kuuluvat omistajilleen. Käsityöleipomomme ei ole millään tavoin yhteydessä näiden tuotemerkkien omistajiin eikä toimi yhteistyössä heidän kanssaan, eivätkä he sponsoroi tai hyväksy toimintaamme. Tuotemerkkejä käytetään yksinomaan kuvaileviin tarkoituksiin ja leivonnaisten koristeluun käyttäjän pyynnöstä.",
    caricamento: "Valmistellaan leivontalaboratoriota",
    progresso: "Ladatut kuvat: {n}/{totale}",
    attendi: "Hetkinen, valmistelemme leivonnaisten kuvia.",
    riprova: "Yritä uudelleen",
    continua: "Jatka silti",
    erroreFoto:
      "Kaikkia kuvia ei voitu ladata. Yritä uudelleen tai jatka; lataamme kuvat tarvittaessa.",
    immagineCaricamento: "Kuvaa ladataan…",
    immagineErrore: "Kuva ei ole saatavilla",
    condividi: "Jaa luomuksesi",
    copia: "Kopioi linkki",
    linkManuale: "Valitse ja kopioi tämä linkki",
    chiudi: "Sulje",
    completaPrima: "Viimeistele luomuksesi ennen jakamista",
    incluso: "Sisältyy",
    modifica: "Muokkaa",
    annulla: "Takaisin yhteenvetoon",
    completato: "Kokoonpano on valmis",
    datiIndicativi:
      "Paino, halkaisija ja tilausehdot ovat alustavia ja edellyttävät myynnin vahvistusta.",
    scheda: "Tuotetiedot",
    schedaTesto:
      "Pyydä ainesosat, allergeenit, säilytysohjeet ja ajantasainen tuoteseloste myynniltä tämän kokoonpanon avulla. Kuvat ovat viitteellisiä.",
    contatta: "Pyydä tuoteseloste",
    datiCliente: "Muokkaa tietojasi",
    invia: "Lähetä pyyntö",
    invioInCorso: "Lähetetään…",
    inviato: "Pyyntö lähetetty",
    inviatoTesto:
      "Pyyntö on välitetty sähköpostipalveluumme. Myynti vastaa ilmoittamaasi sähköpostiosoitteeseen.",
    invioFallito:
      "Lähetystä ei voitu vahvistaa. Yritä uudelleen; samaa pyyntöä ei lähetetä kahdesti. Voit myös avata viestin sähköpostiohjelmassasi.",
    invioAssente:
      "Lähetys sivustolta on valmisteilla. Avaa pyyntö sähköpostiohjelmassasi ja lähetä se sieltä.",
    campiInvalidi:
      "Tarkista sähköposti, kanava ja kenttien pituudet. Yritys: enintään 160 merkkiä; puhelin: 40; huomautukset: 2000.",
    privacy: "Tietosuoja",
    privacyTesto: "Tietojasi käytetään tarjouspyyntöösi vastaamiseen.",
    minimoConferma: "Vähimmäistilaus vahvistetaan myynniltä.",
    emailApp: "Avaa sähköpostiohjelmassa",
  },
};
