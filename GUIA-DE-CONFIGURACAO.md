# Guia de configuração — Eixo por Virtus Psicoterapia

Este guia parte do zero: você nunca usou Supabase ou Vercel. Siga na ordem.
No final, o app estará no ar, com login real, e o agendamento criando eventos
de verdade na sua agenda do Google.

Tempo estimado: 40-60 minutos na primeira vez.

---

## Parte 1 — Criar o projeto no Supabase (banco de dados + login)

1. Acesse **supabase.com** e clique em "Start your project". Crie uma conta
   (pode usar login do Google).
2. Clique em "New Project".
   - **Name**: `ordo-virtus`
   - **Database Password**: gere uma senha forte e **guarde em local seguro**
     (ex: seu gerenciador de senhas) — você não vai precisar dela no dia a
     dia, mas é bom não perder.
   - **Region**: escolha `South America (São Paulo)` para menor latência.
3. Aguarde 1-2 minutos enquanto o projeto é criado.
4. No menu lateral esquerdo, clique em **SQL Editor**.
5. Clique em "New query".
6. Abra o arquivo `supabase/schema.sql` (está na pasta que você recebeu),
   copie todo o conteúdo, cole no editor do Supabase, e clique em **Run**.
   - Se aparecer "Success. No rows returned", funcionou.
7. (Opcional, recomendado para testar) Repita o passo 5-6 com o arquivo
   `supabase/seed.sql` — isso cria um recado de exemplo, duas trilhas com
   aulas, e um código de convite de teste (`VIRTUS-TESTE`) para você
   experimentar o cadastro como paciente.
8. No menu lateral, clique em **Project Settings** (ícone de engrenagem) →
   **API**.
9. Você vai precisar de dois valores desta página:
   - **Project URL** (algo como `https://abcxyz.supabase.co`)
   - **anon public** key (uma chave longa, começando com `eyJ...`)
   - Guarde os dois — vamos usar na Parte 3.

### Confirmação de e-mail (importante)

Por padrão, o Supabase exige confirmação de e-mail antes do primeiro login.
Para o lançamento inicial, você tem duas opções:

- **Manter a confirmação por e-mail** (recomendado para produção): vá em
  **Authentication** → **Settings** → role até "SMTP Settings" e configure
  um provedor de e-mail (ou use o e-mail de teste padrão do Supabase, que
  tem limite baixo de envios — bom só para os primeiros testes).
- **Desativar a confirmação** (mais rápido para testar agora, ative a
  confirmação antes de divulgar para pacientes reais): vá em
  **Authentication** → **Providers** → **Email** → desmarque "Confirm email".

---

## Parte 2 — Conectar ao Google Calendar

Essa parte tem mais passos porque envolve o Google Cloud Console, mas só
precisa ser feita uma vez.

1. Acesse **console.cloud.google.com** com a conta Google que tem a agenda
   "Virtus Psicoterapia" (a mesma que você já usa).
2. No topo, clique em "Select a project" → "New Project". Nome: `Eixo Virtus`.
   Clique em "Create".
3. Com o projeto `Eixo Virtus` selecionado, vá no menu (☰) →
   **APIs & Services** → **Library**.
4. Busque por "Google Calendar API" e clique em **Enable**.
5. Vá em **APIs & Services** → **OAuth consent screen**.
   - User Type: **External**. Clique em "Create".
   - App name: `Eixo`. E-mail de suporte: o seu e-mail.
   - Em "Scopes", clique em "Add or remove scopes" e adicione
     `.../auth/calendar` (Google Calendar API). Salve.
   - Em "Test users", adicione o próprio e-mail Google que tem a agenda.
   - Continue até o fim e volte ao painel.
6. Vá em **APIs & Services** → **Credentials** → **Create Credentials** →
   **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Eixo Web`.
   - Em "Authorized redirect URIs", adicione:
     `https://developers.google.com/oauthplayground`
   - Clique em "Create". Vai aparecer um **Client ID** e **Client Secret** —
     copie os dois, vamos usar agora.

### Gerando o "refresh token" (autorização permanente)

Esse passo autoriza o app a criar eventos na sua agenda sem precisar de
login manual depois.

1. Acesse **developers.google.com/oauthplayground**.
2. No canto superior direito, clique no ícone de engrenagem (⚙️).
3. Marque "Use your own OAuth credentials" e cole o **Client ID** e
   **Client Secret** que você copiou no passo anterior.
4. Na lista à esquerda, busque "Calendar API v3" e marque o escopo
   `https://www.googleapis.com/auth/calendar`.
5. Clique em "Authorize APIs". Você será redirecionado para fazer login
   com a conta Google da agenda "Virtus Psicoterapia" — faça login e
   autorize.
6. De volta no Playground, clique em "Exchange authorization code for
   tokens".
7. Copie o valor de **Refresh token** que aparece — esse é o
   `GOOGLE_REFRESH_TOKEN` que vamos usar.

### Encontrando o ID da agenda certa (se usar uma agenda secundária)

Se "Virtus Psicoterapia" for uma agenda **secundária** dentro da sua conta
Google (não a agenda principal), você precisa do ID dela:

1. No Google Agenda, clique nos três pontos ao lado do nome da agenda →
   **Configurações e compartilhamento**.
2. Role até "Integrar agenda" e copie o **ID da agenda** (parece um
   e-mail, ex: `abc123@group.calendar.google.com`).
3. Use esse valor como `GOOGLE_CALENDAR_ID`. Se for a agenda principal da
   conta, use simplesmente `primary`.

---

## Parte 3 — Configurar as variáveis de ambiente

1. Na pasta do projeto que você recebeu, encontre o arquivo `.env.example`.
2. Crie uma cópia chamada `.env.local` (mesma pasta).
3. Preencha cada valor:

```
NEXT_PUBLIC_SUPABASE_URL=        ← Project URL do Supabase (Parte 1, passo 9)
NEXT_PUBLIC_SUPABASE_ANON_KEY=   ← anon public key do Supabase (Parte 1, passo 9)
GOOGLE_CLIENT_ID=                ← da Parte 2, passo 6
GOOGLE_CLIENT_SECRET=            ← da Parte 2, passo 6
GOOGLE_REDIRECT_URI=https://developers.google.com/oauthplayground
GOOGLE_REFRESH_TOKEN=            ← da Parte 2, "Gerando o refresh token"
GOOGLE_CALENDAR_ID=primary       ← ou o ID da agenda secundária
```

4. Salve o arquivo. **Nunca compartilhe esse arquivo nem o suba para o
   GitHub publicamente** — ele contém as chaves de acesso à sua conta.

---

## Parte 4 — Subir para a Vercel (deixar o app no ar)

A forma mais simples é via GitHub. Se você nunca usou Git/GitHub, siga
estes passos extras:

### 4.1 — Colocar o código no GitHub

1. Crie uma conta em **github.com**, se ainda não tiver.
2. Clique em "New repository". Nome: `ordo-app`. Deixe como **Private**.
   Clique em "Create repository".
3. Na pasta do projeto no seu computador, abra o terminal e rode:

```bash
git init
git add .
git commit -m "Versão inicial do Eixo"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/ordo-app.git
git push -u origin main
```//
(troque `SEU-USUARIO` pelo seu nome de usuário do GitHub — o GitHub mostra
o comando exato na tela depois de criar o repositório, com seu usuário já
preenchido — use aquele.)

> O arquivo `.gitignore` do projeto já está configurado para NÃO subir o
> `.env.local` para o GitHub, então suas chaves continuam seguras.

### 4.2 — Conectar a Vercel

1. Acesse **vercel.com** e crie uma conta (use "Continue with GitHub" para
   já vincular as duas contas).
2. Clique em "Add New..." → "Project".
3. Selecione o repositório `ordo-app` que você criou. Clique em "Import".
4. Antes de clicar em "Deploy", expanda **Environment Variables** e
   adicione, um por um, todos os valores do seu `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
   - `GOOGLE_REFRESH_TOKEN`
   - `GOOGLE_CALENDAR_ID`
5. Clique em **Deploy**. Aguarde 1-2 minutos.
6. Quando terminar, a Vercel mostra um link tipo `ordo-app.vercel.app` —
   esse já é o app no ar, funcionando, com domínio público.

### 4.3 — Domínio próprio (opcional, recomendado depois)

Depois de validar que tudo funciona no domínio gratuito da Vercel, você
pode apontar um subdomínio seu (ex: `app.virtuspsicoterapia.com.br`) nas
configurações do projeto → **Domains**. A Vercel mostra exatamente quais
registros DNS adicionar no painel onde você comprou o domínio.

---

## Parte 5 — Primeiro acesso e configuração do terapeuta

O cadastro normal sempre cria contas como `assinante` (ou `paciente_ativo`,
se um código de convite válido for usado). Para você (Julismar) ter acesso
ao **painel administrativo**, é preciso elevar sua própria conta para
`terapeuta` manualmente, uma única vez:

1. Acesse o app no ar e crie sua conta normalmente pela tela de cadastro.
2. No Supabase, vá em **Table Editor** → tabela `perfis`.
3. Encontre a linha com seu e-mail, clique para editar, e mude o campo
   `tipo` de `assinante` para `terapeuta`.
4. Salve. Ao recarregar o app, você verá a aba **Painel** na navegação.

---

## Como gerar códigos de convite para pacientes

Depois de logado como terapeuta, no Painel, use o botão **"+ Código
convite"**. O código gerado (ex: `VIRTUS-X7K2P`) deve ser passado para o
paciente, que o insere no campo opcional do cadastro — isso libera o
acesso completo, sem custo, automaticamente.

---

## Testando o agendamento automático

1. Crie uma conta de teste sem código de paciente (fica como `assinante`).
2. Vá em "Agenda" → escolha um horário → "Solicitar agendamento".
3. Entre com sua conta de `terapeuta` → Painel → toque na solicitação para
   confirmar.
4. Confira sua agenda do Google real — o evento deve aparecer
   automaticamente, com link do Google Meet incluído.

---

## Em caso de erro

- **"Failed to fetch" ao logar**: confira se `NEXT_PUBLIC_SUPABASE_URL` e
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão corretos, sem espaços extras.
- **Evento não aparece na agenda real**: confira se o `GOOGLE_REFRESH_TOKEN`
  não expirou (eles podem expirar se o app OAuth ficar muito tempo em modo
  "Testing" — em "OAuth consent screen", você pode mudar para "In
  production" para tokens não expirarem, sem precisar de aprovação do
  Google para uso pessoal/interno).
- **Erro de permissão no banco**: confira se rodou o `schema.sql` completo,
  sem interrupções, no SQL Editor.
