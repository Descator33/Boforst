import type { CSSProperties } from "react";

/**
 * Marchio ufficiale Delsigel: l'emblema a mandorla col vortice e il
 * wordmark "delsigel" sotto (asset da Delsigel_V3, manuale del
 * 20/08/2026 — l'unico lockup ufficiale è quello impilato).
 *
 * Il PNG è monocromatico e qui fa da maschera: il colore lo mette
 * `currentColor`, così il marchio si adatta alla superficie — bruno
 * storico (`--bruno`) sulle superfici chiare.
 */
export function LogoStorico({
  className,
  title = "Delsigel",
}: {
  className?: string;
  title?: string;
}) {
  const maschera: CSSProperties = {
    aspectRatio: "2415 / 1264",
    backgroundColor: "currentColor",
    maskImage: "url(/brand/logo-storico.png)",
    maskSize: "contain",
    maskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskImage: "url(/brand/logo-storico.png)",
    WebkitMaskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
  };
  return (
    <span
      role="img"
      aria-label={title}
      className={`block ${className ?? ""}`}
      style={maschera}
    />
  );
}
