// Tipos que espelham as tabelas do Supabase definidas em supabase/schema.sql
// Mantém o código com checagem de tipos e autocomplete.

export type TipoUsuario = 'assinante' | 'paciente_ativo' | 'terapeuta'
export type Humor = 'pesado' | 'inquieto' | 'neutro' | 'leve' | 'em_paz'
export type NivelTrilha = 'assinante' | 'paciente_ativo'
export type PublicoAlvo = 'todos' | 'pacientes' | 'usuario_especifico'
export type StatusSessao = 'pendente' | 'confirmada' | 'cancelada' | 'realizada'
export type FormatoSessao = 'online' | 'presencial'

export interface Perfil {
  id: string
  nome: string
  email: string
  tipo: TipoUsuario
  codigo_paciente_usado: string | null
  criado_em: string
}

export interface EntradaDiario {
  id: string
  usuario_id: string
  conteudo: string
  humor: Humor | null
  compartilhada: boolean
  lida_pelo_terapeuta: boolean
  criado_em: string
  atualizado_em: string
}

export interface Trilha {
  id: string
  titulo: string
  descricao: string | null
  nivel_exigido: NivelTrilha
  ordem: number
  publicada: boolean
  criado_em: string
}

export interface AulaTrilha {
  id: string
  trilha_id: string
  titulo: string
  conteudo: string | null
  url_video: string | null
  ordem: number
  criado_em: string
}

export interface ProgressoTrilha {
  usuario_id: string
  aula_id: string
  concluida: boolean
  concluida_em: string | null
}

export interface Recado {
  id: string
  texto: string
  data_publicacao: string
  publico_alvo: PublicoAlvo
  usuario_especifico_id: string | null
  criado_em: string
}

export interface SessaoAgendamento {
  id: string
  usuario_id: string
  data_hora: string
  duracao_minutos: number
  formato: FormatoSessao
  status: StatusSessao
  motivo_contato: string | null
  google_event_id: string | null
  criado_em: string
  atualizado_em: string
}

export interface CodigoConvite {
  id: string
  codigo: string
  paciente_nome: string | null
  usado: boolean
  usado_por: string | null
  criado_em: string
  usado_em: string | null
}
