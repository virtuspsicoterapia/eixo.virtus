'use client'

import { useEffect, useState } from 'react'

// Detecta se o usuário está:
// 1. No Safari do iPhone/iPad (iOS)
// 2. Com o app NÃO instalado na tela inicial
// Se ambos forem verdadeiros, mostra o banner de instalação.
// Depois que o usuário dispensar, não aparece mais (localStorage).

type Situacao = 'ios-nao-instalado' | 'android-nao-instalado' | 'instalado' | 'outro'

function detectarSituacao(): Situacao {
  if (typeof window === 'undefined') return 'outro'

  const eStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true

  if (eStandalone) return 'instalado'

  const ua = window.navigator.userAgent
  const eIOS = /iphone|ipad|ipod/i.test(ua)
  const eAndroid = /android/i.test(ua)

  if (eIOS) return 'ios-nao-instalado'
  if (eAndroid) return 'android-nao-instalado'
  return 'outro'
}

export default function BannerInstalacao() {
  const [situacao, setSituacao] = useState<Situacao>('outro')
  const [dispensado, setDispensado] = useState(true) // começa como true para evitar flash
  const [expandido, setExpandido] = useState(false)

  useEffect(() => {
    const jaDispensou = localStorage.getItem('ordo-instalacao-dispensada')
    setSituacao(detectarSituacao())
    setDispensado(!!jaDispensou)
  }, [])

  function dispensar() {
    localStorage.setItem('ordo-instalacao-dispensada', '1')
    setDispensado(true)
  }

  // Não mostra se: já instalado, já dispensou, ou não é mobile
  if (dispensado || situacao === 'instalado' || situacao === 'outro') return null

  return (
    <>
      {/* Overlay escurecido quando expandido */}
      {expandido && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 49,
          }}
          onClick={() => setExpandido(false)}
        />
      )}

      {/* Banner compacto (sempre visível) */}
      {!expandido && (
        <div style={{
          position: 'fixed', bottom: 80, left: 12, right: 12, zIndex: 48,
          background: 'var(--navy-soft)',
          border: '1px solid rgba(201,169,97,0.35)',
          borderRadius: 6, padding: '13px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--navy)', border: '1px solid var(--gold-dim)',
            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
              <path d="M50 12 C30 12 14 28 14 50 C14 72 30 88 50 88 C42 80 37 66 37 50 C37 34 42 20 50 12 Z" fill="#C9A961" opacity="0.9"/>
              <circle cx="50" cy="50" r="9" fill="#0B1422" stroke="#C9A961" strokeWidth="2"/>
              <g stroke="#C9A961" strokeWidth="2" strokeLinecap="round">
                <line x1="50" y1="33" x2="50" y2="26"/>
                <line x1="67" y1="50" x2="74" y2="50"/>
                <line x1="50" y1="67" x2="50" y2="74"/>
                <line x1="33" y1="50" x2="26" y2="50"/>
              </g>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--bone)', marginBottom: 2 }}>
              Instale o Eixo na tela inicial
            </div>
            <div style={{ fontSize: 11.5, color: '#8a96a8', lineHeight: 1.4 }}>
              Acesso mais rápido e notificações ativadas
            </div>
          </div>
          <button
            onClick={() => setExpandido(true)}
            style={{
              background: 'var(--gold)', color: 'var(--navy)', border: 'none',
              borderRadius: 3, padding: '8px 12px', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            Como?
          </button>
          <button
            onClick={dispensar}
            style={{
              background: 'none', border: 'none', color: '#5e6c82',
              fontSize: 18, cursor: 'pointer', padding: '0 2px', lineHeight: 1,
            }}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      )}

      {/* Card expandido com passo a passo */}
      {expandido && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: 'var(--navy-soft)',
          borderRadius: '12px 12px 0 0',
          border: '1px solid var(--line)',
          borderBottom: 'none',
          padding: '24px 24px 40px',
          maxWidth: 480,
          margin: '0 auto',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}>
          {/* Puxador visual */}
          <div style={{
            width: 36, height: 4, background: 'var(--line)',
            borderRadius: 2, margin: '0 auto 20px',
          }} />

          <h2 style={{
            fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 500,
            color: 'var(--bone)', margin: '0 0 6px',
          }}>
            Instale o Eixo
          </h2>
          <p style={{ fontSize: 13, color: '#8a96a8', lineHeight: 1.5, margin: '0 0 24px' }}>
            {situacao === 'ios-nao-instalado'
              ? 'No iPhone, o Eixo é instalado direto pelo Safari em 3 passos:'
              : 'No Android, o Eixo é instalado direto pelo Chrome em 2 passos:'}
          </p>

          {situacao === 'ios-nao-instalado' && <PassosIOS />}
          {situacao === 'android-nao-instalado' && <PassosAndroid />}

          <div style={{ height: 24 }} />

          <button
            onClick={dispensar}
            style={{
              display: 'block', width: '100%', textAlign: 'center',
              background: 'var(--gold)', color: 'var(--navy)', border: 'none',
              borderRadius: 3, padding: 15, fontSize: 14.5, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Entendi, vou instalar
          </button>
          <button
            onClick={dispensar}
            style={{
              display: 'block', width: '100%', textAlign: 'center',
              background: 'none', border: 'none', color: '#7e8ba0',
              fontSize: 13, padding: '14px 0 0', cursor: 'pointer',
            }}
          >
            Agora não
          </button>
        </div>
      )}
    </>
  )
}

// ---- Passo a passo iOS (Safari) ----
function PassosIOS() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Passo numero={1} titulo='Toque no botão de compartilhar'>
        <p style={{ fontSize: 13, color: '#8a96a8', lineHeight: 1.5, margin: '6px 0 0' }}>
          É o ícone de caixa com seta para cima, no centro da barra inferior do Safari:
        </p>
        <div style={{
          marginTop: 10, background: 'rgba(245,241,232,0.04)',
          border: '1px solid var(--line)', borderRadius: 4,
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <IconeCompartilharIOS />
          <span style={{ fontSize: 12.5, color: 'var(--bone)' }}>Botão de compartilhar</span>
        </div>
      </Passo>

      <Passo numero={2} titulo='Role e toque em "Adicionar à Tela de Início"'>
        <p style={{ fontSize: 13, color: '#8a96a8', lineHeight: 1.5, margin: '6px 0 0' }}>
          No menu que abre, role para baixo até encontrar essa opção:
        </p>
        <div style={{
          marginTop: 10, background: 'rgba(245,241,232,0.04)',
          border: '1px solid var(--line)', borderRadius: 4,
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <IconeAdicionarIOS />
          <span style={{ fontSize: 12.5, color: 'var(--bone)' }}>Adicionar à Tela de Início</span>
        </div>
      </Passo>

      <Passo numero={3} titulo='Toque em "Adicionar" no canto superior direito'>
        <p style={{ fontSize: 13, color: '#8a96a8', lineHeight: 1.5, margin: '6px 0 0' }}>
          O Eixo aparecerá na sua tela inicial com o ícone dourado, como um app normal.
          A partir daí, notificações funcionam.
        </p>
      </Passo>
    </div>
  )
}

// ---- Passo a passo Android (Chrome) ----
function PassosAndroid() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Passo numero={1} titulo='Toque nos três pontos no canto superior direito do Chrome'>
        <p style={{ fontSize: 13, color: '#8a96a8', lineHeight: 1.5, margin: '6px 0 0' }}>
          Ou pode aparecer um banner automático do Chrome perguntando se quer instalar — aceite.
        </p>
      </Passo>

      <Passo numero={2} titulo='Toque em "Adicionar à tela inicial" ou "Instalar app"'>
        <p style={{ fontSize: 13, color: '#8a96a8', lineHeight: 1.5, margin: '6px 0 0' }}>
          O Eixo aparecerá na sua tela inicial e notificações funcionam automaticamente.
        </p>
      </Passo>
    </div>
  )
}

// ---- Componente de passo numerado ----
function Passo({ numero, titulo, children }: { numero: number; titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 14 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'rgba(201,169,97,0.12)',
        border: '1px solid var(--gold-dim)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, color: 'var(--gold)',
      }}>
        {numero}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--bone)' }}>{titulo}</div>
        {children}
      </div>
    </div>
  )
}

// ---- Ícones iOS desenhados em SVG (reconhecíveis sem depender de imagem externa) ----
function IconeCompartilharIOS() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6L12 2l4 4"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
      <path d="M20 12v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8"/>
    </svg>
  )
}

function IconeAdicionarIOS() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  )
}
