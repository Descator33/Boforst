/* eslint-disable @typescript-eslint/no-require-imports -- Harness CommonJS per eseguire e isolare i moduli server TypeScript. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"),
  ts = require("typescript"),
  Module = require("node:module"),
  path = require("node:path");
// Esegue i moduli condivisi senza avviare Next o inviare email reali.
const resolve = Module._resolveFilename,
  load = Module._load;
Module._resolveFilename = function (id, parent, ...args) {
  return resolve.call(
    this,
    id.startsWith("@/") ? path.resolve(__dirname, "..", id.slice(2)) : id,
    parent,
    ...args,
  );
};
Module._load = function (id, ...args) {
  if (id === "next/headers")
    return {
      headers: async () =>
        new Headers({ origin: "https://configuratore.example" }),
    };
  return load.call(this, id, ...args);
};
require.extensions[".ts"] = (m, f) =>
  m._compile(
    ts.transpileModule(fs.readFileSync(f, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    }).outputText,
    f,
  );
const c = require("../lib/configuratore.ts");
const { richiediQuotazione } = require("../app/configuratore/actions.ts");
function form(overrides = {}) {
  const f = new FormData();
  for (const [k, v] of Object.entries({
    ...c.DATASET.combinazioni[0],
    pedane: "1",
    lingua: "it",
    versione_listino: c.DATASET.versione,
    ragione_sociale: "Azienda test",
    email: "buyer@example.com",
    canale: "bar",
    request_id: "11111111-1111-4111-8111-111111111111",
    ...overrides,
  }))
    f.set(k, v);
  return f;
}
test("tutte le ricette, prefissi e lingue restano coerenti", () => {
  for (const ricetta of c.DATASET.combinazioni) {
    const a = [
      ricetta.base,
      ricetta.farcitura,
      ricetta.credenza,
      ricetta.finitura,
    ];
    for (let n = 0; n <= 4; n++)
      assert.equal(c.parseScelta(a.slice(0, n)).tipo, "render");
    for (const lang of ["it", "en", "fr", "de", "fi"])
      assert.equal(
        c.statoDaPathname("/" + lang + "/configuratore/" + a.join("/")).prodotto
          .sku,
        a.join("--"),
      );
    assert.equal(c.validaStato({ ...ricetta, pedane: 1 }).ok, true);
  }
});
test("mantiene ingredienti compatibili e include le opzioni uniche", () => {
  assert.deepEqual(c.sceltaCompatibile([]), ["nuvola"]);
  assert.deepEqual(
    c.sceltaCompatibile(["nuvola", "cioccolato", "fragola", "zucchero-a-velo"]),
    ["nuvola", "cioccolato", "fragola", "zucchero-a-velo"],
  );
  assert.deepEqual(
    c.sceltaCompatibile([
      "nuvola",
      "cioccolato",
      "kinder-bueno-dark",
      "zucchero-a-velo",
    ]),
    ["nuvola", "cioccolato"],
  );
  assert.deepEqual(c.sceltaCompatibile(["nuvola", "crema", "fragola"]), [
    "nuvola",
    "crema",
    "fragola",
    "zucchero-a-velo",
  ]);
});
test("peso preciso e quantità non valida respinta", () => {
  assert.equal(c.quantita("nuvola", 1).peso_kg, 235.2);
  assert.equal(c.quantita("nuvola", 3).peso_kg, 705.6);
  for (const pedane of [0, -1, 1.5, Infinity, 10001])
    assert.equal(
      c.validaStato({ ...c.DATASET.combinazioni[0], pedane }).errore,
      "QUANTITA_NON_VALIDA",
    );
});
test("server respinge email, canale, note e versione non validi", async () => {
  for (const values of [
    { email: "invalid" },
    { canale: "fake" },
    { note: "x".repeat(2001) },
    { ragione_sociale: "x".repeat(161) },
    { request_id: "invalid" },
  ]) {
    const r = await richiediQuotazione(null, form(values));
    assert.equal(r.ok, false);
    assert.equal(r.errore, "CAMPI_NON_VALIDI");
  }
  assert.equal(
    (await richiediQuotazione(null, form({ versione_listino: "old" }))).errore,
    "VERSIONE_OBSOLETA",
  );
});
test("senza configurazione non dichiara inviata la richiesta e genera un riferimento assoluto", async () => {
  const key = process.env.RESEND_API_KEY,
    from = process.env.QUOTAZIONI_FROM;
  delete process.env.RESEND_API_KEY;
  delete process.env.QUOTAZIONI_FROM;
  try {
    const r = await richiediQuotazione(null, form());
    assert.equal(r.ok, true);
    assert.equal(r.inviata, false);
    assert.match(
      decodeURIComponent(r.mailto),
      /https:\/\/configuratore.example\/it\/configuratore/,
    );
    assert.match(decodeURIComponent(r.mailto), /235,2/);
  } finally {
    if (key) process.env.RESEND_API_KEY = key;
    if (from) process.env.QUOTAZIONI_FROM = from;
  }
});
test("Resend: destinatario, reply-to, idempotenza, quantità aggiornata ed errore riprovabile", async () => {
  const oldFetch = global.fetch,
    key = process.env.RESEND_API_KEY,
    from = process.env.QUOTAZIONI_FROM;
  process.env.RESEND_API_KEY = "test-only";
  process.env.QUOTAZIONI_FROM = "test@example.com";
  const chiamate = [];
  global.fetch = async (url, args) => {
    chiamate.push(args);
    return new Response(JSON.stringify({ id: "test-id" }), { status: 200 });
  };
  try {
    const a = await richiediQuotazione(null, form());
    assert.equal(a.inviata, true);
    await richiediQuotazione(null, form());
    const q = await richiediQuotazione(null, form({ pedane: "2" }));
    assert.equal(q.quantita.peso_kg, 470.4);
    assert.equal(
      chiamate[0].headers["Idempotency-Key"],
      chiamate[1].headers["Idempotency-Key"],
    );
    assert.notEqual(
      chiamate[1].headers["Idempotency-Key"],
      chiamate[2].headers["Idempotency-Key"],
    );
    const body = JSON.parse(chiamate[0].body);
    assert.deepEqual(body.to, ["info@delsigel.it"]);
    assert.equal(body.reply_to, "buyer@example.com");
    global.fetch = async () => new Response("{}", { status: 503 });
    const errore = await richiediQuotazione(null, form());
    assert.equal(errore.errore, "INVIO_FALLITO");
    assert.ok(errore.mailto);
  } finally {
    global.fetch = oldFetch;
    if (key) process.env.RESEND_API_KEY = key;
    else delete process.env.RESEND_API_KEY;
    if (from) process.env.QUOTAZIONI_FROM = from;
    else delete process.env.QUOTAZIONI_FROM;
  }
});

test("precaricamento: richieste condivise e riprova dopo errore", async () => {
  const {
    scaricaFoto,
    preparaFoto,
  } = require("../lib/configuratore/caricamento.ts");
  const oldFetch = global.fetch,
    oldImage = global.Image;
  let chiamate = 0,
    decodifiche = 0;
  global.fetch = async () => {
    chiamate++;
    return new Response("image", { status: 200 });
  };
  global.Image = class {
    async decode() {
      assert.equal(this.src, "/decode.webp");
      decodifiche++;
    }
  };
  try {
    await Promise.all([
      scaricaFoto("/condivisa.webp"),
      scaricaFoto("/condivisa.webp"),
    ]);
    assert.equal(chiamate, 1);
    global.fetch = async () => {
      chiamate++;
      throw new Error("offline");
    };
    await assert.rejects(scaricaFoto("/riprova.webp"));
    global.fetch = async () => {
      chiamate++;
      return new Response("image", { status: 200 });
    };
    await scaricaFoto("/riprova.webp");
    assert.equal(chiamate, 3);
    await preparaFoto("/decode.webp");
    assert.equal(decodifiche, 1);
  } finally {
    global.fetch = oldFetch;
    global.Image = oldImage;
  }
});

test("i cinque dizionari coprono il catalogo e i controlli nuovi", () => {
  const { dizionario } = require("../lib/i18n/dizionario.ts");
  for (const lingua of ["it", "en", "fr", "de", "fi"]) {
    const d = dizionario(lingua);
    assert.ok(d.configuratore.esperienza.caricamento);
    assert.ok(d.configuratore.esperienza.invioFallito);
    for (const gruppo of ["farciture", "credenza", "finiture"])
      for (const voce of c.DATASET[gruppo])
        assert.ok(d.prodotti[gruppo][voce.id]);
    assert.ok(
      !JSON.stringify(d.configuratore.comeFunziona).includes("pistacchio"),
    );
  }
});
