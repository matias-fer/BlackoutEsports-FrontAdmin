import Carousel from 'react-bootstrap/Carousel'
import { usePlayers } from '../../context/PlayersContext'

function Home() {
  const { players } = usePlayers()
  return (
    <>
      <section className="intro" id="inicio">
        <p className="intro__eyebrow">Descubre a nuestros jugadores</p>
        <h1>BLACKOUT ESPORTS</h1>
        <p className="intro__copy">
          Aqui encontraras todo lo relacionado con nuestros jugadores, torneos y equipos.
        </p>
        <a className="intro__button" href="#jugadores">Explorar jugadores</a>
      </section>
      <section className="home-players" aria-labelledby="home-players-title">
        <div className="home-players__heading">
          <div>
            <p className="page-eyebrow">Conoce sus setups</p>
            <h2 id="home-players-title">Jugadores destacados</h2>
          </div>
          <a className="text-link" href="#jugadores">Ver todos <span aria-hidden="true">→</span></a>
        </div>
        <Carousel className="players-carousel" interval={4500}>
          {players.map((player) => (
            <Carousel.Item key={player.alias}>
              <article className="home-player-slide">
                <div className="home-player-slide__avatar">{player.alias.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="home-player-slide__team">{player.team}</p>
                  <h3>{player.alias}</h3>
                  <p>{player.name} · {player.role} · {player.game}</p>
                </div>
                <span className="home-player-slide__country">{player.country}</span>
              </article>
            </Carousel.Item>
          ))}
        </Carousel>
      </section>
    </>
  )
}

export default Home
