# Aplicação web de exemplo — CESMAC · Sistemas de Informação

Material de apoio para **alunos do 3º período** do curso de **Sistemas de Informação** da **CESMAC**. O projeto é um site simples servido por **Node.js**, com **Express** e páginas dinâmicas em **EJS**, para praticar rotas, templates e organização de um projeto web.

## O que você vai encontrar aqui

- Servidor HTTP com **Express** (`index.js`)
- Views em **EJS** (`views/`) — home, posts, detalhe do post, sobre, contato, login, cadastro e perfil
- Arquivos estáticos em `public/` (por exemplo, CSS)

## Pré-requisitos

- [Node.js](https://nodejs.org/) instalado (versão LTS recomendada)

## Como rodar o projeto

Na pasta do projeto:

```bash
npm install
```

Para subir o servidor (porta **3000**):

```bash
node index.js
```

Ou, durante o desenvolvimento, com recarregamento automático:

```bash
npm run dev
```

Abra o navegador em: `http://localhost:3000`

## Rotas principais

| Caminho        | Descrição                          |
|----------------|------------------------------------|
| `/`            | Página inicial com lista de posts  |
| `/posts`       | Lista de posts                     |
| `/post/:id`    | Detalhe de um post (ex.: `/post/1`)|
| `/about`       | Sobre                              |
| `/contact`     | Contato                            |
| `/login`       | Tela de login (exemplo)            |
| `/register`    | Cadastro (exemplo)                 |
| `/profile`     | Perfil (exemplo)                   |

## Estrutura de pastas (resumo)

```
sample-class/
├── index.js          # Rotas e dados em memória
├── package.json
├── public/           # CSS e outros estáticos
└── views/            # Templates EJS
```

## Objetivos de aprendizado (3º período · SI)

Este repositório ajuda a relacionar teoria e prática em:

- **Arquitetura cliente-servidor** e papel do servidor na camada web
- **Rotas HTTP** (`GET`) e parâmetros de URL (`:id`)
- **Templates** (EJS): inclusão de dados do servidor nas páginas HTML
- **Separação** entre lógica no servidor, marcação nas views e estilo no `public/`

Os textos dos posts são **fictícios** e servem só para preencher o layout; o foco é o código e os conceitos de desenvolvimento web.


*Projeto educacional — CESMAC · Curso de Sistemas de Informação.*
