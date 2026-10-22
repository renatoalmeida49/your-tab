---

# Documento de Design de Software (SDD)

## Sistema de Cifras, Acervo Pessoal e Playlists

---

## 1. Visão Geral e Objetivos

### 1.1 Contexto Atual

A aplicação existente é um SPA (Single Page Application) puramente frontend voltado para a criação e exportação de cifras em formato PDF. Hoje a música em edição fica salva apenas no `localStorage` do navegador, sem persistência remota nem infraestrutura própria.

### 1.2 Objetivo da Evolução

Evoluir o sistema para uma aplicação conectada e persistente, permitindo que o usuário:

1. Faça login autenticado utilizando sua conta Google.
2. Salve, edite e gerencie suas cifras em uma nuvem pessoal.
3. Organize suas cifras em um acervo particular.
4. Crie e organize playlists musicais combinando as cifras salvas.
5. Seja hospedado em infraestrutura própria (VPS via Docker/Nginx) com suporte a HTTPS.

---

## 2. Arquitetura da Solução

### 2.1 Visão Geral dos Componentes

O sistema tem uma **API própria** (Node.js) com banco **MongoDB**, tudo hospedado na VPS em containers Docker. O Google é usado apenas para identificar o usuário (login). Os dados ficam no nosso banco.

```text
 [ Cliente (Navegador via HTTPS) ]
         │
         ▼
 [ Edge Caddy com SSL (VPS, rede proxy) ]
         │
         ▼
 [ Nginx (container frontend) ]
         ├── /       ──► arquivos estáticos da SPA
         └── /api/*  ──► [ API Node.js (container api) ] ──► [ MongoDB (container mongo) ]
                                   │
                                   └──► Google (validação do ID token no login)
```

O frontend e a API ficam no **mesmo domínio**: o Nginx do frontend repassa `/api/*` para a API. Assim o cookie de sessão é do próprio site e não há chamadas entre domínios em produção.

### 2.2 Estrutura do Repositório

```text
your-tab/
├── frontend/            SPA (Vue 3 + Vite + Pinia)
├── backend/             API (Fastify + TypeScript + MongoDB)
│   ├── src/
│   │   ├── auth/        login com Google e sessão
│   │   ├── ciphers/     CRUD do acervo
│   │   ├── playlists/   CRUD das playlists
│   │   ├── app.ts       montagem da API (plugins, rotas, erros)
│   │   ├── config.ts    variáveis de ambiente (validadas na subida)
│   │   ├── db.ts        coleções e índices
│   │   └── server.ts    ponto de entrada
│   ├── tests/           testes da API (Mongo em memória)
│   └── Dockerfile
├── docker-compose.yml   produção: mongo + api + web (edge da VPS)
└── SDD.md
```

### 2.3 Stack do Backend

| Item | Escolha |
|---|---|
| Runtime | Node.js 22 |
| Framework HTTP | Fastify 5 |
| Linguagem | TypeScript |
| Banco de dados | MongoDB 8 (driver oficial `mongodb`) |
| Validação | Zod |
| Login | `google-auth-library` (valida o ID token do Google) |
| Sessão | JWT em cookie `httpOnly` (`@fastify/jwt` + `@fastify/cookie`) |
| Testes | Vitest + `mongodb-memory-server` |

---

## 3. Modelo de Dados (MongoDB)

Todas as coleções guardam o dono do documento em `userId` (o `_id` do usuário na coleção `users`). Toda consulta da API filtra por esse campo.

### 3.1. Coleção `users`

* `_id` (ObjectId)
* `googleId` (String, identificador da conta Google — índice único)
* `email` (String)
* `name` (String)
* `picture` (String, opcional — foto da conta Google)
* `createdAt` (Date)
* `updatedAt` (Date)

### 3.2. Coleção `ciphers` (As Cifras)

A cifra é salva **no mesmo formato que o editor do frontend usa** (`frontend/src/types/song.ts`), para que abrir e salvar não perca nenhuma informação.

* `_id` (ObjectId)
* `userId` (ObjectId, dono)
* `title` (String - ex: "Garota de Ipanema")
* `artist` (String - ex: "Tom Jobim")
* `instrument` (String - `guitar`, `bass` ou `ukulele`)
* `tuning` (Array de Strings - afinação, uma nota por corda - ex: `["E","B","G","D","A","E"]`)
* `tone` (String - ex: "C")
* `parts` (Array - as partes da música, em ordem). Cada parte tem `id`, `type` e `info`:
  * `tab` → `info: { text }` (uma linha por corda)
  * `verse` → `info: { chords }`
  * `textField` → `info: { text }`
* `createdAt` (Date)
* `updatedAt` (Date)

Índice: `{ userId, updatedAt }`.

### 3.3. Coleção `playlists` (As Playlists)

* `_id` (ObjectId)
* `userId` (ObjectId, dono)
* `name` (String - ex: "Repertório Luau")
* `cipherIds` (Array de ObjectIds - lista ordenada com as cifras do acervo; a mesma cifra pode aparecer mais de uma vez)
* `createdAt` (Date)
* `updatedAt` (Date)

Índices: `{ userId, updatedAt }` e `{ cipherIds }`.

---

## 4. Requisitos Funcionais e Fluxos

### 4.1. Autenticação com Google

1. O usuário clica em "Entrar com o Google" (Google Identity Services no frontend).
2. O Google devolve ao frontend um **ID token** (`credential`).
3. O frontend envia o token para `POST /api/auth/google`.
4. A API valida o token com o Google (assinatura, validade e se foi emitido para o nosso `GOOGLE_CLIENT_ID`) e exige e-mail verificado.
5. A API cria o usuário na primeira vez ou atualiza nome, e-mail e foto nas seguintes.
6. A API responde com os dados do usuário e grava o cookie de sessão `session` (JWT, `httpOnly`, `sameSite=lax`, `secure` em produção, validade de 30 dias).
7. Nas próximas visitas, o frontend chama `GET /api/auth/me` para saber se já há sessão. Sem sessão a resposta é `{ "user": null }` (e não 401): visitante não é erro, e o editor funciona normalmente sem login.

O Client ID do Google fica só no `.env` da API; o frontend o obtém em `GET /api/auth/config` ao abrir o login. Com `GOOGLE_CLIENT_ID` vazio a API sobe, mas o login fica desligado e o frontend avisa.

### 4.2. Gestão de Acervo e Playlists

* **Acervo:** criação, edição, listagem e exclusão de cifras. A listagem traz só o resumo (título, artista, instrumento, tom, data de atualização); o conteúdo completo vem ao abrir a cifra.
* **Playlists:** criação de listas ordenadas com cifras do acervo. Só é possível incluir cifras do próprio usuário.
* **Exclusão de cifra:** a cifra é removida também de todas as playlists em que aparecia.
* **Exclusão de playlist:** as cifras continuam no acervo.

### 4.3. Endpoints da API

Todas as rotas de `/api/ciphers` e `/api/playlists` exigem sessão (sem sessão: `401`).

| Método | Rota | Descrição | Respostas |
|---|---|---|---|
| `GET` | `/api/health` | API no ar | `200` |
| `POST` | `/api/auth/google` | Login com o ID token do Google (`{ credential }`) | `200` + cookie, `401` |
| `POST` | `/api/auth/logout` | Encerra a sessão (apaga o cookie) | `204` |
| `GET` | `/api/auth/config` | Client ID do Google para o botão de login | `200` |
| `GET` | `/api/auth/me` | Usuário logado (`{ user }`, `null` sem sessão) | `200` |
| `GET` | `/api/ciphers` | Lista o acervo (resumo, mais recentes primeiro) | `200` |
| `POST` | `/api/ciphers` | Cria cifra | `201`, `400` |
| `GET` | `/api/ciphers/:id` | Cifra completa | `200`, `404` |
| `PUT` | `/api/ciphers/:id` | Substitui a cifra | `200`, `400`, `404` |
| `DELETE` | `/api/ciphers/:id` | Apaga a cifra (e tira das playlists) | `204`, `404` |
| `GET` | `/api/playlists` | Lista as playlists | `200` |
| `POST` | `/api/playlists` | Cria playlist (`{ name, cipherIds }`) | `201`, `400` |
| `GET` | `/api/playlists/:id` | Playlist | `200`, `404` |
| `PUT` | `/api/playlists/:id` | Substitui nome e ordem das cifras | `200`, `400`, `404` |
| `DELETE` | `/api/playlists/:id` | Apaga a playlist | `204`, `404` |

Erros de validação respondem `400` com `{ error, issues }`. Demais erros respondem `{ error }`.

---

## 5. Infraestrutura, Deploy e Hospedagem (Docker & VPS)

### 5.1. Containers

| Container | Imagem | Função |
|---|---|---|
| `yourtab_mongo` | `mongo:8` | Banco de dados, com volume `mongo_data`. Só na rede interna do projeto. |
| `yourtab_api` | `backend/Dockerfile` | API na porta 3000. Só na rede interna do projeto. |
| `yourtab_web` | `frontend/Dockerfile` | Nginx servindo a SPA e repassando `/api` para a API (`frontend/deploy/nginx.conf`). Único container na rede `proxy` do edge. |

O `docker-compose.yml` na raiz é o de produção: sobe os três, sem publicar portas. O passo a passo está no [DEPLOY.md](./DEPLOY.md).

### 5.2. Containerização da API (`backend/Dockerfile`)

Build em duas etapas: a primeira compila o TypeScript; a segunda leva só o JavaScript compilado e as dependências de produção, rodando com o usuário `node` (sem root).

### 5.3. Containerização do Frontend (`frontend/Dockerfile`)

Build em duas etapas: a primeira gera o `dist/` com o Vite; a segunda é um `nginx:alpine` com `frontend/deploy/nginx.conf`, que serve a SPA (fallback para `index.html`), repassa `/api/` para `api:3000` e responde `/health` para o healthcheck.

### 5.4. Variáveis de Ambiente da API

Em desenvolvimento, definidas em `backend/.env` (modelo em `backend/.env.example`). Em produção, no `.env` da raiz na VPS (modelo em `.env.example`); o compose fixa `NODE_ENV`, `PORT`, `MONGO_URL` e deriva `CORS_ORIGIN` de `YOURTAB_DOMAIN`. A API não sobe se alguma estiver faltando ou inválida.

| Variável | Descrição |
|---|---|
| `PORT` | Porta da API (padrão `3000`) |
| `MONGO_URL` | Endereço do MongoDB (no compose: `mongodb://mongo:27017`) |
| `MONGO_DB` | Nome do banco (padrão `tab-builder`) |
| `GOOGLE_CLIENT_ID` | Client ID do OAuth do Google. Vazio = login desligado (o resto da API funciona) |
| `JWT_SECRET` | Segredo que assina o cookie de sessão (mínimo 32 caracteres) |
| `CORS_ORIGIN` | Origem do frontend liberada no CORS (usada no desenvolvimento, quando frontend e API estão em portas diferentes) |
| `NODE_ENV` | `production` liga o cookie `secure` (só via HTTPS) |

### 5.5. Requisito de Segurança: SSL / HTTPS

* **Motivação:** o login com Google exige um ambiente seguro (`https://`), e o cookie de sessão em produção só trafega por HTTPS.
* **Implementação:** a VPS tem um edge compartilhado (`caddy-docker-proxy`, em `/opt/infra/edge`), único dono das portas 80/443. O container `web` entra na rede `proxy` e declara labels `caddy` com o domínio (`YOURTAB_DOMAIN`); o Caddy descobre a rota, emite e renova o certificado Let's Encrypt e encaminha o tráfego.

---

## 6. Segurança e Regras de Acesso

Sem um BaaS, as regras de acesso ficam na própria API:

* **Isolamento por usuário:** toda leitura, edição e exclusão filtra por `userId` da sessão. Cifra ou playlist de outro usuário responde `404`, como se não existisse (não revela que o documento existe).
* **Dono definido pelo servidor:** o `userId` nunca vem do corpo da requisição; é sempre o da sessão. Não é possível criar ou mover documentos para outro usuário.
* **Playlists:** só aceitam IDs de cifras do próprio usuário (`400` caso contrário).
* **Sessão:** JWT assinado com `JWT_SECRET`, em cookie `httpOnly` (o JavaScript da página não acessa) e `sameSite=lax` (outros sites não conseguem enviar requisições de escrita com a sessão do usuário).
* **Login:** o ID token do Google é validado no servidor, incluindo o `audience` (`GOOGLE_CLIENT_ID`); contas sem e-mail verificado são recusadas.
* **Validação de entrada:** todo corpo de requisição passa por schemas Zod, com limites de tamanho (título, quantidade de partes, cifras por playlist).
* **Banco:** o MongoDB fica acessível só na rede interna do Docker.

---

## 7. Testes

A API tem testes de ponta a ponta (`backend/tests/api.spec.ts`) que sobem um MongoDB em memória e substituem a validação do Google por uma versão falsa, sem precisar de rede nem de credenciais. Eles cobrem: login e sessão, CRUD de cifras e playlists, validação de formato, isolamento entre usuários e a remoção de cifras apagadas das playlists.

```bash
cd backend
yarn test
```

---

Este documento consolida a estratégia técnica do projeto, da API e persistência em MongoDB até o empacotamento e publicação na VPS própria.
