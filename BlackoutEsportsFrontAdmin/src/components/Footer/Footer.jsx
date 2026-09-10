import Container from 'react-bootstrap/Container'
import './Footer.css'

function Footer() {
  return (
    <footer className="site-footer">
      <Container className="site-footer__content">
        <div>
          <p className="site-footer__brand">Blackout <span>Esports</span></p>
          <p className="site-footer__copy">
            Competencia, comunidad y juego al más alto nivel.
          </p>
        </div>
        <div className="site-footer__links">
          <a href="#terminos">Términos</a>
          <a href="#privacidad">Privacidad</a>
          <a href="#contacto">Contacto</a>
        </div>
        <p className="site-footer__legal">© 2026 Blackout Esports</p>
      </Container>
    </footer>
  )
}

export default Footer
