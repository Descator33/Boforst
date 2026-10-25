"use client";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLingua } from "@/components/LinguaProvider";

/** Stessa azione e stesso ripiego per tutti i punti di condivisione. */
export function Condividi({
  classe = "",
  completo = true,
  onCompleta,
}: {
  classe?: string;
  completo?: boolean;
  onCompleta?: () => void;
}) {
  const pathname = usePathname();
  const id = useId();
  const { testi } = useLingua();
  const t = testi.configuratore.esperienza;
  const [copiato, setCopiato] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  useEffect(() => () => clearTimeout(timer.current), []);
  async function condividi() {
    if (!completo) {
      onCompleta?.();
      return;
    }
    const link = window.location.origin + pathname;
    setUrl(link);
    if (navigator.share && window.matchMedia("(pointer:coarse)").matches) {
      try {
        await navigator.share({ title: document.title, url: link });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopiato(pathname);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopiato(null), 2400);
    } catch {
      requestAnimationFrame(() => {
        dialog.current?.showModal();
        input.current?.focus();
        input.current?.select();
      });
    }
  }
  return (
    <>
      <button type="button" className={classe} onClick={() => void condividi()}>
        {!completo
          ? t.completaPrima
          : copiato === pathname
            ? testi.configuratore.finitura.linkCopiato
            : t.condividi}
      </button>
      <span aria-live="polite" className="sr-only">
        {copiato === pathname
          ? testi.configuratore.finitura.linkCopiatoAria
          : ""}
      </span>
      <dialog
        ref={dialog}
        className="configurator-share-dialog"
        aria-labelledby={`${id}-titolo`}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="p-6">
          <h2 id={`${id}-titolo`} className="text-xl font-bold">
            {t.linkManuale}
          </h2>
          <label className="sr-only" htmlFor={`${id}-link`}>
            {t.copia}
          </label>
          <input
            ref={input}
            id={`${id}-link`}
            readOnly
            value={url}
            className="my-5 w-full rounded-lg border p-3"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            type="button"
            className="configurator-action"
            onClick={() => dialog.current?.close()}
          >
            {t.chiudi}
          </button>
        </div>
      </dialog>
    </>
  );
}
