import { Link, useParams } from "react-router-dom";
import { useApi } from "../lib/api";
import type { Listing, Team } from "../shared/types";
import { ListingCard, Status, bannerUrl, teamLogo } from "../ui/common";
import { FollowButton } from "./Home";

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
              <p className="job-role">{team.location}</p>
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
  const { data, error, loading, reload } = useApi<Team & { listings: Listing[] }>(`/teams/${id}`);
  if (!data) return <div className="page"><Status loading={loading} error={error} onRetry={reload} /></div>;

  return (
    <div className="page detail-layout">
      <div className="detail-main">
        <section className="panel detail-head"><h1>{data.name}</h1></section>
        <section className="panel detail-section">
          <h2>About {data.name}</h2>
          {data.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
        <section className="panel detail-section">
          <h2>What We Do</h2>
          <ul>{data.whatWeDo.map((item) => <li key={item}>{item}</li>)}</ul>
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
        <img src={teamLogo(data.id)} alt="" width={64} height={64} />
        <h2>{data.name}</h2>
        <FollowButton team={data} />
        <dl>
          <dt>Company Size</dt><dd>{data.size}</dd>
          <dt>Location</dt><dd>{data.location}</dd>
          <dt>Founded in</dt><dd>{data.founded}</dd>
          <dt>Focus Areas</dt>
          <dd className="focus-areas">{data.focusAreas.map((area) => <span className="pill" key={area}>{area}</span>)}</dd>
        </dl>
      </aside>
    </div>
  );
}
