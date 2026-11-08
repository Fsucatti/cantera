import { Link, useParams } from "react-router-dom";
import { useApi } from "../lib/api";
import type { GameDetail } from "../shared/types";
import { ListingCard, Status, bannerUrl, gameLogo, teamLogo } from "../ui/common";

export function GamePage() {
  const { id } = useParams();
  const { data, error, loading, reload } = useApi<GameDetail>(`/games/${id}`);
  if (!data) return <div className="page"><Status loading={loading} error={error} onRetry={reload} /></div>;

  return (
    <div className="page">
      <header className="hero" style={{ backgroundImage: `url(${bannerUrl(data.banner)})` }}>
        <h1 className="hero-title"><img className={`hero-wordmark wordmark-${data.id}`} src={gameLogo(data.id)} alt={data.name} /></h1>
        <p className="hero-tagline">{data.tagline}</p>
        <div className="hero-pills">
          <span className="pill pill-hero">{data.genre}</span>
          <span className="pill pill-hero">{data.format}</span>
        </div>
      </header>

      <div className="detail-layout detail-layout-facts">
        <div className="detail-main">
          <section className="panel detail-section">
            <h2>How it plays</h2>
            {data.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
          <section className="panel detail-section">
            <h2>{data.rolesTitle}</h2>
            <ul className="role-list">
              {data.roles.map((role) => (
                <li key={role.name}>
                  <strong>{role.name}</strong>
                  <span>{role.detail}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="panel detail-section">
            <h2>The competitive circuit</h2>
            {data.circuit.map((event) => (
              <div className="faq" key={event.name}>
                <h3>{event.name}</h3>
                <p>{event.detail}</p>
              </div>
            ))}
          </section>
          <section className="panel detail-section">
            <h2>How players talk</h2>
            <dl className="slang">
              {data.slang.map((item) => (
                <div key={item.term}>
                  <dt>{item.term}</dt>
                  <dd>{item.meaning}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="panel detail-section">
            <h2>Open roles</h2>
            <div className="job-grid">{data.listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>
          </section>
        </div>

        <aside className="panel detail-side">
          <h2>About the game</h2>
          <dl>
            <dt>Studio</dt><dd>{data.studio}</dd>
            <dt>Released</dt><dd>{data.released}</dd>
            <dt>Platforms</dt><dd>{data.platforms}</dd>
            <dt>Format</dt><dd>{data.format}</dd>
            <dt>Maps</dt>
            <dd className="focus-areas">{data.maps.map((map) => <span className="pill" key={map}>{map}</span>)}</dd>
          </dl>
          <div className="side-list">
            <h3>Teams on Cantera</h3>
            {data.teams.map((team) => (
              <Link className="side-list-row" to={`/teams/${team.id}`} key={team.id}>
                <img src={teamLogo(team.id)} alt="" width={28} height={28} />
                <span>{team.name}</span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
