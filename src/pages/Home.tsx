import { Bookmark, CirclePlus, Share2, Trash2, Trophy } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, timeAgo, useApi } from "../lib/api";
import { useSession, useUser } from "../lib/session";
import type { FeedPost, HomeData, Team } from "../shared/types";
import { Avatar, CreditLine, ListingCard, Status, teamLogo } from "../ui/common";

/** Paragraphs and "- " lists from plain text. Rendered as text, so user content can't inject HTML. */
function PostBody({ text }: { text: string }) {
  return (
    <div className="post-body">
      {text.split("\n\n").map((block, index) => {
        const lines = block.split("\n");
        return lines.every((line) => line.startsWith("- ")) ? (
          <ul key={index}>{lines.map((line) => <li key={line}>{line.slice(2)}</li>)}</ul>
        ) : (
          <p key={index}>{block}</p>
        );
      })}
    </div>
  );
}

function Composer({ placeholder, label, onSend }: { placeholder: string; label: string; onSend: (text: string) => Promise<void> }) {
  const user = useUser();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast } = useSession();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      await onSend(text);
      setText("");
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "Couldn't send that.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="composer" onSubmit={submit}>
      <Avatar src={user.avatar} name={user.name} size={22} />
      <input placeholder={placeholder} aria-label={label} maxLength={2000} value={text} onChange={(event) => setText(event.target.value)} />
      <button className="button button-green button-small" type="submit" disabled={!text.trim() || busy}>
        <CirclePlus size={14} /> {busy ? "Posting…" : "Post"}
      </button>
    </form>
  );
}

function Post({ post, reload }: { post: FeedPost; reload: () => Promise<void> }) {
  const { toast } = useSession();
  const act = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await reload();
    } catch (failure) {
      toast(failure instanceof Error ? failure.message : "That didn't work.");
    }
  };
  const toggle = (kind: "trophy" | "bookmark") =>
    act(() => api(`/posts/${post.id}/reactions/${kind}`, { method: post.reactions.includes(kind) ? "DELETE" : "PUT" }));
  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${post.title ?? post.author.name}\n\n${post.body}`);
      toast("Post copied");
    } catch {
      toast("Your browser blocked copying the post.");
    }
  };

  return (
    <article className="post">
      <header className="post-head">
        <Avatar src={post.author.avatar} name={post.author.name} size={54} />
        <div>
          <h3>{post.author.name}</h3>
          <p className="muted small">{post.author.headline}</p>
        </div>
      </header>
      {post.title && <h4 className="post-title">{post.title}</h4>}
      <PostBody text={post.body} />
      <div className="post-actions">
        {post.mine && (
          <button aria-label="Delete post" onClick={() => act(() => api(`/posts/${post.id}`, { method: "DELETE" }))}><Trash2 size={14} /></button>
        )}
        <button aria-label="Give a trophy" aria-pressed={post.reactions.includes("trophy")} onClick={() => toggle("trophy")}>
          <Trophy size={14} fill={post.reactions.includes("trophy") ? "currentColor" : "none"} />
        </button>
        <button aria-label="Bookmark post" aria-pressed={post.reactions.includes("bookmark")} onClick={() => toggle("bookmark")}>
          <Bookmark size={14} fill={post.reactions.includes("bookmark") ? "currentColor" : "none"} />
        </button>
        <button aria-label="Copy post" onClick={share}><Share2 size={14} /></button>
      </div>
      {post.replies.map((reply) => (
        <div className="reply" key={reply.id}>
          <Avatar src={reply.author.avatar} name={reply.author.name} size={26} />
          <div>
            <p className="reply-author">{reply.author.name} <span className="muted">· {timeAgo(reply.createdAt)}</span></p>
            <p>{reply.body}</p>
          </div>
        </div>
      ))}
      <Composer
        placeholder="Reply something cool..."
        label={`Reply to ${post.author.name}`}
        onSend={async (body) => {
          await api(`/posts/${post.id}/replies`, { method: "POST", body: { body } });
          await reload();
        }}
      />
    </article>
  );
}

export function FollowButton({ team, onChange }: { team: Team; onChange?: () => void }) {
  const { toast } = useSession();
  const [following, setFollowing] = useState(Boolean(team.following));
  const toggle = async () => {
    const next = !following;
    setFollowing(next);
    try {
      await api(`/teams/${team.id}/follow`, { method: next ? "PUT" : "DELETE" });
      onChange?.();
    } catch (failure) {
      setFollowing(!next);
      toast(failure instanceof Error ? failure.message : "That didn't work.");
    }
  };
  return (
    <button className="button" aria-pressed={following} aria-label={`${following ? "Unfollow" : "Follow"} ${team.name}`} onClick={toggle}>
      {following ? "Following" : "Follow"}
    </button>
  );
}

export function Home() {
  const user = useUser();
  const home = useApi<HomeData>("/home");
  const feed = useApi<FeedPost[]>("/feed");
  const { toast } = useSession();

  return (
    <div className="page">
      <h1 className="greeting">Hi Again, {user.name.split(" ")[0]}!</h1>
      <h2 className="subheading">Your Newest matches</h2>
      <Status loading={home.loading} error={home.error} onRetry={home.reload} />
      {home.data && (
        <div className="job-grid job-grid-fill">
          {home.data.matches.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
      )}

      <div className="home-columns">
        <section className="panel" aria-label="Community feed">
          <div className="section-row">
            <h2>Level up your career with help from fellow gamers</h2>
            <a className="link" href="#feed">View all posts</a>
          </div>
          <Composer
            placeholder="Ask pro players how to break into the scene"
            label="Write a post"
            onSend={async (body) => {
              await api("/posts", { method: "POST", body: { body } });
              await feed.reload();
              toast("Posted. Only you can see your posts in this demo.");
            }}
          />
          <div className="post-list" id="feed">
            <Status loading={feed.loading} error={feed.error} onRetry={feed.reload} />
            {feed.data?.map((post) => <Post key={post.id} post={post} reload={feed.reload} />)}
          </div>
        </section>

        <aside className="home-side">
          <section className="panel">
            <div className="section-row">
              <h2>I've applied to</h2>
              <Link className="link" to="/jobs?applied=1">Review all</Link>
            </div>
            {home.data?.applied.length === 0 && <p className="muted small">Your applications will appear here.</p>}
            {home.data?.applied.map((listing) => (
              <div className="side-card" key={listing.id}>
                <div className="side-card-top">
                  <img src={teamLogo(listing.teamId)} alt="" width={46} height={46} />
                  <div>
                    <strong>{listing.teamName}</strong>
                    <p>{listing.title}</p>
                  </div>
                </div>
                <Link className="button" to={`/jobs/${listing.id}`} aria-label={`Review ${listing.title}`}>Review</Link>
              </div>
            ))}
          </section>
          <section className="panel">
            <div className="section-row">
              <h2>Add to your feed</h2>
              <Link className="link" to="/teams">Review all</Link>
            </div>
            {home.data?.suggestedTeams.map((team) => (
              <div className="side-card" key={team.id}>
                <div className="side-card-top">
                  <img src={teamLogo(team.id)} alt="" width={46} height={46} />
                  <div>
                    <Link className="plain-link" to={`/teams/${team.id}`}><strong>{team.name}</strong></Link>
                    <p>{team.focusAreas.slice(0, 3).join(", ")}</p>
                  </div>
                </div>
                <FollowButton team={team} />
              </div>
            ))}
          </section>
          <CreditLine />
        </aside>
      </div>
    </div>
  );
}
