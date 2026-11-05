import { AtSign, BriefcaseBusiness, CalendarDays, Clock, Eye, Gamepad2, ImagePlus, Link2, MapPin, Settings as Cog, Trash2, Trophy, UserRound, Users, Video } from "lucide-react";
import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { NavLink, Navigate, useParams } from "react-router-dom";
import { api, resizeImage, useApi } from "../lib/api";
import { passwordProof } from "../lib/password";
import { useSession, useUser } from "../lib/session";
import { LIMITS, LINKED_ACCOUNTS, SKILLS, THUMBNAILS, type Award, type Highlight, type User, type WorkItem } from "../shared/types";
import { CreditLine, ErrorNote, Field, Meta, Modal, Status } from "../ui/common";

interface Sections {
  work: WorkItem[];
  awards: Award[];
  highlights: Highlight[];
  linked: { accountKey: string; handle: string }[];
}

const MENU = [
  ["profile", "Profile", UserRound],
  ["work", "Work History", BriefcaseBusiness],
  ["awards", "Awards", Trophy],
  ["highlights", "Highlights", Video],
  ["linked", "Linked Accounts", Link2],
  ["account", "Settings", Cog],
] as const;

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="panel settings-panel">
      <div className="section-row settings-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ImageDrop({ label, current, width, height, onPick, className }: { label: string; current: string | null; width: number; height: number; onPick: (value: string | null) => void; className: string }) {
  const input = useRef<HTMLInputElement>(null);
  const { toast } = useSession();
  const pick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const value = await resizeImage(file, width, height);
      if (value.length > LIMITS.imageChars) toast("That image is too detailed. Try another one.");
      else onPick(value);
    } catch {
      toast("That file couldn't be read as an image.");
    }
  };
  return (
    <div className={`image-drop ${className}`}>
      {current ? (
        <>
          <img src={current} alt={`Current ${label.toLowerCase()}`} />
          <div className="image-actions">
            <button className="button" onClick={() => input.current?.click()}>Replace</button>
            <button className="icon-button" aria-label={`Remove ${label.toLowerCase()}`} onClick={() => onPick(null)}><Trash2 size={15} /></button>
          </div>
        </>
      ) : (
        <button className="image-empty" onClick={() => input.current?.click()}>
          <ImagePlus size={20} aria-hidden="true" /> Choose an image
        </button>
      )}
      <input ref={input} type="file" hidden accept="image/png,image/jpeg,image/webp" aria-label={`Upload ${label.toLowerCase()}`} onChange={pick} />
    </div>
  );
}

function ProfileSection() {
  const user = useUser();
  const { setUser, toast } = useSession();
  const [form, setForm] = useState({ name: user.name, handle: user.handle, about: user.about, country: user.country });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [skills, setSkills] = useState(user.skills);

  const patch = async (changes: Partial<User>) => {
    const updated = await api<User>("/me", { method: "PATCH", body: changes });
    setUser(updated);
    return updated;
  };
  const saveImage = (key: "avatar" | "background") => async (value: string | null) => {
    try {
      await patch({ [key]: value });
      toast("Saved");
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "Couldn't save the image.");
    }
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await patch(form);
      toast("Profile saved");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Couldn't save your profile.");
    } finally {
      setBusy(false);
    }
  };
  const set = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: event.target.value });

  return (
    <Panel title="My Profile">
      <div className="image-row">
        <div>
          <h3>Avatar</h3>
          <ImageDrop label="Avatar" className="image-avatar" current={user.avatar} width={320} height={320} onPick={saveImage("avatar")} />
        </div>
        <div className="grow">
          <h3>Background</h3>
          <ImageDrop label="Background" className="image-background" current={user.background} width={800} height={320} onPick={saveImage("background")} />
        </div>
      </div>

      <div className="section-row"><h3>Skills</h3><button className="button" onClick={() => setEditingSkills(true)}>Edit</button></div>
      <div className="skills skills-box" aria-label="Your skills">
        {user.skills.length === 0 && <p className="muted small">Add skills to get better job matches.</p>}
        {user.skills.map((skill, index) => <span key={skill} className={`skill ${index < 4 ? "skill-purple" : "skill-light"}`}>{skill}</span>)}
      </div>

      <h3>Personal Info</h3>
      <form className="form-stack" onSubmit={submit}>
        {!user.isGuest && <Field label="Email"><input value={user.email} disabled /></Field>}
        <div className="form-row">
          <Field label="Display Name"><input required maxLength={LIMITS.name} value={form.name} onChange={set("name")} /></Field>
          <Field label="URL"><input maxLength={LIMITS.handle} value={form.handle} onChange={set("handle")} /></Field>
        </div>
        <Field label="About you"><textarea rows={4} maxLength={LIMITS.about} value={form.about} onChange={set("about")} /></Field>
        <Field label="Country of Residence"><input maxLength={LIMITS.country} value={form.country} onChange={set("country")} /></Field>
        <ErrorNote message={error} />
        <button className="button button-green align-start" type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
      </form>

      {editingSkills && (
        <Modal title="Edit skills" onClose={() => { setSkills(user.skills); setEditingSkills(false); }}>
          <p className="small">Your first four appear as your top skills. Skills decide your job matches.</p>
          <div className="skills">
            {SKILLS.map((skill) => (
              <button key={skill} className={`skill ${skills.includes(skill) ? "skill-purple" : "skill-off"}`} aria-pressed={skills.includes(skill)}
                onClick={() => setSkills(skills.includes(skill) ? skills.filter((item) => item !== skill) : [...skills, skill])}>
                {skill}
              </button>
            ))}
          </div>
          <button className="button button-green modal-action" onClick={async () => {
            try {
              await patch({ skills });
              setEditingSkills(false);
              toast("Skills saved");
            } catch (failure) {
              toast(failure instanceof Error ? failure.message : "Couldn't save your skills.");
            }
          }}>Save skills</button>
        </Modal>
      )}
    </Panel>
  );
}

/** A dialog with text inputs that posts to one of the profile collections. */
function AddDialog({ title, path, fields, extra, onClose, onSaved }: {
  title: string;
  path: string;
  fields: { key: string; label: string; required?: boolean; multiline?: boolean; placeholder?: string }[];
  extra?: (values: Record<string, string>, set: (key: string, value: string) => void) => ReactNode;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(path, { method: "POST", body: values });
      onSaved();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Couldn't save that.");
      setBusy(false);
    }
  };
  return (
    <Modal title={title} onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        {fields.map((field) => (
          <Field key={field.key} label={field.label}>
            {field.multiline ? (
              <textarea rows={3} maxLength={LIMITS.description} value={values[field.key] ?? ""} onChange={(event) => set(field.key, event.target.value)} />
            ) : (
              <input required={field.required} maxLength={LIMITS.shortField} placeholder={field.placeholder} value={values[field.key] ?? ""} onChange={(event) => set(field.key, event.target.value)} />
            )}
          </Field>
        ))}
        {extra?.(values, set)}
        <ErrorNote message={error} />
        <button className="button button-green" type="submit" disabled={busy}>{busy ? "Saving…" : "Add"}</button>
      </form>
    </Modal>
  );
}

function useCollection(path: string, reload: () => Promise<void>) {
  const { toast } = useSession();
  const [adding, setAdding] = useState(false);
  return {
    adding,
    setAdding,
    saved: () => {
      setAdding(false);
      toast("Added");
      void reload();
    },
    remove: async (id: string) => {
      try {
        await api(`${path}/${id}`, { method: "DELETE" });
        await reload();
      } catch (failure) {
        toast(failure instanceof Error ? failure.message : "Couldn't remove that.");
      }
    },
  };
}

function WorkSection({ items, reload }: { items: WorkItem[]; reload: () => Promise<void> }) {
  const list = useCollection("/profile/work", reload);
  return (
    <Panel title="Work History" action={<button className="button" onClick={() => list.setAdding(true)}>+ Add New Experience</button>}>
      {items.length === 0 && <p className="muted">No experience yet. Add the teams you've played or worked for.</p>}
      <ul className="work-list">
        {items.map((item) => (
          <li key={item.id}>
            <BriefcaseBusiness size={20} aria-hidden="true" />
            <strong>{item.team}</strong>
            <span className="work-meta">
              <Meta icon={CalendarDays}>{item.period}</Meta>
              {item.location && <Meta icon={MapPin}>{item.location}</Meta>}
              {item.duration && <Meta icon={Clock}>{item.duration}</Meta>}
            </span>
            <button className="icon-button" aria-label={`Remove ${item.team}`} onClick={() => list.remove(item.id)}><Trash2 size={15} /></button>
          </li>
        ))}
      </ul>
      {list.adding && (
        <AddDialog title="Add experience" path="/profile/work" onClose={() => list.setAdding(false)} onSaved={list.saved} fields={[
          { key: "team", label: "Team", required: true },
          { key: "period", label: "Period", required: true, placeholder: "2023 - Present" },
          { key: "location", label: "Location" },
          { key: "duration", label: "Duration", placeholder: "2 Years" },
        ]} />
      )}
    </Panel>
  );
}

function AwardsSection({ items, reload }: { items: Award[]; reload: () => Promise<void> }) {
  const list = useCollection("/profile/awards", reload);
  return (
    <Panel title="Awards" action={<button className="button" onClick={() => list.setAdding(true)}>+ Add New Award</button>}>
      {items.length === 0 && <p className="muted">No awards yet. Add your best results.</p>}
      <div className="award-grid">
        {items.map((award) => (
          <article className="award" key={award.id}>
            <div className="award-head">
              <span className={`medal medal-${award.medal}`}><Trophy size={18} aria-hidden="true" /></span>
              <h3>{award.title}</h3>
              <button className="icon-button" aria-label={`Remove ${award.title}`} onClick={() => list.remove(award.id)}><Trash2 size={14} /></button>
            </div>
            <div className="award-meta">
              {award.game && <Meta icon={Gamepad2}>{award.game}</Meta>}
              {award.scope && <Meta icon={MapPin}>{award.scope}</Meta>}
              {award.participants && <Meta icon={Users}>{award.participants}</Meta>}
            </div>
            <p className="small muted">{award.description}</p>
          </article>
        ))}
      </div>
      {list.adding && (
        <AddDialog title="Add award" path="/profile/awards" onClose={() => list.setAdding(false)} onSaved={list.saved}
          fields={[
            { key: "title", label: "Title", required: true },
            { key: "game", label: "Game" },
            { key: "scope", label: "Scope", placeholder: "Regional" },
            { key: "participants", label: "Participants", placeholder: "+800 Participants" },
            { key: "description", label: "Description", multiline: true },
          ]}
          extra={(values, set) => (
            <Field label="Medal">
              <select value={values.medal ?? "gold"} onChange={(event) => set("medal", event.target.value)}>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="bronze">Bronze</option>
              </select>
            </Field>
          )}
        />
      )}
    </Panel>
  );
}

function HighlightsSection({ items, reload }: { items: Highlight[]; reload: () => Promise<void> }) {
  const list = useCollection("/profile/highlights", reload);
  return (
    <Panel title="Highlights" action={<button className="button" onClick={() => list.setAdding(true)}>+ Add New Highlight</button>}>
      {items.length === 0 && <p className="muted">No highlights yet. Add your best plays.</p>}
      <div className="highlight-grid">
        {items.map((item) => (
          <article className="highlight" key={item.id}>
            <img src={`/images/highlights/${item.thumbnail}.webp`} alt="" width={640} height={360} loading="lazy" />
            <button className="icon-button highlight-remove" aria-label={`Remove ${item.title}`} onClick={() => list.remove(item.id)}><Trash2 size={14} /></button>
            <div className="highlight-body">
              <h3>{item.title}</h3>
              <div className="award-meta">
                {item.duration && <Meta icon={Clock}>{item.duration}</Meta>}
                {item.playedOn && <Meta icon={CalendarDays}>{item.playedOn}</Meta>}
                {item.views && <Meta icon={Eye}>{item.views}</Meta>}
              </div>
            </div>
          </article>
        ))}
      </div>
      {list.adding && (
        <AddDialog title="Add highlight" path="/profile/highlights" onClose={() => list.setAdding(false)} onSaved={list.saved}
          fields={[
            { key: "title", label: "Title", required: true },
            { key: "duration", label: "Duration", placeholder: "12:30 minutes" },
            { key: "playedOn", label: "Date", placeholder: "July 19, 2025" },
            { key: "views", label: "Views", placeholder: "12K views" },
          ]}
          extra={(values, set) => (
            <Field label="Thumbnail">
              <select value={values.thumbnail ?? THUMBNAILS[0]} onChange={(event) => set("thumbnail", event.target.value)}>
                {THUMBNAILS.map((name) => <option key={name} value={name}>{name[0].toUpperCase() + name.slice(1)}</option>)}
              </select>
            </Field>
          )}
        />
      )}
    </Panel>
  );
}

function LinkedSection({ items, reload }: { items: Sections["linked"]; reload: () => Promise<void> }) {
  const { toast } = useSession();
  const [connecting, setConnecting] = useState<(typeof LINKED_ACCOUNTS)[number] | null>(null);
  const [handle, setHandle] = useState("");
  const groups = [["Personal Accounts", "personal", AtSign], ["Gaming Accounts", "gaming", Gamepad2]] as const;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!connecting) return;
    try {
      await api(`/profile/linked/${connecting.key}`, { method: "PUT", body: { handle } });
      setConnecting(null);
      setHandle("");
      await reload();
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "Couldn't link that account.");
    }
  };
  const unlink = async (key: string) => {
    try {
      await api(`/profile/linked/${key}`, { method: "DELETE" });
      await reload();
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "Couldn't unlink that account.");
    }
  };

  return (
    <Panel title="Linked Accounts">
      {groups.map(([title, group, Icon]) => (
        <div key={group}>
          <h3>{title}</h3>
          <ul className="linked-list">
            {LINKED_ACCOUNTS.filter((account) => account.group === group).map((account) => {
              const linked = items.find((item) => item.accountKey === account.key);
              return (
                <li key={account.key}>
                  <Icon size={20} aria-hidden="true" />
                  <strong>{account.label}</strong>
                  {linked && <span className="muted small">{linked.handle}</span>}
                  {linked ? (
                    <button className="button" aria-label={`Unlink ${account.label}`} onClick={() => unlink(account.key)}>Linked</button>
                  ) : (
                    <button className="button" onClick={() => setConnecting(account)}>Connect to {account.label}</button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {connecting && (
        <Modal title={`Connect to ${connecting.label}`} onClose={() => setConnecting(null)}>
          <form className="form-stack" onSubmit={save}>
            <Field label="Username" hint="Shown on your profile. Nothing is verified with the other service.">
              <input required autoFocus maxLength={LIMITS.shortField} value={handle} onChange={(event) => setHandle(event.target.value)} />
            </Field>
            <button className="button button-green" type="submit">Connect</button>
          </form>
        </Modal>
      )}
    </Panel>
  );
}

function AccountSection() {
  const user = useUser();
  const { toast } = useSession();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const logOut = async () => {
    try {
      await api("/auth/logout", { method: "POST", body: {} });
      // A full reload stops every request the signed-in screens would still make.
      window.location.assign("/");
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "Couldn't log out.");
    }
  };
  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (next.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    try {
      await api("/me/password", {
        method: "POST",
        body: { current: await passwordProof(user.email, current), next: await passwordProof(user.email, next) },
      });
      setCurrent("");
      setNext("");
      toast("Password changed");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Couldn't change your password.");
    }
  };
  const deleteAccount = async () => {
    try {
      await api("/me", { method: "DELETE" });
      window.location.assign("/");
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "Couldn't delete your account.");
    }
  };

  return (
    <Panel title="Settings">
      {user.isGuest && <p className="note">You're using a guest account. It's deleted automatically 7 days after you started.</p>}
      {!user.isGuest && (
        <form className="form-stack" onSubmit={changePassword}>
          <h3>Change password</h3>
          <Field label="Current password"><input required type="password" autoComplete="current-password" value={current} onChange={(event) => setCurrent(event.target.value)} /></Field>
          <Field label="New password"><input required type="password" autoComplete="new-password" value={next} onChange={(event) => setNext(event.target.value)} /></Field>
          <ErrorNote message={error} />
          <button className="button button-green align-start" type="submit">Change password</button>
        </form>
      )}
      <div className="account-actions">
        <button className="button" onClick={logOut}>Log out</button>
        <button className="button button-danger" onClick={() => setConfirming(true)}>Delete account</button>
      </div>
      <CreditLine />
      {confirming && (
        <Modal title="Delete your account?" onClose={() => setConfirming(false)}>
          <p>This removes your profile, applications, posts and messages. It can't be undone.</p>
          <div className="account-actions modal-action">
            <button className="button" onClick={() => setConfirming(false)}>Keep my account</button>
            <button className="button button-danger" onClick={deleteAccount}>Delete account</button>
          </div>
        </Modal>
      )}
    </Panel>
  );
}

export function Settings() {
  const { section } = useParams();
  const { data, error, loading, reload } = useApi<Sections>("/profile/sections");
  if (!MENU.some(([key]) => key === section)) return <Navigate to="/settings/profile" replace />;

  const needsData = section === "work" || section === "awards" || section === "highlights" || section === "linked";
  return (
    <div className="page settings">
      <nav className="panel settings-menu" aria-label="Settings">
        <h1>Settings</h1>
        {MENU.map(([key, label, Icon]) => (
          <NavLink key={key} to={`/settings/${key}`}><Icon size={16} aria-hidden="true" /> {label}</NavLink>
        ))}
      </nav>
      <div className="settings-content">
        {needsData && !data && <Status loading={loading} error={error} onRetry={reload} />}
        {section === "profile" && <ProfileSection />}
        {section === "account" && <AccountSection />}
        {data && section === "work" && <WorkSection items={data.work} reload={reload} />}
        {data && section === "awards" && <AwardsSection items={data.awards} reload={reload} />}
        {data && section === "highlights" && <HighlightsSection items={data.highlights} reload={reload} />}
        {data && section === "linked" && <LinkedSection items={data.linked} reload={reload} />}
      </div>
    </div>
  );
}
