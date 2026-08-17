# LactareConnect — Painel Admin (Web)

Painel administrativo web da solução **LactareConnect**, desenvolvida como desafio em parceria com **Eurofarma/Lactare** (Challenge FIAP).

## Sobre o projeto

O LactareConnect conecta nutrizes doadoras a bancos de leite humano, cobrindo todo o fluxo de doação: exames pré-doação, agendamento de coleta e registro da doação, além de um sistema de recompensas em "Gotinhas" e suporte via chatbot ("Lila") — tudo isso no [app mobile](https://github.com/Fiszbejn/LactareConnect-App).

Este repositório é o **painel interno da equipe Lactare**: acompanhamento de indicadores de alcance/engajamento/conversão, gestão das nutrizes cadastradas e geração de relatórios por período — consumindo a mesma API REST usada pelo app.

## Funcionalidades

| Página | O que faz |
|---|---|
| **Dashboard** | KPIs de alcance/engajamento/conversão, funil de conversão (com filtro por região), segmentação por região e por status de cadastro — tudo filtrável por período (últimos 7 dias, este mês, mês passado, trimestre atual ou período customizado) |
| **Nutrizes** | Lista com busca (nome/CPF/telefone/cidade) e filtros de status/região/doações, painel de detalhe com exames pré-doação, histórico de doações e resgates de recompensas |
| **Relatórios** | Geração de relatório em PDF (completo ou resumo) ou CSV por período e seções escolhidas, com histórico dos relatórios já gerados neste painel e opção de baixar novamente qualquer um deles |

Todo o painel é validado ponta a ponta contra o backend real: nenhuma tela usa dados mockados, e qualquer funcionalidade sem respaldo real na API (ex: campos ou endpoints inexistentes) foi conscientemente ajustada em vez de fingida.

## Arquitetura e stack

**Painel web (este repositório)**
- **React 19** + **TypeScript** + **Vite**
- **TanStack Query** + **Axios** para dados/API, com cache e invalidação automática
- **React Router** para navegação, com guarda de sessão baseada no token JWT
- **Tailwind CSS v4**, com os tokens do design system da Lactare aplicados via `@theme` (cores, tipografia Public Sans)
- **jsPDF** para geração de relatórios em PDF direto no navegador (o backend só guarda o metadado do relatório, não gera arquivo)
- Organização **feature-first** (`src/features/<área>/{pages,components,lib}`), com código compartilhado em `src/shared/{api,layout,charts,lib,brand}`

**Backend** ([`LactareConnect-backend`](https://github.com/Fiszbejn/LactareConnect-backend))
- **NestJS** (TypeScript) com **TypeORM** sobre **Oracle Database**
- Autenticação **JWT** + autorização **RBAC** (papéis `nutriz`/`administrador`) — este painel sempre autentica como `administrador`, papel com acesso amplo aos dados
- API REST documentada via **Swagger**, containerizada com **Docker Compose**

**App mobile** ([`LactareConnect-App`](https://github.com/Fiszbejn/LactareConnect-App))
- **Flutter** (Dart), consumindo a mesma API — é por onde a nutriz se cadastra, agenda doações e conversa com a assistente virtual Lila

```
src/
├── app/                  # Bootstrap: router e query client
├── shared/
│   ├── api/              # Cliente Axios, hooks TanStack Query, tipos do contrato da API
│   ├── layout/            # AdminShell, AdminSidebar, AdminTopbar, guarda de rota
│   ├── charts/            # Sparkline, Donut (SVG puro, sem lib de gráficos)
│   ├── lib/               # Agregação de métricas e filtro por período, reusados entre páginas
│   └── brand/              # Logo da Lactare
└── features/
    ├── auth/               # Login
    ├── dashboard/          # KPIs, funil de conversão, segmentação por região/status
    ├── nutrizes/           # Lista + painel de detalhe
    └── relatorios/         # Gerador de PDF/CSV + histórico
```

## Como rodar

### Pré-requisitos
- [Node.js](https://nodejs.org/) 20+
- [Docker](https://www.docker.com/) (para o backend)

### 1. Backend
```bash
git clone https://github.com/Fiszbejn/LactareConnect-backend.git
cd LactareConnect-backend
cp .env.example .env   # preencher credenciais do Oracle, JWT_SECRET e GEMINI_API_KEY
docker compose up --build -d
```
A API sobe em `http://localhost:3000`, com documentação Swagger em `/docs`.

### 2. Painel web
```bash
npm install
cp .env.example .env   # VITE_API_URL aponta pro backend acima
npm run dev
```
O painel sobe em `http://localhost:5173`. Login com a conta administrativa inicial do backend (`admin@lactareconnect.com` / `admin123`, ver README do backend).

## Destaques técnicos

- **Fidelidade aos wireframes reais**: telas recriadas a partir dos protótipos do Claude Design (cores, tipografia, componentes), não improvisadas — inclusive detalhes como marca d'água e proporções revisados junto com o usuário.
- **Geração de relatório 100% client-side**: como o backend só persiste o metadado do relatório (período, seções, formato), o PDF/CSV é montado no navegador a partir dos mesmos dados já carregados no painel — inclusive o **re-download**, que regenera o arquivo original a partir do metadado salvo, sem precisar guardar o arquivo em lugar nenhum.
- **CSV compatível com Excel PT-BR**: delimitador `;` (em vez de `,`) e BOM UTF-8, porque o padrão americano quebra a formatação no Excel em português.
- **Agregação de métricas reaproveitada**: as mesmas funções que calculam KPIs/funil/região/status no Dashboard alimentam o filtro de período do próprio Dashboard e a geração de relatórios em Relatórios — uma fonte de verdade só.
- **Contrato da API sempre verificado antes de codar**: paginação, formato de payload e existência de endpoints foram confirmados contra o backend real (Swagger/controllers), não assumidos — evitou mais de uma vez construir uma tela em cima de uma API que não existia daquele jeito.

## Skills demonstradas

- Consumo de API REST autenticada (JWT) com gerenciamento de estado assíncrono (TanStack Query)
- TypeScript com tipagem de ponta a ponta do contrato da API
- Geração de arquivos no cliente (PDF via `jsPDF`, CSV manual) a partir de dados reais
- Design system e Tailwind CSS aplicados com fidelidade a um protótipo de design real
- Arquitetura frontend feature-first, com código compartilhado isolado por responsabilidade (`api`/`layout`/`charts`/`lib`)

---

<br/>
<br/>

<p align="center">
  <img src="docs/assets/eurofarma-logo.png" alt="Eurofarma" height="40" />
  &emsp;&emsp;×&emsp;&emsp;
  <img src="docs/assets/fiap-logo.png" alt="FIAP" height="40" />
</p>
