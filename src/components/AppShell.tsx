import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import Footer from './Footer'
import styles from './AppShell.module.css'

export default function AppShell() {
  const { pathname } = useLocation()
  const isChildArea = pathname.startsWith('/child')

  return (
    <div className={styles['app-shell']}>
      <Header />
      <main className={styles['app-shell__main']}>
        <Outlet />
      </main>
      {/* Footer/nav: pas en mode enfant */}
      {!isChildArea && <Footer />}
    </div>
  )
}