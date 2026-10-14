import { getStore } from "@netlify/blobs";
import { LINHAS } from "./catalogo.mjs";

// Todo o estado fica num único documento, gravado com controle de versão (ETag),
// para que duas confirmações ao mesmo tempo nunca reservem o mesmo item duas vezes.
const CHAVE = "estado";
const VAZIO = () => ({ rsvps: [], extras: {}, atualizado: null });

const loja = () => getStore({ name: "baby-cha-maria-laura", consistency: "strong" });

export async function ler() {
  const r = await loja().getWithMetadata(CHAVE, { type: "json", consistency: "strong" });
  if (!r) return { estado: VAZIO(), etag: null };
  const e = r.data || {};
  return { estado: { ...VAZIO(), ...e, rsvps: e.rsvps || [], extras: e.extras || {} }, etag: r.etag };
}

// Aplica `alterar(estado)` com até 8 tentativas em caso de gravação concorrente.
// `alterar` devolve { estado, resposta } ou lança um objeto { status, corpo } para abortar.
export async function transacao(alterar) {
  for (let i = 0; i < 8; i++) {
    const { estado, etag } = await ler();
    const { estado: novo, resposta } = await alterar(structuredClone(estado));
    novo.atualizado = new Date().toISOString();
    const opts = etag ? { onlyIfMatch: etag } : { onlyIfNew: true };
    const w = await loja().setJSON(CHAVE, novo, opts);
    if (w.modified) return { estado: novo, resposta };
    await new Promise((r) => setTimeout(r, 40 + Math.random() * 120));
  }
  throw { status: 503, corpo: { erro: "ocupado", mensagem: "Muitas confirmações ao mesmo tempo. Tente de novo em instantes." } };
}

export function garantidos(estado) {
  const g = {};
  for (const id of Object.keys(LINHAS)) g[id] = 0;
  for (const r of estado.rsvps) for (const [id, q] of Object.entries(r.presentes || {})) if (id in g) g[id] += q;
  for (const [id, q] of Object.entries(estado.extras || {})) if (id in g) g[id] += q;
  return g;
}

export function restante(estado) {
  const g = garantidos(estado), out = {};
  for (const [id, L] of Object.entries(LINHAS)) out[id] = Math.max(0, L.total - g[id]);
  return out;
}

export const json = (corpo, status = 200, extra = {}) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });
