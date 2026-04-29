# Documento de Requisitos de Produto (PRD) — Blog CESMAC

**Versão:** 1.0  
**Data:** 22 de abril de 2026  
**Arquivo:** `docs/prd/blog-cesmac-prd-2026-04-29.md`  
**Contexto:** Aplicação web educacional (Express, EJS, MongoDB) — material de apoio ao curso de Sistemas de Informação.

---

## 1. Visão do produto

Blog simples em que visitantes leem publicações, usuários podem **criar conta**, **entrar**, **ver o próprio perfil** e, **após autenticação**, **criar, editar e excluir os próprios posts**. O foco é aprender arquitetura cliente-servidor, sessões/autenticação e CRUD com persistência, mantendo uso claro para o aluno final.

---

## 2. Objetivos

- Permitir cadastro e login com segurança básica (senha protegida, e-mail único).
- Mostrar dados do usuário na área de perfil.
- Restringir a gestão de posts a usuários logados e vincular posts ao autor quando aplicável.
- Manter navegação e mensagens de erro claras em português.

---

## 3. Escopo funcional

### 3.1 Entrar (login)

| ID   | Requisito | Prioridade |
|------|-----------|------------|
| AUTH-01 | Formulário com e-mail e senha (POST). | Alta |
| AUTH-02 | Validação: campos obrigatórios; mensagens de erro não revelam se o e-mail existe (opcional neste projeto: mensagem genérica “Credenciais inválidas”). | Alta |
| AUTH-03 | Após login bem-sucedido, criar sessão (ou cookie assinado) e redirecionar (ex.: home ou perfil). | Alta |
| AUTH-04 | Rotas públicas continuam acessíveis sem login. | Alta |
| AUTH-05 | Link ou botão “Sair” encerra sessão e redireciona. | Média |

**Critérios de aceitação:** Usuário cadastrado consegue autenticar e permanece logado entre requisições até logout ou expiração da sessão.

---

### 3.2 Cadastrar

| ID   | Requisito | Prioridade |
|------|-----------|------------|
| REG-01 | Formulário: nome, e-mail, senha, confirmação de senha. | Alta |
| REG-02 | Validações: campos obrigatórios; senhas coincidentes; senha mínima (ex.: 6 caracteres); e-mail em formato aceitável. | Alta |
| REG-03 | Senha armazenada apenas como hash (ex.: bcrypt), nunca em texto puro. | Alta |
| REG-04 | E-mail único no sistema; conflito retorna mensagem clara. | Alta |
| REG-05 | Sucesso: redirecionamento ou mensagem de sucesso convidando ao login. | Média |

**Critérios de aceitação:** Novo usuário consegue se cadastrar uma única vez por e-mail e não consegue cadastrar duplicado com o mesmo e-mail.

---

### 3.3 Visualizar perfil

| ID   | Requisito | Prioridade |
|------|-----------|------------|
| PROF-01 | Acesso apenas para usuário autenticado; visitante não logado é redirecionado ao login (ou recebe 401/403 com link para login). | Alta |
| PROF-02 | Exibir pelo menos: nome, e-mail (e opcionalmente data de cadastro). | Alta |
| PROF-03 | Navegação coerente com o restante do site (menu com estado “logado”). | Média |

**Critérios de aceitação:** Usuário logado vê seus dados; usuário não logado não acessa o conteúdo do perfil.

---

### 3.4 Gerenciar posts (somente se logado)

| ID   | Requisito | Prioridade |
|------|-----------|------------|
| POST-01 | **Listar** posts públicos na home/`/posts` (comportamento atual ou evoluindo para dados vindos do banco). | Alta |
| POST-02 | **Criar** post: formulário acessível só se autenticado; campos mínimos: título, corpo ou conteúdo (e opcionalmente resumo/data). | Alta |
| POST-03 | **Editar** post: apenas o autor (ou regra explícita do sistema) pode alterar; usuário não logado não vê ação de edição. | Alta |
| POST-04 | **Excluir** post: mesma regra de autorização que edição; confirmação antes de apagar (recomendado). | Alta |
| POST-05 | Usuário não logado que tenta acessar rotas de criação/edição via URL recebe redirecionamento ou erro adequado. | Alta |
| POST-06 | (Opcional) Post associado ao `userId` ou identificador do autor para auditoria e listagem “meus posts”. | Média |

**Critérios de aceitação:** Visitante só lê posts. Usuário logado pode publicar e gerenciar apenas o que o produto definir como “seus” posts. Não há criação/edição/exclusão anônima com efeito em posts de terceiros.

---

## 4. Requisitos não funcionais

| Área | Descrição |
|------|-----------|
| Segurança | HTTPS em produção; proteção CSRF em formulários POST (recomendado em evolução); cookies de sessão com flags adequadas (`httpOnly`, `secure` em produção). |
| Usabilidade | Mensagens em português; formulários com estados de erro e sucesso visíveis. |
| Dados | MongoDB para usuários (e posts, quando migrados da memória); índices (ex.: e-mail único). |
| Desempenho | Adequado para uso acadêmico; paginação de lista de posts se o volume crescer. |

---

## 5. Fora do escopo (esta versão)

- Recuperação de senha por e-mail.
- Perfis públicos ou URL `/u/:slug`.
- Comentários, curtidas ou moderação avançada.
- Papéis administrativos distintos (admin vs. autor), salvo definição explícita posterior.
- API REST separada para mobile (apenas se o curso incluir).

---

## 6. Métricas de sucesso (educacionais)

- Fluxo completo: cadastro → login → perfil → criar post → editar → excluir funciona sem erros críticos.
- Código organizado: rotas, views e acesso a dados separados de forma compreensível para o 3º período.

---

## 7. Dependências e riscos

- **MongoDB** disponível (local ou Docker) para cadastro e futura persistência de posts.
- **Sessão:** implementação de login exige middleware de sessão ou equivalente (não detalhado neste PRD técnico).
- Migração de posts “em memória” para coleção no MongoDB pode ser feita em incremental (PRD permite ambos desde que regras de autorização sejam respeitadas).

---

## 8. Glossário

| Termo | Significado |
|-------|-------------|
| Autenticação | Provar identidade (login). |
| Autorização | Decidir o que o usuário pode fazer (ex.: só o dono edita o post). |
| Post | Artigo ou entrada do blog exibida na listagem e na página de detalhe. |

---

*Documento alinhado ao repositório de exemplo CESMAC — blog com Express e EJS.*
