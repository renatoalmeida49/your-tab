# Deploy — your-tab na VPS

O your-tab roda na VPS **tabbuilder** em `/opt/your-tab`, no mesmo modelo dos
outros sites do servidor:

```
Internet :80/:443
        │
   edge-caddy (/opt/infra/edge, caddy-docker-proxy) — ÚNICO que publica portas
        │  rede docker externa `proxy`
        ▼
   yourtab_web (nginx) ── /       → SPA
        │                 /api/*  → yourtab_api:3000
        ▼  rede interna do projeto
   yourtab_api ──► yourtab_mongo (volume your-tab_mongo_data)
```

- O `web` entra na rede `proxy` e se registra pelos **labels `caddy`** do
  `docker-compose.yml`. O edge descobre o container, emite o certificado
  (Let's Encrypt) e recarrega sozinho. Nenhum Caddyfile para editar.
- **Nenhuma porta publicada**: API e Mongo ficam só na rede interna.
- Build acontece na própria VPS (`docker compose up --build`), como no gambo.

## 1. DNS

Aponte o domínio para a VPS **antes** de subir (o Caddy precisa da porta 80
para emitir o certificado):

```
A    tab.meudominio.com  → 200.234.219.226
```

Com Cloudflare, deixe o proxy (nuvem laranja) desligado na primeira emissão.

## 2. Google OAuth

Google Cloud Console → *APIs e serviços → Credenciais → ID do cliente OAuth*:
adicione `https://tab.meudominio.com` em **Origens JavaScript autorizadas**.

## 3. Colocar o projeto em `/opt/your-tab` (uma vez)

Deploy key read-only para a VPS clonar o repo:

```bash
# na VPS, como o usuário que vai fazer o deploy (ex.: deploy)
ssh-keygen -t ed25519 -C "vps-your-tab" -f ~/.ssh/yourtab_deploy -N ""
cat ~/.ssh/yourtab_deploy.pub
# GitHub → renatoalmeida49/your-tab → Settings → Deploy keys → Add (sem write)
```

`~/.ssh/config` da VPS (alias próprio, para não conflitar com as chaves dos outros repos):

```
Host github-yourtab
  HostName github.com
  User git
  IdentityFile ~/.ssh/yourtab_deploy
  IdentitiesOnly yes
```

```bash
sudo mkdir -p /opt/your-tab && sudo chown deploy:deploy /opt/your-tab
git clone git@github-yourtab:renatoalmeida49/your-tab.git /opt/your-tab
cd /opt/your-tab
cp .env.example .env   # preencha YOURTAB_DOMAIN, GOOGLE_CLIENT_ID e JWT_SECRET
chmod 600 .env
./scripts/deploy.sh
```

## 4. Deploy automático (GitHub Actions)

`.github/workflows/deploy.yml`:

- **backend** / **frontend** — typecheck, testes e build (em PR e push).
- **deploy** — só na `main`: SSH na VPS → `./scripts/deploy.sh`
  (`git pull` + `docker compose up -d --build --wait`).

Secrets em GitHub → repo → *Settings → Secrets and variables → Actions*:

| Secret | Valor |
|---|---|
| `VPS_SSH_KEY` | chave **privada** que entra na VPS |
| `VPS_HOST` | `200.234.219.226` |
| `VPS_USER` | `deploy` (não-root, já está no grupo `docker`) |
| `VPS_PORT` | opcional (padrão `22`) |
| `VPS_APP_DIR` | opcional (padrão `/opt/your-tab`) |

## Operação

```bash
cd /opt/your-tab
./scripts/deploy.sh                 # atualizar manualmente
docker compose ps
docker compose logs -f api
curl -sI https://tab.meudominio.com | head
docker logs edge-caddy --tail 50    # rota e certificado
```

Backup do Mongo (o `scripts/backup-postgres.sh` do infra só cobre Postgres):

```bash
docker exec yourtab_mongo mongodump --db tab-builder --archive --gzip \
  > your-tab-$(date +%F).archive.gz
# restaurar
docker exec -i yourtab_mongo mongorestore --archive --gzip < your-tab-AAAA-MM-DD.archive.gz
```

## Regras do servidor

- **Nunca** `ports:` no compose; só o edge publica 80/443.
- Nomes únicos: projeto `your-tab`, containers `yourtab_*`, alias `yourtab-web` na `proxy`.
- O `.env` vive só na VPS e não é versionado.
- `docker compose down` remove a rota do edge; `./scripts/deploy.sh` a recria.
