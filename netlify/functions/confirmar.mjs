import { transacao, restante, json } from "../lib/estado.mjs";
import { LINHAS } from "../lib/catalogo.mjs";

const limpa = (s, max) => String(s ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);

// POST /api/confirmar → grava a confirmação e reserva os presentes escolhidos, se ainda houver.
export default async (req) => {
  if (req.method !== "POST") return json({ erro: "metodo" }, 405);
  let b;
  try { b = await req.json(); } catch { return json({ erro: "invalido", mensagem: "Envio inválido." }, 400); }

  const id = limpa(b.id, 64);
  const nome = limpa(b.nome, 80);
  const presenca = b.presenca === "sim" ? "sim" : b.presenca === "nao" ? "nao" : "";
  const acomp = presenca === "sim" ? Math.max(0, Math.min(10, parseInt(b.acompanhantes, 10) || 0)) : 0;
  const recado = String(b.recado ?? "").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, " ").trim().slice(0, 400);
  const presentes = {};
  for (const [k, v] of Object.entries(b.presentes || {})) {
    const q = parseInt(v, 10);
    if (LINHAS[k] && q > 0) presentes[k] = Math.min(q, LINHAS[k].total);
  }
  if (!/^[a-z0-9-]{8,64}$/i.test(id)) return json({ erro: "invalido", mensagem: "Envio inválido. Recarregue a página." }, 400);
  if (!nome) return json({ erro: "nome", mensagem: "Escreva seu nome." }, 400);
  if (!presenca) return json({ erro: "presenca", mensagem: "Escolha se você vai ou não." }, 400);

  try {
    const { estado, resposta } = await transacao(async (estado) => {
      // Mesmo envio repetido (toque duplo, conexão instável): devolve o que já foi gravado.
      if (estado.rsvps.some((r) => r.id === id)) return { estado, resposta: { repetido: true } };
      const resta = restante(estado);
      const faltam = Object.entries(presentes).filter(([k, q]) => q > resta[k])
        .map(([k, q]) => ({ id: k, rot: LINHAS[k].rot, pedido: q, resta: resta[k] }));
      if (faltam.length) throw { status: 409, corpo: { erro: "esgotou", indisponiveis: faltam, restante: resta } };
      estado.rsvps.push({ id, nome, presenca, acompanhantes: acomp, recado, presentes, criado: new Date().toISOString() });
      return { estado, resposta: {} };
    });
    return json({ ok: true, ...resposta, restante: restante(estado), atualizado: estado.atualizado });
  } catch (e) {
    if (e && e.status) return json(e.corpo, e.status);
    console.error(e);
    return json({ erro: "falha", mensagem: "Não foi possível registrar agora. Tente de novo em instantes." }, 500);
  }
};

export const config = { path: "/api/confirmar" };
