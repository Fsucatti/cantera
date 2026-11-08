import { Bell, BriefcaseBusiness, Building2, Home, MessageSquare, Search, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { timeAgo, useApi } from "../lib/api";
import { useUser } from "../lib/session";
import type { Notification, SearchResults } from "../shared/types";
import { Avatar, Modal, bannerUrl, personPhoto, teamLogo } from "./common";

const MAIN_LINKS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { to: "/teams", label: "Teams", icon: Building2 },
  { to: "/people", label: "People", icon: Users },
];

function SearchDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const navigate = useNavigate();
  const { data, error } = useApi<SearchResults>(`/search?q=${encodeURIComponent(applied)}`);

  useEffect(() => {
    const timer = setTimeout(() => setApplied(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  const go = (to: string) => {
    navigate(to);
    onClose();
  };
  const empty = data && !data.games.length && !data.listings.length && !data.people.length && !data.teams.length;

  return (
    <Modal title="Search" onClose={onClose} wide>
      <label className="search-box">
        <input autoFocus placeholder="Search team, tag, player" aria-label="Search team, tag or player" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Search size={15} aria-hidden="true" />
      </label>
      {error && <p className="error-note" role="alert">{error}</p>}
      {empty && <p className="muted search-empty">Nothing matches "{applied}". Try a game or a team name.</p>}
      {data && data.games.length > 0 && (
        <section className="search-group">
          <div className="section-row"><h3>Top Games</h3><button className="link" onClick={() => go("/jobs?category=game")}>View all games</button></div>
          {data.games.slice(0, 3).map((game) => (
            <button key={game.id} className="search-row" onClick={() => go(`/games/${game.id}`)}>
              <span className="search-thumb" style={{ backgroundImage: `url(${bannerUrl(game.banner)})` }} />
              {game.name}<span className="muted"> · {game.genre}</span>
            </button>
          ))}
        </section>
      )}
      {data && data.listings.length > 0 && (
        <section className="search-group">
          <div className="section-row"><h3>Trending Jobs</h3><button className="link" onClick={() => go("/jobs")}>View all jobs</button></div>
          {data.listings.slice(0, 3).map((listing) => (
            <button key={listing.id} className="search-row" onClick={() => go(`/jobs/${listing.id}`)}>
              <img src={teamLogo(listing.teamId)} alt="" width={22} height={22} />
              {listing.title}
            </button>
          ))}
        </section>
      )}
      {data && data.teams.length > 0 && (
        <section className="search-group">
          <div className="section-row"><h3>Teams</h3><button className="link" onClick={() => go("/teams")}>View all teams</button></div>
          {data.teams.slice(0, 3).map((team) => (
            <button key={team.id} className="search-row" onClick={() => go(`/teams/${team.id}`)}>
              <img src={teamLogo(team.id)} alt="" width={22} height={22} />
              {team.name}, {team.location}
            </button>
          ))}
        </section>
      )}
      {data && data.people.length > 0 && (
        <section className="search-group">
          <div className="section-row"><h3>People</h3><button className="link" onClick={() => go("/people")}>View all people</button></div>
          {data.people.slice(0, 3).map((person) => (
            <button key={person.id} className="search-row" onClick={() => go(`/inbox/${person.id}`)}>
              <img className="avatar" src={personPhoto(person.id)} alt="" width={22} height={22} />
              {person.name}: {person.headline}
            </button>
          ))}
        </section>
      )}
    </Modal>
  );
}

function Notifications() {
  const location = useLocation();
  const { data, reload } = useApi<{ items: Notification[]; unread: number }>("/notifications");
  const [open, setOpen] = useState(false);
  const area = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    void reload();
  }, [location.pathname, reload]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!area.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="notifications" ref={area}>
      <button className="nav-item" aria-label={`Notifications${data?.unread ? `, ${data.unread} new` : ""}`} aria-expanded={open} onClick={() => setOpen(!open)}>
        <Bell size={18} aria-hidden="true" />
        {Boolean(data?.unread) && <span className="nav-dot" />}
      </button>
      {open && (
        <div className="popover">
          <h2>Notifications</h2>
          {data?.items.length ? (
            data.items.map((item) => (
              <button key={item.id} onClick={() => { setOpen(false); navigate(item.to); }}>
                {item.text}
                <span className="muted">{timeAgo(item.createdAt)}</span>
              </button>
            ))
          ) : (
            <p className="muted">You're all caught up.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function Shell() {
  const user = useUser();
  const [searching, setSearching] = useState(false);
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    main.current?.scrollTo?.(0, 0);
    window.scrollTo?.(0, 0);
  }, [pathname]);

  return (
    <div className="shell">
      <nav className="nav" aria-label="Main">
        <Link className="nav-logo" to="/" aria-label="Cantera home">
          <img src="/logo.svg" alt="" width={30} height={30} />
          <span className="nav-wordmark">Cantera</span>
        </Link>
        {/* On phones this group becomes the tab bar at the bottom of the screen, with labels and the inbox. */}
        <div className="nav-group nav-tabs">
          {MAIN_LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-item" aria-label={label} title={label}>
              <span className="nav-icon"><Icon size={18} aria-hidden="true" /></span>
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
          <NavLink to="/inbox" className="nav-item only-phone" aria-label="Inbox" title="Inbox">
            <span className="nav-icon"><MessageSquare size={18} aria-hidden="true" /></span>
            <span className="nav-label">Inbox</span>
          </NavLink>
        </div>
        <div className="nav-group nav-bottom">
          <button className="nav-item" aria-label="Search" title="Search" onClick={() => setSearching(true)}><Search size={18} aria-hidden="true" /></button>
          <NavLink to="/inbox" className="nav-item only-desktop" aria-label="Inbox" title="Inbox"><MessageSquare size={18} aria-hidden="true" /></NavLink>
          <Notifications />
          <NavLink to="/settings/profile" className="nav-avatar" aria-label="Your profile and settings" title="Profile"><Avatar src={user.avatar} name={user.name} size={36} /></NavLink>
        </div>
      </nav>
      <main className="content" ref={main}>
        <Outlet />
      </main>
      {searching && <SearchDialog onClose={() => setSearching(false)} />}
    </div>
  );
}
