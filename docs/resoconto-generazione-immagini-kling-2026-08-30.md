# Resoconto generazione immagini Kling

Data di completamento: 30 agosto 2026.

## Risultato

Il configuratore contiene tutti i 282 stati fotografici previsti dal dataset:

- 3 basi;
- 9 combinazioni base + farcitura;
- 54 combinazioni base + farcitura + credenza;
- 216 combinazioni complete con finitura.

Le 279 immagini derivate sono state create seguendo la catena padre-figlio: ogni
nuovo ingrediente è stato aggiunto allo stato immediatamente precedente. Per le
generazioni è stato usato prevalentemente il modello avanzato
`kling-image-v3_0_omni`; il primo tentativo del mini batch era stato eseguito con
`kling-image-o1`.

Le immagini pubblicate sono tutte PNG da 1536 × 1024 pixel, con quattro canali e
trasparenza alfa reale. Nuvola, Stella e Cuore sono state normalizzate sulla
stessa altezza visiva. Nessun JPEG e nessun tentativo rifiutato è stato inserito
in `public/img/configuratore/prodotti`.

## Tentativi

Distribuzione del tentativo al quale ogni immagine derivata è stata accettata:

| Tentativo accettato | Immagini |
| --- | ---: |
| 1 | 232 |
| 2 | 42 |
| 3 | 4 |
| 4 | 1 |
| 5 | 0 |
| 6 | 0 |
| **Totale** | **279** |

Nessuna immagine ha quindi richiesto tutte le sei generazioni autorizzate. Il
massimo è stato quattro tentativi, per
`cuore--crema--biscotti--zucchero-di-canna`.

Sono registrate 329 generazioni Kling con identificativo certo: 279 accettate e
50 scartate. Durante il lavoro si sono verificati anche tre invii per i quali la
connessione si è interrotta prima di restituire un identificativo; sono stati
registrati come tentativi ambigui e poi ripetuti in modo conservativo.

## Crediti

Il consumo documentabile dai task che hanno restituito un identificativo è di
1.313 crediti Kling:

- 1 generazione con `kling-image-o1`;
- 328 generazioni con `kling-image-v3_0_omni`.

Se Kling avesse elaborato e addebitato anche tutti e tre gli invii ambigui, il
totale effettivo potrebbe essere superiore di al massimo 12 crediti, quindi
compreso tra 1.313 e 1.325 crediti. Il dato definitivo di fatturazione può essere
confermato solo dallo storico crediti dell'account Kling.

## Verifica finale

La verifica indipendente sul contenuto pubblicato ha confermato:

- 282 cartelle con immagine, corrispondenti esattamente alla chiusura del dataset;
- 0 combinazioni mancanti;
- 0 combinazioni estranee;
- nome della cartella e nome del file coerenti con lo SKU;
- 282 PNG da 1536 × 1024 pixel con canale alfa variabile da 0 a 255;
- 0 JPEG nell'albero `public/img/configuratore`.

## Completamento tessere ingredienti — 31 agosto 2026

Sono state generate con `kling-image-v3_0_omni` anche le 13 immagini che
sostituiscono i placeholder tipografici delle tessere:

- 3 farciture (`crema`, `cioccolato`, `pistacchio`);
- 6 voci dalla credenza (`kinder-bueno`, `cioccolato-a-pezzi`, `corn-flakes`,
  `fragola`, `banana`, `biscotti`);
- 4 finiture (`zucchero`, `zucchero-a-velo`, `zucchero-di-canna`, `cacao`).

Ogni generazione ha prodotto un PNG quadrato da 1024 × 1024 pixel. Poiché
Kling ha restituito sfondi opachi anche quando era richiesto un alfa reale, i
soggetti sono stati scontornati localmente e verificati nuovamente: i 13 file
pubblicati sono RGBA con alfa variabile. Consumo complessivo: 13 crediti.

| Asset | Task Kling |
| --- | --- |
| crema | `AZpm-O2KrsIXafsoEh2A2XmACYX9B62M_gfPv0ehs8eDhM6fddHDze4UUIPi10VNxgza8IkW` |
| cioccolato | `AeBGutSsJpfMQ3wwtVe1-BXFG8XZH-Gy7q0NI87V3YeIarFXOYP2eNLOBm50j6ih7rIA0flU` |
| pistacchio | `AfZazMSa21YrCejtVcSSReugfj9tNwXF2pLWKZ1HUNnz4ooxzw7lvPpiFzrqixzFIA8oTHIB` |
| kinder-bueno | `AR5YmMiZ5HhnyqylkSJGEa8THqupKvPRJbnoUHpDylpK987436-qccz6fK9dOgWnjEKYmQkL` |
| cioccolato-a-pezzi | `AUDulWTcC55ITAr5t4ZaQSuFFe_Z9L0a0lKlizugWS3-aDid3EkgEMvWyJ-PkKIKDOplISVC` |
| corn-flakes | `AVe5SBLHC6eghZKsQoFRKKXUDXEgWeTF4hn38-htIpSj4hSsUZAsVbwjgbrvepSsvK4iY1p1` |
| fragola | `AZjH5RLqqnZpeAp5rV_4VXX45O_GvzQNWUQfsSKAmWWsfPXd6dodQPq9pLYUiN8Rrajy-Tvp` |
| banana | `ARQYQcRjhVcdmk4VXVlYEmvUMGmaefLyGzCLTCZNxDd3ABXl6H3Xrv2_6iYf0EIw-sNZxaXX` |
| biscotti | `AX4_-rXupGoZaaEJrLxJga1_XnCjmpZ_X7Ov0sebpIwvrNAVQ5omfG7nkMZ-v9yOzlEtpt_S` |
| zucchero | `Ad1w83U3TitMPozIGKt_H-VMJc0WUGRTicOKzAo-KPno-q8G3PR2SsKRNvqMJokKZcvJwP5Y` |
| zucchero-a-velo | `AT2Xc1ZvOlLOT2u716ePCl9RjoE90XuCIBqk-JWW-b3cwU0nuE-0V6iICXkl58XvhrCase43` |
| zucchero-di-canna | `AeHFaQvH7N-08JPuNJ5zlV69ttEaH_YZd2EmEFXCp5jtXPW4Y8Wd6lvX0WhYBcXD-ZXVAFpi` |
| cacao | `AZU8nkVsfkrQp7MbxDdvHiA5uw1FXAdup5BN4PcvWIEhz3iSlOct5V2xz88KcKXVr00LCneg` |
