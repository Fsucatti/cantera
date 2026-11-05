import { Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, useApi } from "../lib/api";
import { useSession, useUser } from "../lib/session";
import type { Game, Listing, ListingDetail } from "../shared/types";
import { Avatar, ErrorNote, Field, ListingCard, Modal, Status, bannerUrl, teamLogo } from "../ui/common";

const FILTERS = [
  ["", "All"],
  ["job", "Jobs"],
  ["game", "Games"],
  ["community", "Communities"],
  ["guide", "Guides"],
  ["session", "Sessions"],
  ["event", "Events"],
  ["coach", "Coaches"],
  ["creator", "Creators"],
  ["saved", "Saved"],
] as const;

export function Jobs() {
  const user = useUser();
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "";
  const applied = params.get("applied") === "1";
  const query = params.get("q") ?? "";
  const [draft, setDraft] = useState(query);

  useEffect(() => setDraft(query), [query]);

  const path = new URLSearchParams();
  if (query) path.set("q", query);
  if (category === "saved") path.set("saved", "1");
  else if (category && category !== "game") path.set("category", category);
  const listings = useApi<Listing[]>(category === "game" ? null : `/listings?${path}`);
  const games = useApi<Game[]>(category === "game" ? "/games" : null);

  const update = (next: Record<string, string>) => {
    const merged = new URLSearchParams(params);
    merged.delete("applied");
    for (const [key, value] of Object.entries(next)) {
      if (value) merged.set(key, value);
      else merged.delete(key);
    }
    setParams(merged);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    update({ q: draft.trim() });
  };

  const results = (listings.data ?? []).filter((listing) => !applied || listing.applied);

  return (
    <div className="page">
      <h1 className="page-title">Jobs Board</h1>
      <form className="search-bar" onSubmit={submit} role="search">
        <Avatar src={user.avatar} name={user.name} size={22} />
        <input placeholder="Search team, tag, player" aria-label="Search listings" value={draft} onChange={(event) => setDraft(event.target.value)} />
        <button className="button button-green button-small" type="submit"><Search size={14} /> Search</button>
      </form>
      <div className="filters" role="group" aria-label="Filter by type">
        {FILTERS.map(([value, label]) => (
          <button key={value} className="filter" aria-pressed={!applied && category === value} onClick={() => update({ category: value })}>{label}</button>
        ))}
      </div>

      {category === "game" ? (
        <>
          <h2 className="subheading">Games</h2>
          <Status loading={games.loading} error={games.error} onRetry={games.reload} />
          <div className="job-grid">
            {games.data?.map((game) => (
              <button key={game.id} className="game-card" onClick={() => setParams({ q: game.name })}>
                <span className="job-banner" style={{ backgroundImage: `url(${bannerUrl(game.banner)})` }} />
                <span className="game-card-body">
                  <strong>{game.name}</strong>
                  <span className="muted small">{game.genre}</span>
                  <span>{game.description}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="subheading">{applied ? "Your applications" : query ? `Results for "${query}"` : "Your Newest matches"}</h2>
          <Status loading={listings.loading} error={listings.error} onRetry={listings.reload} />
          {!listings.loading && !listings.error && results.length === 0 && (
            <div className="empty">
              <p>{applied ? "You haven't applied to anything yet." : category === "saved" ? "You haven't saved anything yet." : "Nothing matches that search."}</p>
              {(query || category) && <button className="button" onClick={() => setParams({})}>Clear filters</button>}
            </div>
          )}
          <div className="job-grid">
            {results.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        </>
      )}
    </div>
  );
}

function Section({ title, items, paragraphs }: { title: string; items?: string[]; paragraphs?: string[] }) {
  return (
    <section className="panel detail-section">
      <h2>{title}</h2>
      {paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {items && <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>}
    </section>
  );
}

function ApplyDialog({ listing, onClose, onApplied }: { listing: ListingDetail; onClose: () => void; onApplied: (recruiterId: string) => void }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await api<{ recruiterId: string }>(`/listings/${listing.id}/apply`, { method: "POST", body: { note } });
      onApplied(result.recruiterId);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Couldn't send your application.");
      setBusy(false);
    }
  };
  return (
    <Modal title={`Apply to ${listing.teamName}`} onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <p>{listing.title}</p>
        <Field label="Why are you a good fit? (optional)" hint="Your profile, skills and highlights are included.">
          <textarea rows={5} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} />
        </Field>
        <ErrorNote message={error} />
        <button className="button button-green" type="submit" disabled={busy}>{busy ? "Sending…" : "Send application"}</button>
      </form>
    </Modal>
  );
}

export function JobDetail() {
  const { id } = useParams();
  const { data, error, loading, reload } = useApi<ListingDetail>(`/listings/${id}`);
  const [applying, setApplying] = useState(false);
  const { toast } = useSession();
  const navigate = useNavigate();

  if (!data) return <div className="page"><Status loading={loading} error={error} onRetry={reload} /></div>;

  const withdraw = async () => {
    try {
      await api(`/listings/${data.id}/apply`, { method: "DELETE" });
      toast("Application withdrawn");
      await reload();
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "Couldn't withdraw that.");
    }
  };

  return (
    <div className="page detail-layout">
      <div className="detail-main">
        <section className="panel detail-head">
          <h1>{data.title}</h1>
          <div className="detail-sub">
            <Link className="plain-link" to={`/teams/${data.teamId}`}>{data.teamName}</Link>
            <span className="pill">Posted {data.postedDaysAgo === 1 ? "1 day" : `${data.postedDaysAgo} days`} ago</span>
            {(data.match ?? 0) > 0 && <span className="pill pill-purple">{data.match}% skill match</span>}
          </div>
        </section>
        <section className="panel detail-section">
          <h2>Key Skills</h2>
          <div className="skills">{data.skills.map((skill) => <span className="skill skill-light" key={skill}>{skill}</span>)}</div>
        </section>
        <Section title="Role Description" paragraphs={data.description} />
        <Section title="Experience / Requirements" items={data.requirements} />
        <Section title="What Makes You a Great Fit" items={data.greatFit} />
        <Section title="What We Offer" items={data.offers} />
        <Section title="What We Expect" items={data.expectations} />
        <Section title="Why It Matters" items={data.whyItMatters} />
        <section className="panel detail-section">
          <h2>Similar challenges</h2>
          <div className="job-grid job-grid-fill">{data.similar.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>
        </section>
      </div>
      <aside className="panel detail-side">
        <img src={teamLogo(data.teamId)} alt="" width={64} height={64} />
        <h2>{data.teamName}</h2>
        <Link className="plain-link strong" to={`/teams/${data.teamId}`}>Visit team page</Link>
        {data.applied ? (
          <>
            <span className="tag tag-green">Applied</span>
            <button className="button" onClick={withdraw}>Withdraw application</button>
          </>
        ) : (
          <button className="button button-green" onClick={() => setApplying(true)}>Apply for this position</button>
        )}
        <dl>
          <dt>Job Type</dt><dd>{data.jobType}</dd>
          <dt>Location</dt><dd>{data.mode}</dd>
          <dt>Pay</dt><dd>${data.payMin}-{data.payMax}/hr</dd>
          <dt>Game</dt><dd>{data.gameName}</dd>
          <dt>Commitment</dt><dd>{data.hours}, {data.schedule.toLowerCase()}</dd>
        </dl>
      </aside>
      {applying && (
        <ApplyDialog
          listing={data}
          onClose={() => setApplying(false)}
          onApplied={(recruiterId) => {
            setApplying(false);
            toast("Application sent. The recruiter wrote to you.");
            navigate(`/inbox/${recruiterId}`);
          }}
        />
      )}
    </div>
  );
}
