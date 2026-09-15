import { lazy, Suspense, useEffect, useState } from 'react'
import Footer from './components/Footer/Footer'
import NavBar from './components/NavBar/NavBar'
import Home from './Pages/Home/Home'

const Players = lazy(() => import('./Pages/Players/Players'))
const Roster = lazy(() => import('./Pages/Roster/Roster'))
const Tournaments = lazy(() => import('./Pages/Tournaments/Tournaments'))
const Admin = lazy(() => import('./Pages/Admin/Admin'))

function getPageFromHash() {
  const page = window.location.hash.slice(1)
  return ['jugadores', 'torneos', 'roster', 'admin'].includes(page) ? page : 'inicio'
}

function App() {
  const [currentPage, setCurrentPage] = useState(getPageFromHash)

  useEffect(() => {
    const handleHashChange = () => setCurrentPage(getPageFromHash())
    window.addEventListener('hashchange', handleHashChange)

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const page = {
    inicio: <Home />,
    jugadores: <Players />,
    torneos: <Tournaments />,
    roster: <Roster />,
    admin: <Admin />,
  }[currentPage]

  return (
    <div className="app-shell">
      <NavBar />
      <main>
        <Suspense fallback={<div className="page-loading" aria-live="polite">Cargando...</div>}>
          {page}
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
