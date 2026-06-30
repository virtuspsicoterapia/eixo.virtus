-- ============================================================
-- DADOS DE EXEMPLO (opcional)
-- Rode isso DEPOIS do schema.sql, se quiser conteúdo de teste
-- para conferir o app funcionando antes de cadastrar tudo de
-- verdade. Você pode apagar essas linhas depois pelo painel.
-- ============================================================

-- Um recado de hoje, visível para todos
insert into public.recados (texto, data_publicacao, publico_alvo)
values (
  'A ordem não é a ausência de tempestade — é o lugar onde você fica de pé enquanto ela passa.',
  current_date,
  'todos'
);

-- Uma trilha de exemplo, aberta a qualquer assinante
insert into public.trilhas (titulo, descricao, nivel_exigido, ordem)
values (
  'A Maturidade Emocional',
  'Sobre crescer sem se perder',
  'assinante',
  1
);

-- Aulas dessa trilha (usa subquery para achar o id da trilha recém-criada)
insert into public.aulas_trilha (trilha_id, titulo, ordem)
select id, 'O que é maturidade emocional', 1 from public.trilhas where titulo = 'A Maturidade Emocional'
union all
select id, 'Os sinais da imaturidade hoje', 2 from public.trilhas where titulo = 'A Maturidade Emocional'
union all
select id, 'Ordenar antes de agir', 3 from public.trilhas where titulo = 'A Maturidade Emocional';

-- Uma trilha exclusiva para pacientes ativos
insert into public.trilhas (titulo, descricao, nivel_exigido, ordem)
values (
  'Ansiedade & Ordem',
  'Fundamentos da ordenação interior',
  'paciente_ativo',
  0
);

insert into public.aulas_trilha (trilha_id, titulo, ordem)
select id, 'Por que a ansiedade pede ordem', 1 from public.trilhas where titulo = 'Ansiedade & Ordem'
union all
select id, 'O corpo, a mente e a vontade', 2 from public.trilhas where titulo = 'Ansiedade & Ordem';

-- Um código de convite de teste — use "VIRTUS-TESTE" no cadastro
-- para criar uma conta de paciente_ativo de teste.
insert into public.codigos_convite (codigo, paciente_nome)
values ('VIRTUS-TESTE', 'Conta de teste');
