"use client";

import { SottolineaturaOro } from "./Decori";
import { ComeFunziona } from "./ComeFunziona";
import { useTesti } from "@/components/LinguaProvider";

/**
 * La colonna introduttiva: l'insegna della pagina. Titolo su tre
 * righe, «dolce» in corallo col punto nero e la sottolineatura
 * disegnata, poche righe di testo, il pulsante «come funziona» e i
 * segni che accompagnano lo sguardo verso il palco.
 *
 * Il titolo NON usa la voce display del sito (Archivo esteso e tutto
 * maiuscolo, l'insegna industriale delle altre pagine): qui va in
 * tondo, alto e stretto di crenatura, come nella reference. È
 * l'unica deroga, ed è deliberata — la famiglia resta Archivo, e con
 * essa il resto del marchio.
 */
export function Intro() {
  const testi = useTesti();
  const intro = testi.configuratore.intro;
  const ultima = intro.titolo.length - 1;
  return (
    <div className="configurator-intro__inner relative">
      <span role="img" aria-label="Delsigel" className="config-play-logo">
        <svg aria-hidden viewBox="0 0 178 118" fill="none">
          <path className="config-play-logo__burst" d="M15 71 0 55l31-3L15 29l33 10 4-31 21 24L92 4l9 33 29-12-11 29 37 2-28 18 25 21-37-2 4 25-27-19-17 18-8-24-31 17 8-29Z" />
          <path className="config-play-logo__crown" d="m36 42 15-24 17 18 20-28 12 30 26-12-10 31H46L36 42Z" />
          <circle cx="139" cy="22" r="10" fill="#f43f83" />
          <path d="m134 15 9 13M145 16l-12 11" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".7" />
        </svg>
        <span>DELSIGEL</span>
        <i aria-hidden />
      </span>

      {/* le righe (e i loro a-capo) sono della lingua: l'ultima porta
          la sottolineatura disegnata */}
      <h1 className="configurator-title">
        {intro.titolo.map((riga, indice) =>
          indice === ultima ? (
            <span key={riga.testo} className="relative inline-block">
              <span>{riga.testo}</span>
              <SottolineaturaOro className="absolute -bottom-[0.12em] left-0 h-[0.14em] w-full text-viola" />
            </span>
          ) : (
            <span key={riga.testo} className="block">
              {riga.testo}
            </span>
          ),
        )}
      </h1>

      <p className="configurator-intro-copy">
        {intro.copy.map((riga, indice) => (
          <span key={riga} className={indice > 0 ? "block" : undefined}>
            {riga}
          </span>
        ))}
      </p>

      <div aria-hidden className="configurator-play-burst">
        <span>LET&apos;S</span>
        <strong>PLAY!</strong>
      </div>

      <ComeFunziona />
    </div>
  );
}
