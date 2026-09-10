import { useCompetition } from '../../context/CompetitionContext'

function Tournaments() {
  const { tournaments } = useCompetition()
  return (
    <section className="tournaments-page" id="torneos">
      <div className="tournaments-page__heading">
        <div>
          <p className="page-eyebrow">La competencia continúa</p>
          <h2>Torneos</h2>
        </div>
        <a className="text-link" href="#todos-los-torneos">Ver calendario completo <span aria-hidden="true">→</span></a>
      </div>
      <div className="tournament-list">
        {tournaments.map((tournament) => (
          <article className="tournament-row" key={tournament.name}>
            <div>
              <p className="tournament-row__game">{tournament.game}</p>
              <h3>{tournament.name}</h3>
            </div>
            <span className="tournament-row__status">{tournament.status}</span>
            <span className="tournament-row__date">{tournament.date}</span>
            <span className="tournament-row__teams">{tournament.teams}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Tournaments
