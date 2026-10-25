import { createHash } from "node:crypto";

/** Solo server. Nessuna chiave o impostazione del mittente raggiunge il client. */
export async function consegnaQuotazione({
  oggetto,
  corpo,
  email,
  richiesta,
}: {
  oggetto: string;
  corpo: string;
  email: string;
  richiesta: string;
}): Promise<
  { stato: "inviata"; id: string } | { stato: "assente" | "errore" }
> {
  const key = process.env.RESEND_API_KEY,
    from = process.env.QUOTAZIONI_FROM;
  if (!key || !from) return { stato: "assente" };
  const idempotenza = createHash("sha256")
    .update(
      JSON.stringify({
        richiesta,
        oggetto,
        corpo,
        email,
        from,
        to: "info@delsigel.it",
      }),
    )
    .digest("hex");
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `quotazione/${idempotenza}`,
      },
      body: JSON.stringify({
        from,
        to: ["info@delsigel.it"],
        reply_to: email,
        subject: oggetto,
        text: corpo,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return { stato: "errore" };
    const result: unknown = await response.json();
    if (
      typeof result !== "object" ||
      !result ||
      !("id" in result) ||
      typeof result.id !== "string"
    )
      return { stato: "errore" };
    return { stato: "inviata", id: result.id };
  } catch {
    return { stato: "errore" };
  }
}
