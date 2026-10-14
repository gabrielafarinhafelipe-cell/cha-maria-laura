# Baby Chá da Maria Laura — site no Netlify

Convite com confirmação de presença e lista de presentes que desconta sozinha.

## O que tem aqui

- `public/index.html` — o convite que os convidados abrem.
- `public/painel/` — painel da organizadora (endereço: `/painel`), protegido por senha.
- `netlify/functions/` — funções que gravam as confirmações e controlam o estoque de presentes.
- `netlify/lib/catalogo.mjs` — a lista de presentes. Se mudar algo, copie o arquivo também para `public/catalogo.mjs`.

As confirmações ficam guardadas no próprio Netlify (Netlify Blobs). Não é preciso configurar banco de dados.

## Publicar pelo computador (se não for pelo Claude)

1. Instale o Node.js (versão 18 ou mais nova).
2. Abra o terminal nesta pasta e rode:
   ```
   npm install
   npx netlify-cli login
   npx netlify-cli deploy --prod
   ```
3. Na primeira vez, escolha "Create & configure a new project" e aceite a pasta `public` quando perguntar.

## Senha do painel

A senha fica só na variável de ambiente `PAINEL_SENHA` do Netlify. Para trocar, altere essa variável (Project configuration → Environment variables) e publique de novo.
