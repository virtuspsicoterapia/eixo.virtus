-- ============================================================
-- ORDO by Virtus Psicoterapia — Schema do banco de dados
-- Cole este arquivo inteiro no SQL Editor do Supabase e clique "Run"
-- ============================================================

-- Extensão necessária para gerar UUIDs
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- TABELA: perfis
-- Estende a tabela de autenticação do Supabase (auth.users) com
-- os dados específicos do Ordo. Cada usuário autenticado tem um
-- perfil correspondente aqui.
-- ------------------------------------------------------------
create table public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  tipo text not null default 'assinante' check (tipo in ('assinante', 'paciente_ativo', 'terapeuta')),
  codigo_paciente_usado text,
  criado_em timestamptz not null default now()
);

comment on table public.perfis is 'Dados de perfil de cada usuário, ligados à autenticação do Supabase.';
comment on column public.perfis.tipo is 'assinante = público geral pagante; paciente_ativo = paciente em acompanhamento; terapeuta = Julismar (admin)';

-- ------------------------------------------------------------
-- TABELA: codigos_convite
-- Códigos que o terapeuta gera para liberar acesso de paciente_ativo
-- ------------------------------------------------------------
create table public.codigos_convite (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  paciente_nome text,
  usado boolean not null default false,
  usado_por uuid references public.perfis(id),
  criado_em timestamptz not null default now(),
  usado_em timestamptz
);

-- ------------------------------------------------------------
-- TABELA: entradas_diario
-- Diário pessoal. Privado por padrão; "compartilhada" controla
-- se o terapeuta pode visualizar a entrada.
-- ------------------------------------------------------------
create table public.entradas_diario (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  conteudo text not null,
  humor text check (humor in ('pesado', 'inquieto', 'neutro', 'leve', 'em_paz')),
  compartilhada boolean not null default false,
  lida_pelo_terapeuta boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index idx_entradas_usuario on public.entradas_diario(usuario_id);
create index idx_entradas_compartilhadas on public.entradas_diario(compartilhada) where compartilhada = true;

-- ------------------------------------------------------------
-- TABELA: trilhas
-- Trilhas de conteúdo/curso (ex: "Ansiedade & Ordem")
-- ------------------------------------------------------------
create table public.trilhas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  nivel_exigido text not null default 'assinante' check (nivel_exigido in ('assinante', 'paciente_ativo')),
  ordem int not null default 0,
  publicada boolean not null default true,
  criado_em timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TABELA: aulas_trilha
-- Aulas/módulos dentro de cada trilha
-- ------------------------------------------------------------
create table public.aulas_trilha (
  id uuid primary key default gen_random_uuid(),
  trilha_id uuid not null references public.trilhas(id) on delete cascade,
  titulo text not null,
  conteudo text,
  url_video text,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TABELA: progresso_trilha
-- Marca quais aulas cada usuário já concluiu
-- ------------------------------------------------------------
create table public.progresso_trilha (
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  aula_id uuid not null references public.aulas_trilha(id) on delete cascade,
  concluida boolean not null default false,
  concluida_em timestamptz,
  primary key (usuario_id, aula_id)
);

-- ------------------------------------------------------------
-- TABELA: recados
-- Reflexões/recados diários programados
-- ------------------------------------------------------------
create table public.recados (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  data_publicacao date not null,
  publico_alvo text not null default 'todos' check (publico_alvo in ('todos', 'pacientes', 'usuario_especifico')),
  usuario_especifico_id uuid references public.perfis(id),
  criado_em timestamptz not null default now()
);

create index idx_recados_data on public.recados(data_publicacao);

-- ------------------------------------------------------------
-- TABELA: sessoes_agendamento
-- Sessões de terapia: tanto solicitações de não-pacientes (pendente)
-- quanto sessões já confirmadas de pacientes ativos.
-- ------------------------------------------------------------
create table public.sessoes_agendamento (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  data_hora timestamptz not null,
  duracao_minutos int not null default 50,
  formato text not null default 'online' check (formato in ('online', 'presencial')),
  status text not null default 'pendente' check (status in ('pendente', 'confirmada', 'cancelada', 'realizada')),
  motivo_contato text,
  google_event_id text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index idx_sessoes_usuario on public.sessoes_agendamento(usuario_id);
create index idx_sessoes_status on public.sessoes_agendamento(status);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Isso garante que, mesmo se alguém tentar acessar o banco
-- diretamente, só consiga ver/editar o que tem permissão.
-- ============================================================

alter table public.perfis enable row level security;
alter table public.entradas_diario enable row level security;
alter table public.trilhas enable row level security;
alter table public.aulas_trilha enable row level security;
alter table public.progresso_trilha enable row level security;
alter table public.recados enable row level security;
alter table public.sessoes_agendamento enable row level security;
alter table public.codigos_convite enable row level security;

-- Função auxiliar: verifica se o usuário logado é o terapeuta (admin)
create or replace function public.eh_terapeuta()
returns boolean as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid() and tipo = 'terapeuta'
  );
$$ language sql security definer stable;

-- ---- Perfis ----
create policy "usuario ve proprio perfil" on public.perfis
  for select using (auth.uid() = id or eh_terapeuta());

create policy "usuario edita proprio perfil" on public.perfis
  for update using (auth.uid() = id);

create policy "usuario cria proprio perfil" on public.perfis
  for insert with check (auth.uid() = id);

-- ---- Entradas de diário ----
create policy "usuario ve proprias entradas" on public.entradas_diario
  for select using (
    auth.uid() = usuario_id
    or (compartilhada = true and eh_terapeuta())
  );

create policy "usuario cria proprias entradas" on public.entradas_diario
  for insert with check (auth.uid() = usuario_id);

create policy "usuario edita proprias entradas" on public.entradas_diario
  for update using (auth.uid() = usuario_id);

create policy "usuario apaga proprias entradas" on public.entradas_diario
  for delete using (auth.uid() = usuario_id);

-- ---- Trilhas e aulas (leitura pública para autenticados, edição só terapeuta) ----
create policy "trilhas visiveis para autenticados" on public.trilhas
  for select using (auth.role() = 'authenticated');

create policy "terapeuta gerencia trilhas" on public.trilhas
  for all using (eh_terapeuta());

create policy "aulas visiveis para autenticados" on public.aulas_trilha
  for select using (auth.role() = 'authenticated');

create policy "terapeuta gerencia aulas" on public.aulas_trilha
  for all using (eh_terapeuta());

-- ---- Progresso ----
create policy "usuario ve proprio progresso" on public.progresso_trilha
  for select using (auth.uid() = usuario_id);

create policy "usuario atualiza proprio progresso" on public.progresso_trilha
  for all using (auth.uid() = usuario_id);

-- ---- Recados ----
create policy "recados visiveis para autenticados" on public.recados
  for select using (auth.role() = 'authenticated');

create policy "terapeuta gerencia recados" on public.recados
  for all using (eh_terapeuta());

-- ---- Sessões de agendamento ----
create policy "usuario ve proprias sessoes" on public.sessoes_agendamento
  for select using (auth.uid() = usuario_id or eh_terapeuta());

create policy "usuario cria propria sessao" on public.sessoes_agendamento
  for insert with check (auth.uid() = usuario_id);

create policy "usuario ou terapeuta atualiza sessao" on public.sessoes_agendamento
  for update using (auth.uid() = usuario_id or eh_terapeuta());

-- ---- Códigos de convite (só terapeuta gerencia; checagem de uso via função) ----
create policy "terapeuta gerencia codigos" on public.codigos_convite
  for all using (eh_terapeuta());

-- Função para validar e consumir um código de convite no cadastro
-- (roda com privilégios elevados pois o usuário ainda não tem perfil)
create or replace function public.validar_codigo_convite(p_codigo text, p_usuario_id uuid)
returns boolean as $$
declare
  v_existe boolean;
begin
  select exists(
    select 1 from public.codigos_convite
    where codigo = p_codigo and usado = false
  ) into v_existe;

  if v_existe then
    update public.codigos_convite
    set usado = true, usado_por = p_usuario_id, usado_em = now()
    where codigo = p_codigo;
  end if;

  return v_existe;
end;
$$ language plpgsql security definer;

-- ============================================================
-- Trigger: ao confirmar nova conta (auth.users), nada é criado
-- automaticamente em perfis — isso é feito explicitamente pelo
-- código da aplicação no momento do cadastro, para que possamos
-- aplicar a lógica do código de convite antes de definir o tipo.
-- ============================================================
