import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import appCss from './styles.css?url'

export const links = () => [{ rel: 'stylesheet', href: appCss }]

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
