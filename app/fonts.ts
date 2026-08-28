/**
 * Le voci tipografiche del configuratore standalone.
 *
 * Il CSS estratto (app/globals.css) chiama cinque famiglie:
 *   --font-archivo        Archivo variable (asse wdth) — sans e display
 *   --font-space-mono     etichette tecniche, codici, scala logistica
 *   --font-anton          alias --font-pop: i titoli-fumetto candy cream
 *   --font-dm-sans        alias --font-pop-testo: testo delle tessere
 *   --font-archivo-black  il nero da insegna (marchio-sticker)
 *
 * Le famiglie del catalogo e della hero del sito madre (Spartan, Tight,
 * Plex, Inter, Caveat) NON servono qui: gli alias nel blocco @theme
 * restano dichiarati ma cadono sui fallback, e nessuna classe del
 * configuratore li usa.
 *
 * Il subset "latin" copre tutte e cinque le lingue del sito.
 */
import {
  Anton,
  Archivo,
  Archivo_Black,
  DM_Sans,
  Space_Mono,
} from "next/font/google";

export const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

/** da applicare una volta sola, sull'<html> */
export const variabiliSito = [
  archivo.variable,
  spaceMono.variable,
  anton.variable,
  dmSans.variable,
  archivoBlack.variable,
].join(" ");
