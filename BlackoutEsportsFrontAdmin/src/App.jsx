import { useEffect, useState } from 'react'
import Footer from './components/Footer/Footer'
import NavBar from './components/NavBar/NavBar'
import Home from './Pages/Home/Home'
import Players from './Pages/Players/Players'
import Roster from './Pages/Roster/Roster'
import Tournaments from './Pages/Tournaments/Tournaments'
import Admin from './Pages/Admin/Admin'

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
      <main>{page}</main>
      <Footer />
    </div>
  )
}

export default App
