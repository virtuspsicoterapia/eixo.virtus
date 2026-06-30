import { google } from 'googleapis'

// ============================================================
// Integração com o Google Calendar.
//
// Estratégia: o app usa UMA conta Google conectada (a sua, Julismar),
// via OAuth2 com refresh token salvo nas variáveis de ambiente.
// Quando um paciente confirma ou solicita uma sessão, o app cria um
// evento diretamente na sua agenda real, com Google Meet incluído.
//
// O guia de configuração explica como gerar o refresh token uma
// única vez. Depois disso, tudo roda automaticamente.
// ============================================================

function criarClienteOAuth() {
  const cliente = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  cliente.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  })

  return cliente
}

function obterCalendario() {
  const auth = criarClienteOAuth()
  return google.calendar({ version: 'v3', auth })
}

interface DadosEvento {
  titulo: string
  descricao?: string
  dataHoraInicioISO: string
  duracaoMinutos: number
  comGoogleMeet: boolean
  emailConvidado?: string
}

// Cria um evento no Google Agenda e retorna o ID do evento criado
// (esse ID é salvo em sessoes_agendamento.google_event_id, para
// permitir edição/cancelamento depois).
export async function criarEventoAgenda(dados: DadosEvento): Promise<{ eventId: string; meetLink?: string }> {
  const calendar = obterCalendario()
  const inicio = new Date(dados.dataHoraInicioISO)
  const fim = new Date(inicio.getTime() + dados.duracaoMinutos * 60_000)

  const resposta = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    conferenceDataVersion: dados.comGoogleMeet ? 1 : 0,
    requestBody: {
      summary: dados.titulo,
      description: dados.descricao,
      start: { dateTime: inicio.toISOString(), timeZone: 'America/Sao_Paulo' },
      end: { dateTime: fim.toISOString(), timeZone: 'America/Sao_Paulo' },
      attendees: dados.emailConvidado ? [{ email: dados.emailConvidado }] : undefined,
      conferenceData: dados.comGoogleMeet
        ? {
            createRequest: {
              requestId: `ordo-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          }
        : undefined,
    },
  })

  return {
    eventId: resposta.data.id!,
    meetLink: resposta.data.hangoutLink ?? undefined,
  }
}

export async function atualizarEventoAgenda(
  eventId: string,
  novaDataHoraISO: string,
  duracaoMinutos: number
) {
  const calendar = obterCalendario()
  const inicio = new Date(novaDataHoraISO)
  const fim = new Date(inicio.getTime() + duracaoMinutos * 60_000)

  await calendar.events.patch({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    eventId,
    requestBody: {
      start: { dateTime: inicio.toISOString(), timeZone: 'America/Sao_Paulo' },
      end: { dateTime: fim.toISOString(), timeZone: 'America/Sao_Paulo' },
    },
  })
}

export async function cancelarEventoAgenda(eventId: string) {
  const calendar = obterCalendario()
  await calendar.events.delete({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    eventId,
  })
}

// Busca horários ocupados num intervalo, usando a API freebusy.
// Usado para não deixar paciente marcar em cima de algo já existente
// na sua agenda real (incluindo compromissos que não vieram do Eixo).
export async function buscarHorariosOcupados(inicioISO: string, fimISO: string): Promise<{ inicio: string; fim: string }[]> {
  const calendar = obterCalendario()
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

  const resposta = await calendar.freebusy.query({
    requestBody: {
      timeMin: inicioISO,
      timeMax: fimISO,
      items: [{ id: calendarId }],
    },
  })

  const ocupados = resposta.data.calendars?.[calendarId]?.busy ?? []
  return ocupados.map((b) => ({ inicio: b.start!, fim: b.end! }))
}
