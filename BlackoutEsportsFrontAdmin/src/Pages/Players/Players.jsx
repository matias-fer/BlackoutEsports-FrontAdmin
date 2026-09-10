import { useMemo, useState } from 'react'
import { usePlayers } from '../../context/PlayersContext'

function Players() {
  const { players } = usePlayers()
  const games = ['Todos', ...new Set(players.map((player) => player.game))]
  const teams = ['Todos', ...new Set(players.map((player) => player.team))]
  const [selectedGame, setSelectedGame] = useState('Todos')
  const [selectedTeam, setSelectedTeam] = useState('Todos')
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const filteredPlayers = useMemo(
    () => players.filter((player) => (
      (selectedGame === 'Todos' || player.game === selectedGame)
      && (selectedTeam === 'Todos' || player.team === selectedTeam)
    )),
    [players, selectedGame, selectedTeam],
  )

  return (
    <section className="players-page" id="jugadores">
      <div className="players-page__heading">
        <div>
          <p className="page-eyebrow">Blackout Esports</p>
          <h2>Jugadores &amp; periféricos</h2>
          <p className="players-page__intro">
            Conoce el setup de los jugadores que compiten en Blackout Esports.
          </p>
        </div>
        <div className="players-page__filters">
          <label className="players-page__filter">
            <span>Equipo</span>
            <select value={selectedTeam} onChange={(event) => {
              setSelectedTeam(event.target.value)
              setSelectedPlayer(null)
            }}>
              {teams.map((team) => <option key={team}>{team}</option>)}
            </select>
          </label>
          <label className="players-page__filter">
            <span>Juego</span>
            <select value={selectedGame} onChange={(event) => {
              setSelectedGame(event.target.value)
              setSelectedPlayer(null)
            }}>
              {games.map((game) => <option key={game}>{game}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="players-grid">
        {filteredPlayers.map((player) => (
          <button
            className="player-card"
            key={player.alias}
            onClick={() => setSelectedPlayer(player)}
            type="button"
          >
            <div className="player-card__header">
              <span className="player-card__avatar">{player.alias.charAt(0).toUpperCase()}</span>
              <div>
                <p className="player-card__alias">{player.alias}</p>
                <p className="player-card__name">{player.name}</p>
              </div>
              <span className="player-card__country">{player.country}</span>
            </div>
            <div className="player-card__meta">
              <span>{player.team}</span>
              <span>{player.game}</span>
              <span>{player.role}</span>
            </div>
            <dl className="setup-list">
              <div><dt>Mouse</dt><dd>{player.mouse}</dd></div>
              <div><dt>Teclado</dt><dd>{player.keyboard}</dd></div>
              <div><dt>Headset</dt><dd>{player.headset}</dd></div>
              <div><dt>Monitor</dt><dd>{player.monitor}</dd></div>
              <div><dt>Sensibilidad</dt><dd>{player.sensitivity}</dd></div>
            </dl>
          </button>
        ))}
      </div>

      {selectedPlayer && (
        <aside className="player-detail" aria-label={`Setup de ${selectedPlayer.alias}`}>
          <div className="player-detail__heading">
            <div>
              <p className="page-eyebrow">Perfil seleccionado</p>
              <h3>{selectedPlayer.alias} <span>{selectedPlayer.name}</span></h3>
              <p>{selectedPlayer.team} · {selectedPlayer.game} · {selectedPlayer.role}</p>
            </div>
            <button className="player-detail__close" onClick={() => setSelectedPlayer(null)} type="button">
              Cerrar
            </button>
          </div>
          <div className="player-detail__stats">
            <div><span>Sensibilidad</span><strong>{selectedPlayer.sensitivity}</strong></div>
            <div><span>País</span><strong>{selectedPlayer.country}</strong></div>
          </div>
          <div className="peripheral-grid">
            {selectedPlayer.peripherals.map((peripheral) => (
              <article className="peripheral-card" key={peripheral.type}>
                <p>{peripheral.type}</p>
                <h4>{peripheral.name}</h4>
                <span>{peripheral.specs}</span>
                <div className="peripheral-card__actions">
                  <a href={`https://www.amazon.com/s?k=${encodeURIComponent(peripheral.search)}`} rel="noreferrer" target="_blank">Comprar en Amazon</a>
                  <a href={`https://listado.mercadolibre.com.ar/${encodeURIComponent(peripheral.search)}`} rel="noreferrer" target="_blank">Ver en Mercado Libre</a>
                </div>
              </article>
            ))}
          </div>
        </aside>
      )}
    </section>
  )
}

export default Players
