import { useState } from 'react'
import { useCompetition } from '../../context/CompetitionContext'
import { usePlayers } from '../../context/PlayersContext'

function Roster() {
  const { teams } = useCompetition()
  const { players } = usePlayers()
  const [selectedTeam, setSelectedTeam] = useState(null)
  const selectedPlayers = selectedTeam
    ? players.filter((player) => player.team === selectedTeam.name)
    : []

  return (
    <section className="roster-page" id="roster">
      <div className="roster-page__heading">
        <div>
          <p className="page-eyebrow">Competencia en equipo</p>
          <h2>Roster</h2>
        </div>
        <p>Selecciona una alineación para conocer a sus jugadores.</p>
      </div>
      <div className="roster-teams">
        {teams.map((team) => (
          <button
            className={`roster-team${selectedTeam?.name === team.name ? ' roster-team--active' : ''}`}
            key={team.name}
            onClick={() => setSelectedTeam(selectedTeam?.name === team.name ? null : team)}
            type="button"
          >
            <span className="roster-team__number">{team.number}</span>
            <div>
              <p className="roster-team__label">{team.label}</p>
              <h3>{team.name}</h3>
              {team.status && <p className="roster-team__status">{team.status}</p>}
            </div>
            <span className="roster-team__arrow" aria-hidden="true">→</span>
          </button>
        ))}
      </div>
      {selectedTeam && (
        <div className="roster-players" aria-label={`Jugadores de ${selectedTeam.name}`}>
          <div className="roster-players__heading">
            <div>
              <p className="page-eyebrow">Alineación seleccionada</p>
              <h3>{selectedTeam.name}</h3>
            </div>
            <span>{selectedPlayers.length} jugadores</span>
          </div>
          <div className="roster-players__list">
            {selectedPlayers.map((player, index) => (
              <article className="roster-player" key={player.alias}>
                <span className="roster-player__number">0{index + 1}</span>
                <div>
                  <h4>{player.alias}</h4>
                  <p>{player.name}</p>
                  <small>{player.mouse} · {player.keyboard}</small>
                </div>
                <span>{player.role}</span>
                <span className="roster-player__country">{player.country}</span>
                <span className="roster-player__status">Titular</span>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default Roster
