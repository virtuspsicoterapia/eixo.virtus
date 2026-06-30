import type { Metadata, Viewport } from 'next'
import './globals.css'
import BannerInstalacao from '@/app/componentes/banner-instalacao'

export const metadata: Metadata = {
  title: 'Eixo — por Virtus Psicoterapia',
  description: 'Diário, reflexões e acompanhamento terapêutico, por Virtus Psicoterapia.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Eixo',
  },
}

export const viewport: Viewport = {
  themeColor: '#0B1422',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <BannerInstalacao />
      </body>
    </html>
  )
}
