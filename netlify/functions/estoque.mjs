import { ler, restante, json } from "../lib/estado.mjs";

// GET /api/estoque → quantas unidades de cada item ainda faltam.
export default async (req) => {
  if (req.method !== "GET") return json({ erro: "metodo" }, 405);
  try {
    const { estado } = await ler();
    return json({ restante: restante(estado), atualizado: estado.atualizado });
  } catch (e) {
    console.error(e);
    return json({ erro: "indisponivel", mensagem: "Não foi possível consultar a lista agora." }, 503);
  }
};

export const config = { path: "/api/estoque" };
