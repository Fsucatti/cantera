import { Trophy } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useApi } from "../lib/api";
import type { Team, TeamDetail } from "../shared/types";
import { ListingCard, Status, bannerUrl, personPhoto, teamLogo } from "../ui/common";
import { FollowButton } from "./Home";

/** What a result looks like in a team's trophy case: wins get the trophy. */
const isWin = (result: string) => /champion/i.test(result);

export function Teams() {
  const { data, error, loading, reload } = useApi<Team[]>("/teams");
  return (
    <div className="page">
      <h1 className="page-title">Teams</h1>
      <Status loading={loading} error={error} onRetry={reload} />
      <div className="job-grid">
        {data?.map((team) => (
          <article className="job-card team-card" key={team.id}>
            <div className="job-banner" style={{ backgroundImage: `url(${bannerUrl(team.banner)})` }} />
            <img className="job-logo" src={teamLogo(team.id)} alt="" width={36} height={36} />
            <div className="job-body">
              <Link className="job-link" to={`/teams/${team.id}`}><span className="job-team">{team.name}</span></Link>
              <p className="job-role">{team.location} · {team.gameName}</p>
              <p className="team-tagline">{team.tagline}</p>
              <FollowButton team={team} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function TeamPage() {
  const { id } = useParams();
  const { data, error, loading, reload } = useApi<TeamDetail>(`/teams/${id}`);
  if (!data) return <div className="page"><Status loading={loading} error={error} onRetry={reload} /></div>;

  return (
    <div className="page">
      <header className="hero hero-team" style={{ backgroundImage: `url(${bannerUrl(data.banner)})` }}>
        <img className="hero-logo" src={teamLogo(data.id)} alt="" width={72} height={72} />
        <div className="hero-text">
          <h1 className="hero-name">{data.name} <span className="hero-tag">{data.tag}</span></h1>
          <p className="hero-tagline">{data.tagline}</p>
        </div>
        <div className="hero-action"><FollowButton key={data.id} team={data} /></div>
      </header>

      <div className="detail-layout detail-layout-facts">
        <div className="detail-main">
          <section className="panel detail-section">
            <h2>About {data.name}</h2>
            {data.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
          <section className="panel detail-section">
            <h2>What We Do</h2>
            <ul>{data.whatWeDo.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section className="panel detail-section">
            <h2>{data.honorsTitle}</h2>
            <ul className="honors">
              {data.honors.map((honor) => (
                <li key={`${honor.year} ${honor.title}`}>
                  <span className="honor-year">{honor.year}</span>
                  <span className="honor-title">{honor.title}</span>
                  <span className={`honor-result${isWin(honor.result) ? " honor-win" : ""}`}>
                    {isWin(honor.result) && <Trophy size={12} aria-hidden="true" />}
                    {honor.result}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="panel detail-section">
            <h2>{data.rosterTitle}</h2>
            <div className="roster">
              {data.roster.map((player) => (
                <div className="roster-card" key={player.handle}>
                  <h3>{player.handle}</h3>
                  <p>{player.role}</p>
                  <p className="muted small">{player.country}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="panel detail-section">
            <h2>FAQs</h2>
            {data.faqs.map((faq) => (
              <div className="faq" key={faq.question}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </section>
          <section className="panel detail-section">
            <h2>Posted Jobs</h2>
            <div className="job-grid">{data.listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>
          </section>
        </div>

        <aside className="panel detail-side">
          <h2>Team facts</h2>
          <dl>
            <dt>Location</dt><dd>{data.location}</dd>
            <dt>Founded in</dt><dd>{data.founded}</dd>
            <dt>Company Size</dt><dd>{data.size}</dd>
            <dt>Main game</dt><dd><Link className="plain-link" to={`/games/${data.gameIds[0]}`}>{data.gameName}</Link></dd>
            <dt>League</dt><dd>{data.league}</dd>
            <dt>Colors</dt><dd>{data.colors}</dd>
            <dt>Supporters</dt><dd>{data.supporters}</dd>
            <dt>Focus Areas</dt>
            <dd className="focus-areas">{data.focusAreas.map((area) => <span className="pill" key={area}>{area}</span>)}</dd>
          </dl>
          <div className="side-list">
            <h3>Talk to the team</h3>
            <div className="team-contact">
              <img className="avatar" src={personPhoto(data.contact.id)} alt="" width={40} height={40} />
              <div>
                <strong>{data.contact.name}</strong>
                <p className="muted small">{data.contact.role}</p>
              </div>
            </div>
            <Link className="button button-wide" to={`/inbox/${data.contact.id}`} aria-label={`Message ${data.contact.name}`}>Message</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
