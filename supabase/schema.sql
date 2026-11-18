-- Plataforma de cursos: tabelas e regras de acesso (RLS)
-- Como usar: Supabase → SQL Editor → cole este arquivo inteiro → Run.
-- Pode rodar mais de uma vez sem estragar nada.

-- ---------- Tabelas ----------

create table if not exists public.cursos (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique
             check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug not in ('entrar', 'minha-area')),
  titulo     text not null check (char_length(titulo) between 1 and 160),
  resumo     text not null default '' check (char_length(resumo) <= 300),
  descricao  text not null default '' check (char_length(descricao) <= 5000),
  publicado  boolean not null default false,
  criado_em  timestamptz not null default now()
);

create table if not exists public.aulas (
  id         uuid primary key default gen_random_uuid(),
  curso_id   uuid not null references public.cursos (id) on delete cascade,
  ordem      int  not null check (ordem > 0),
  titulo     text not null check (char_length(titulo) between 1 and 160),
  descricao  text not null default '' check (char_length(descricao) <= 5000),
  minutos    int  not null default 0 check (minutos >= 0),
  unique (curso_id, ordem)
);

-- O código do vídeo fica numa tabela à parte: a lista de aulas é pública, o vídeo não.
create table if not exists public.aulas_video (
  aula_id    uuid primary key references public.aulas (id) on delete cascade,
  youtube_id text not null check (youtube_id ~ '^[A-Za-z0-9_-]{11}$')
);

create table if not exists public.inscricoes (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  curso_id   uuid not null references public.cursos (id) on delete cascade,
  criado_em  timestamptz not null default now(),
  primary key (user_id, curso_id)
);

create table if not exists public.progresso (
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  aula_id      uuid not null references public.aulas (id) on delete cascade,
  concluida_em timestamptz not null default now(),
  primary key (user_id, aula_id)
);

create index if not exists aulas_curso_idx on public.aulas (curso_id);
create index if not exists inscricoes_curso_idx on public.inscricoes (curso_id);
create index if not exists progresso_aula_idx on public.progresso (aula_id);

-- ---------- Regras de acesso ----------

alter table public.cursos      enable row level security;
alter table public.aulas       enable row level security;
alter table public.aulas_video enable row level security;
alter table public.inscricoes  enable row level security;
alter table public.progresso   enable row level security;

-- Auxiliar: a pessoa logada está inscrita neste curso?
create or replace function public.inscrito_no_curso(p_curso uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.inscricoes i
    where i.curso_id = p_curso and i.user_id = (select auth.uid())
  );
$$;
revoke all on function public.inscrito_no_curso(uuid) from public;
grant execute on function public.inscrito_no_curso(uuid) to authenticated;

drop policy if exists "cursos publicados sao publicos" on public.cursos;
create policy "cursos publicados sao publicos" on public.cursos
  for select to anon, authenticated using (publicado);

drop policy if exists "lista de aulas e publica" on public.aulas;
create policy "lista de aulas e publica" on public.aulas
  for select to anon, authenticated
  using (exists (select 1 from public.cursos c where c.id = curso_id and c.publicado));

-- O vídeo só aparece para quem está inscrito no curso da aula.
drop policy if exists "video so para inscritos" on public.aulas_video;
create policy "video so para inscritos" on public.aulas_video
  for select to authenticated
  using (exists (
    select 1 from public.aulas a
    where a.id = aula_id and public.inscrito_no_curso(a.curso_id)
  ));

drop policy if exists "ver minhas inscricoes" on public.inscricoes;
create policy "ver minhas inscricoes" on public.inscricoes
  for select to authenticated using (user_id = (select auth.uid()));

-- Inscrição gratuita: qualquer pessoa logada se inscreve, só em curso publicado e só em seu próprio nome.
-- Para vender cursos depois, troque esta regra (ou remova-a e crie inscrições pelo seu sistema de pagamento).
drop policy if exists "me inscrever" on public.inscricoes;
create policy "me inscrever" on public.inscricoes
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.cursos c where c.id = curso_id and c.publicado)
  );

drop policy if exists "ver meu progresso" on public.progresso;
create policy "ver meu progresso" on public.progresso
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "marcar meu progresso" on public.progresso;
create policy "marcar meu progresso" on public.progresso
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.aulas a where a.id = aula_id and public.inscrito_no_curso(a.curso_id))
  );

drop policy if exists "desmarcar meu progresso" on public.progresso;
create policy "desmarcar meu progresso" on public.progresso
  for delete to authenticated using (user_id = (select auth.uid()));

-- Ninguém pelo site escreve em cursos, aulas ou vídeos: isso é feito por você no painel do Supabase.

-- ---------- Exemplo: como cadastrar um curso ----------
-- (apague os "--" para usar; troque o código do vídeo pelo do seu vídeo "não listado" no YouTube)
--
-- with c as (
--   insert into public.cursos (slug, titulo, resumo, descricao, publicado)
--   values ('meu-primeiro-curso', 'Meu primeiro curso', 'Resumo curto.', 'Descrição completa do curso.', true)
--   returning id
-- ), a as (
--   insert into public.aulas (curso_id, ordem, titulo, descricao, minutos)
--   select id, 1, 'Boas-vindas', 'Como aproveitar o curso.', 5 from c
--   returning id
-- )
-- insert into public.aulas_video (aula_id, youtube_id)
-- select id, 'COLE_AQUI_11_CARACTERES' from a;
