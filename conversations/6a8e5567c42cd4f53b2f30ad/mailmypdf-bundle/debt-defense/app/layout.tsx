import './globals.css'

export const metadata = {
  title: 'Debt Defense',
  description: 'Debt Defense — focused workflows for responding to government decisions, denials, and notices. Upload the decision, organize evidence, draft a response, review, and mail with proof.',
  openGraph: { title: 'Debt Defense', description: 'Debt Defense — focused workflows.', type: 'website', siteName: 'Debt Defense' },
  twitter: { card: 'summary_large_image', title: 'Debt Defense', description: 'Debt Defense — focused workflows.' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}