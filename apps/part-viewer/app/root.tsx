import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import appCss from './styles.css?url'

export const links = () => [
  { rel: 'stylesheet', href: appCss },
  // The same two faces the feature picker loads, so the pair of apps read alike
  // rather than nearly alike, which is worse than either on its own.
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Open+Sans:wght@400;500;600;700&display=swap',
  },
]

export const Layout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className="dark">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="color-scheme" content="dark" />
      <Meta />
      <Links />
    </head>
    <body>
      {children}
      <ScrollRestoration />
      <Scripts />
    </body>
  </html>
)

export default function App() {
  return <Outlet />
}
