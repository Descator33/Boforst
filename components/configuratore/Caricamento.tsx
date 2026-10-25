"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLingua } from "@/components/LinguaProvider";
import { interpola } from "@/lib/i18n/interpola";
import { scaricaFoto } from "@/lib/configuratore/caricamento";

export function Caricamento({
  urls,
  children,
}: {
  urls: string[];
  children: ReactNode;
}) {
  const { testi } = useLingua();
  const t = testi.configuratore.esperienza;
  const [stato, setStato] = useState({ fatti: 0, errori: 0, finito: false });
  const [salta, setSalta] = useState(false);
  const [tentativo, setTentativo] = useState(0);
  const totale = new Set(urls).size;
  const chiave = urls.join("|");
  const contenuto = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let attivo = true,
      indice = 0,
      fatti = 0,
      errori = 0;
    const timeout = setTimeout(() => {
      if (attivo) {
        attivo = false;
        setStato({
          fatti: fatti - errori,
          errori: Math.max(1, totale - fatti),
          finito: true,
        });
      }
    }, 20000);
    const elenco = [...new Set(chiave.split("|").filter(Boolean))];
    async function worker() {
      while (attivo && indice < elenco.length) {
        const url = elenco[indice++];
        try {
          await scaricaFoto(url);
        } catch {
          errori++;
        } finally {
          fatti++;
          if (fatti === elenco.length) clearTimeout(timeout);
          if (attivo)
            setStato({
              fatti: fatti - errori,
              errori,
              finito: fatti === elenco.length,
            });
        }
      }
    }
    if (!elenco.length) {
      queueMicrotask(() => {
        if (attivo) setStato({ fatti: 0, errori: 0, finito: true });
      });
    } else void Promise.all(Array.from({ length: 4 }, worker));
    return () => {
      attivo = false;
      clearTimeout(timeout);
    };
  }, [chiave, tentativo, totale]);
  const aperto = !salta && (!stato.finito || stato.errori > 0);
  return (
    <>
      {aperto && (
        <div
          className="configurator-loader"
          role="region"
          aria-labelledby="caricamento-titolo"
        >
          <div className="configurator-loader__card">
            <span aria-hidden className="configurator-loader__mark">
              D
            </span>
            <h2 id="caricamento-titolo">{t.caricamento}</h2>
            <p>{stato.finito ? t.erroreFoto : t.attendi}</p>
            <progress
              max={totale || 1}
              value={stato.fatti}
              aria-label={t.caricamento}
            />
            <p role="status">
              {interpola(t.progresso, { n: stato.fatti, totale })}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {stato.finito && (
                <button
                  type="button"
                  onClick={() => {
                    setStato({ fatti: 0, errori: 0, finito: false });
                    setTentativo((n) => n + 1);
                  }}
                >
                  {t.riprova}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSalta(true);
                  requestAnimationFrame(() =>
                    contenuto.current
                      ?.querySelector<HTMLElement>("button")
                      ?.focus(),
                  );
                }}
              >
                {t.continua}
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        ref={contenuto}
        inert={aperto}
        aria-hidden={aperto ? true : undefined}
      >
        {children}
      </div>
    </>
  );
}
