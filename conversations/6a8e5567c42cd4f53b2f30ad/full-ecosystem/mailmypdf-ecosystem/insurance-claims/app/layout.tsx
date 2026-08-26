import './globals.css'

export const metadata = {
  title: 'Insurance Claims | Claim Response & Appeal Workflows',
  description: 'Focused workflows for denied insurance claims, coverage denials, health, home, auto, disability, workers compensation, and life insurance claims.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
