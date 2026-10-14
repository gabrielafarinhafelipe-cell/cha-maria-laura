import { ler, transacao, garantidos, restante, json } from "../lib/estado.mjs";
import { LINHAS } from "../lib/catalogo.mjs";
import { timingSafeEqual, createHash } from "node:crypto";

// Senha do painel: variável de ambiente PAINEL_SENHA, configurada no Netlify (nunca no código).
const h = (s) => createHash("sha256").update(String(s)).digest();
const autorizado = (req) => {
  const senha = process.env.PAINEL_SENHA;
  if (!senha) return false;
  return timingSafeEqual(h(req.headers.get("x-senha") || ""), h(senha));
};

const resumo = (estado) => ({
  rsvps: [...estado.rsvps].sort((a, b) => (a.criado < b.criado ? 1 : -1)),
  extras: estado.extras,
  garantidos: garantidos(estado),
  restante: restante(estado),
  atualizado: estado.atualizado,
});

// GET /api/painel → todas as confirmações. POST → cancelar uma confirmação ou ajustar presentes recebidos por fora.
export default async (req) => {
  if (!autorizado(req)) {
    await new Promise((r) => setTimeout(r, 600));
    return json({ erro: "senha", mensagem: "Senha incorreta." }, 401);
  }
  try {
    if (req.method === "GET") { const { estado } = await ler(); return json(resumo(estado)); }
    if (req.method !== "POST") return json({ erro: "metodo" }, 405);
    const b = await req.json().catch(() => ({}));
    const { estado } = await transacao(async (estado) => {
      if (b.acao === "cancelar") {
        estado.rsvps = estado.rsvps.filter((r) => r.id !== b.id);
      } else if (b.acao === "extra" && LINHAS[b.item]) {
        const v = Math.max(0, Math.min(LINHAS[b.item].total, parseInt(b.quantidade, 10) || 0));
        if (v) estado.extras[b.item] = v; else delete estado.extras[b.item];
      } else {
        throw { status: 400, corpo: { erro: "acao", mensagem: "Ação desconhecida." } };
      }
      return { estado, resposta: {} };
    });
    return json(resumo(estado));
  } catch (e) {
    if (e && e.status) return json(e.corpo, e.status);
    console.error(e);
    return json({ erro: "falha", mensagem: "Não foi possível carregar agora." }, 500);
  }
};

export const config = { path: "/api/painel" };
