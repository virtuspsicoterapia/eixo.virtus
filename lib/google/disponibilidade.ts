import { buscarHorariosOcupados } from './calendario'

// ============================================================
// Regras de negócio de disponibilidade. Ajuste aqui conforme sua
// rotina real de atendimento (dias da semana e horários de sessão).
// ============================================================
const DIAS_ATENDIMENTO = [1, 2, 3, 4, 5] // segunda(1) a sexta(5); domingo=0, sábado=6
const HORARIOS_FIXOS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
const DURACAO_SESSAO_MINUTOS = 50

export interface SlotDisponivel {
  dataHoraISO: string
  ocupado: boolean
}

export interface DiaComSlots {
  data: string // YYYY-MM-DD
  rotuloDia: string
  slots: SlotDisponivel[]
}

// Gera os próximos `numDias` dias úteis de atendimento, com seus
// horários marcados como ocupados ou livres com base no Google Agenda.
export async function gerarGradeDisponibilidade(numDias: number = 5): Promise<DiaComSlots[]> {
  const dias: DiaComSlots[] = []
  const hoje = new Date()
  let cursor = new Date(hoje)
  cursor.setDate(cursor.getDate() + 1) // começa a partir de amanhã

  const diasGerados: Date[] = []
  while (diasGerados.length < numDias) {
    if (DIAS_ATENDIMENTO.includes(cursor.getDay())) {
      diasGerados.push(new Date(cursor))
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  const inicioJanela = diasGerados[0]
  const fimJanela = new Date(diasGerados[diasGerados.length - 1])
  fimJanela.setHours(23, 59, 59)

  let ocupados: { inicio: string; fim: string }[] = []
  try {
    ocupados = await buscarHorariosOcupados(inicioJanela.toISOString(), fimJanela.toISOString())
  } catch {
    // Se a API do Google ainda não está configurada (ex: durante
    // desenvolvimento local sem as credenciais), seguimos sem bloqueios
    // reais — todos os horários aparecem livres, até a integração
    // ser concluída no guia de configuração.
    ocupados = []
  }

  for (const dia of diasGerados) {
    const slots: SlotDisponivel[] = HORARIOS_FIXOS.map((horario) => {
      const [h, m] = horario.split(':').map(Number)
      const dataHora = new Date(dia)
      dataHora.setHours(h, m, 0, 0)
      const fimSlot = new Date(dataHora.getTime() + DURACAO_SESSAO_MINUTOS * 60_000)

      const ocupado = ocupados.some((bloco) => {
        const inicioBloco = new Date(bloco.inicio)
        const fimBloco = new Date(bloco.fim)
        return dataHora < fimBloco && fimSlot > inicioBloco
      })

      return { dataHoraISO: dataHora.toISOString(), ocupado }
    })

    dias.push({
      data: dia.toISOString().slice(0, 10),
      rotuloDia: dia.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }),
      slots,
    })
  }

  return dias
}

export const DURACAO_PADRAO_MINUTOS = DURACAO_SESSAO_MINUTOS
