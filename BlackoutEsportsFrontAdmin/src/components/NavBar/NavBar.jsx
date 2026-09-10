import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { useState } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import AuthModal from '../../auth/AuthModal'
import './NavBar.css'

function NavBar() {
  const { user, isAdmin, logout } = useAuth()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <Navbar expand="lg" className="site-navbar" variant="dark">
      <Container>
        <Navbar.Brand className="site-navbar__brand" href="#inicio">
          <img className="site-navbar__mark" src="/BKL.png" alt="BKL" />
          Blackout <strong>Esports</strong>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navigation" />
        <Navbar.Collapse id="main-navigation">
          <Nav className="site-navbar__links ms-auto">
            <Nav.Link href="#inicio">Inicio</Nav.Link>
            <Nav.Link href="#jugadores">Jugadores</Nav.Link>
            <Nav.Link href="#torneos">Torneos</Nav.Link>
            <Nav.Link href="#roster">Roster</Nav.Link>
            {isAdmin && <Nav.Link href="#admin">Panel admin</Nav.Link>}
          </Nav>
          {user ? (
            <div className="site-navbar__account">
              <button
                aria-expanded={isProfileOpen}
                className="site-navbar__profile"
                onClick={() => setIsProfileOpen((open) => !open)}
                type="button"
              >
                <span>{user.name}</span>
                <span aria-hidden="true" className="site-navbar__profile-arrow">⌄</span>
              </button>
              {isProfileOpen && (
                <div className="site-navbar__profile-menu">
                  <button onClick={() => { logout(); setIsProfileOpen(false) }} type="button">Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <button className="site-navbar__action" onClick={() => setIsAuthOpen(true)} type="button">
              Iniciar sesión
            </button>
          )}
        </Navbar.Collapse>
      </Container>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </Navbar>
  )
}

export default NavBar
