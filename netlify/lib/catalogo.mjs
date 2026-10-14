// Lista de presentes do Baby Chá da Maria Laura (fonte única para as funções).
// A página usa a mesma lista em public/catalogo.js — mantenha as duas iguais.
export const PRESENTES = [
  { grupo: "Fraldas descartáveis", itens: [
    { nome: "Fraldas descartáveis", un: "pacote", tamanhos: [["P", 7], ["M", 20], ["G", 28], ["XG", 18]] },
  ]},
  { grupo: "Higiene e cuidados", itens: [
    { nome: "Pomada para prevenção de assaduras", q: 5, un: "unidade" },
    { nome: "Lenço umedecido", obs: "de preferência sem fragrância", q: 8, un: "unidade" },
    { nome: "Sabonete líquido", q: 4, un: "unidade" },
    { nome: "Kit de higiene", q: 1, un: "unidade" },
    { nome: "Kit de pente + escovinha", q: 1, un: "unidade" },
  ]},
  { grupo: "Banho, berço e enxoval", itens: [
    { nome: "Toalha com capuz", q: 2, un: "unidade" },
    { nome: "Toalha fralda", q: 2, un: "unidade" },
    { nome: "Kit de fraldas de pano", q: 5, un: "unidade" },
    { nome: "Cueiros", q: 3, un: "unidade" },
    { nome: "Manta", q: 2, un: "unidade" },
    { nome: "Kit berço", q: 2, un: "unidade" },
    { nome: "Trocador portátil", q: 1, un: "unidade" },
  ]},
  { grupo: "Roupinhas", itens: [
    { nome: "Conjunto de meias", q: 3, un: "unidade" },
    { nome: "Body", un: "unidade", tamanhos: [["P", 3], ["M", 4], ["G", 4], ["GG", 3]] },
    { nome: "Macacão", un: "unidade", tamanhos: [["P", 2], ["M", 4], ["G", 4], ["GG", 3]] },
    { nome: "Conjuntinho", un: "unidade", tamanhos: [["P", 2], ["M", 2], ["G", 2]] },
  ]},
  { grupo: "Passeio, banho e brincadeiras", itens: [
    { nome: "Tapete de atividades", q: 1, un: "unidade" },
    { nome: "Brinquedo de banho", q: 2, un: "unidade" },
    { nome: "Mordedor", q: 2, un: "unidade" },
    { nome: "Banheira com suporte", q: 1, un: "unidade" },
    { nome: "Bebê conforto", q: 1, un: "unidade" },
    { nome: "Cadeira de alimentação", q: 1, un: "unidade" },
    { nome: "Babá eletrônica", q: 1, un: "unidade" },
    { nome: "Bolsa maternidade", q: 1, un: "unidade" },
  ]},
];

export const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const LINHAS = {};
for (const g of PRESENTES) for (const it of g.itens) {
  if (it.tamanhos) for (const [t, q] of it.tamanhos) {
    const id = slug(it.nome) + "-" + slug(t);
    LINHAS[id] = { id, rot: `${it.nome} (Tam. ${t})`, total: q, un: it.un };
  } else {
    const id = slug(it.nome);
    LINHAS[id] = { id, rot: it.nome, total: it.q, un: it.un };
  }
}
