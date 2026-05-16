# ERP ESA — módulo CGO (Central de Gerência de Operação)

Web app **MVP** em **React + TypeScript + Vite + Tailwind**: cadastro de modelos de operação, Radar, operações programadas, decisões CGO e logs. Os dados ficam no **navegador** (`localStorage`) e podem ser **exportados/importados** em JSON (Configuração CGO).

## Requisitos

- [Node.js](https://nodejs.org/) **LTS** (v18 ou v20 recomendado) com `npm` no PATH.

## Como correr no PC

```bash
cd erp-esa-cgo
npm install
npm run dev
```

Abre o endereço que o Vite mostrar (geralmente [http://localhost:5173](http://localhost:5173)).

### Aceder a partir do telemóvel na mesma rede Wi‑Fi

```bash
npm run dev:lan
```

Usa o URL **Network** indicado no terminal.

## Ver na Internet (GitHub Pages)

Depois de configurares o GitHub (passo único em **Settings → Pages → Source: GitHub Actions**), cada `git push` gera o site:

**https://galdinoivo-cpu.github.io/erp-esa-cgo/**

Na primeira vez:

1. No repositório: **Settings** → **Pages** (menu esquerdo).
2. Em **Build and deployment** → **Source**, escolhe **GitHub Actions** (não “Deploy from a branch”).
3. Faz **commit** e **push** deste projeto (o ficheiro `.github/workflows/deploy-github-pages.yml` tem de estar no GitHub).
4. Abre o separador **Actions** e espera o workflow **Deploy GitHub Pages** ficar verde (1–3 minutos).
5. Abre o link acima (pode demorar mais 1 minuto a propagar).

Se mudares o **nome do repositório**, altera também `GH_PAGES_BASE` em `vite.config.ts` para `/NOME-DO-REPO/`.

## Scripts úteis

| Comando        | Descrição                    |
|----------------|------------------------------|
| `npm run dev`  | Servidor de desenvolvimento  |
| `npm run dev:lan` | Dev com `--host` (LAN)   |
| `npm run build`   | Build de produção (`dist/`) |
| `npm run preview` | Pré-visualizar o build      |

## Estrutura principal

- `src/pages/` — ecrãs (Dashboard, Radar, Programadas, Configuração, …).
- `src/state/CgoContext.tsx` — estado global e persistência.
- `src/data/bootstrapDb.ts` — dados de demonstração.
- `src/domain/` — regras de tráfego (verde/amarelo/vermelho) e Radar.

## Publicar no GitHub

1. Cria o repositório em [github.com/new](https://github.com/new) (nome sugerido: `erp-esa-cgo`, **sem** ponto extra no fim).
2. Na raiz deste projeto:

```bash
git init
git add .
git commit -m "chore: MVP CGO"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/erp-esa-cgo.git
git push -u origin main
```

Se o GitHub já tiver um `README.md` inicial, usa antes do push:  
`git pull origin main --allow-unrelated-histories` (resolve conflitos se aparecerem) e volta a fazer `git push`.

## Licença

Uso interno ESA / conforme a política da tua organização.
