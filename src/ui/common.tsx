import { Bookmark, CalendarDays, Clock, MapPin, Share2, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import type { Listing } from "../shared/types";

export const bannerUrl = (name: string) => `/images/banners/${name}.webp`;
export const teamLogo = (id: string) => `/images/teams/${id}.svg`;
export const gameLogo = (id: string) => `/images/games/${id}.svg`;
export const personPhoto = (id: string) => `/images/people/${id}.webp`;

export function Avatar({ src, name, size = 40 }: { src: string | null | undefined; name: string; size?: number }) {
  return src ? (
    <img className="avatar" src={src} alt="" width={size} height={size} />
  ) : (
    <span className="avatar avatar-initial" style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden="true">
      {name.trim()[0]?.toUpperCase() ?? "?"}
    </span>
  );
}

export function Status({ loading, error, onRetry }: { loading: boolean; error: string | null; onRetry?: () => void }) {
  if (error) {
    return (
      <div className="status" role="alert">
        <p>{error}</p>
        {onRetry && <button className="button" onClick={onRetry}>Try again</button>}
      </div>
    );
  }
  return loading ? <p className="status muted" role="status">Loading…</p> : null;
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog ref={dialog} className={`modal${wide ? " modal-wide" : ""}`} onClose={onClose} aria-label={title} onClick={(event) => event.target === dialog.current && onClose()}>
      <div className="modal-head">
        <h2>{title}</h2>
        <button className="icon-button" aria-label="Close" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}

export function Meta({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="meta">
      <Icon size={13} aria-hidden="true" /> {children}
    </span>
  );
}

export function ListingCard({ listing, onChange }: { listing: Listing; onChange?: () => void }) {
  const { toast } = useSession();
  const [saved, setSaved] = useState(Boolean(listing.saved));

  const toggleSave = async () => {
    const next = !saved;
    setSaved(next);
    try {
      await api(`/listings/${listing.id}/save`, { method: next ? "PUT" : "DELETE" });
      toast(next ? "Saved" : "Removed from saved");
      onChange?.();
    } catch (failure) {
      setSaved(!next);
      toast(failure instanceof Error ? failure.message : "Couldn't save that.");
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}/jobs/${listing.id}`);
      toast("Link copied");
    } catch {
      toast("Your browser blocked copying the link.");
    }
  };

  return (
    <article className="job-card">
      <div className="job-banner" style={{ backgroundImage: `url(${bannerUrl(listing.banner)})` }} />
      <img className="job-logo" src={teamLogo(listing.teamId)} alt="" width={36} height={36} />
      <div className="job-actions">
        <button aria-label={`Copy link to ${listing.title}`} onClick={share}><Share2 size={13} /></button>
        <button aria-label={saved ? `Remove ${listing.title} from saved` : `Save ${listing.title}`} aria-pressed={saved} onClick={toggleSave}>
          <Bookmark size={13} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="job-body">
        <Link className="job-link" to={`/jobs/${listing.id}`}>
          <span className="job-team">{listing.teamName}</span>
          <span className="sr-only">: {listing.title}</span>
        </Link>
        <p className="job-role">{listing.role}</p>
        <p className="job-pay">${listing.payMin}-{listing.payMax}/hr</p>
        <div className="job-meta">
          <Meta icon={CalendarDays}>{listing.hours}</Meta>
          <Meta icon={MapPin}>{listing.mode}</Meta>
          <Meta icon={Clock}>{listing.schedule}</Meta>
        </div>
        {(listing.applied || (listing.match ?? 0) >= 50) && (
          <div className="job-tags">
            {listing.applied && <span className="tag tag-green">Applied</span>}
            {!listing.applied && (listing.match ?? 0) >= 50 && <span className="tag">{listing.match}% skill match</span>}
          </div>
        )}
      </div>
    </article>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  return message ? <p className="error-note" role="alert">{message}</p> : null;
}

/** The cat from the portfolio's logo. Removing it is not recommended: the cat will find out. */
export function CatIcon() {
  return (
    <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 9V3L11 4H8L5 3V9L9.5 11L14 9ZM14 9L20 12L22 18L20 21H4L2 19L4 17L2 15L4 13M7 21V9.88889M11 15V21L16.0435 16H18M8 7L8.00707 7.00707M11 7L11.0071 7.00707" />
    </svg>
  );
}

export function CreditLine() {
  return (
    <p className="credit">
      <CatIcon />
      Design by Julian Sucatti · Built by{" "}
      <a href="https://fsucatti-portfolio.fsucatti-portfolio.workers.dev" target="_blank" rel="noreferrer">Francisco Sucatti</a>
      <br />
      Teams, games and characters are fictional. Photos of people from <a href="https://www.pexels.com" target="_blank" rel="noreferrer">Pexels</a>, unrelated to this project.
    </p>
  );
}
