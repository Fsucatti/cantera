import { ArrowLeft, CirclePlus } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, useApi } from "../lib/api";
import { useSession, useUser } from "../lib/session";
import type { Conversation, Message, Person } from "../shared/types";
import { Avatar, Modal, Status, personPhoto } from "../ui/common";

const clock = (timestamp: number) => new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function Thread({ personId, onSent }: { personId: string; onSent: () => void }) {
  const user = useUser();
  const { toast } = useSession();
  const { data, error, loading, reload } = useApi<{ person: Person; messages: Message[] }>(`/conversations/${personId}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [waiting, setWaiting] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data) {
      setMessages(data.messages);
      onSent();
    }
    // Refreshing the list after reading only needs to happen when a thread loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    end.current?.scrollIntoView?.({ block: "nearest" });
  }, [messages, waiting]);

  if (!data) return <Status loading={loading} error={error} onRetry={reload} />;
  const { person } = data;

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const body = text.trim();
    if (!body || waiting) return;
    setText("");
    setWaiting(true);
    const optimistic: Message = { id: `pending-${Date.now()}`, fromUser: true, body, createdAt: Date.now() };
    setMessages((current) => [...current, optimistic]);
    try {
      setMessages(await api<Message[]>(`/conversations/${personId}`, { method: "POST", body: { body } }));
      onSent();
    } catch (failure) {
      setMessages((current) => current.filter((message) => message !== optimistic));
      setText(body);
      toast(failure instanceof Error ? failure.message : "Couldn't send that.");
    } finally {
      setWaiting(false);
    }
  };

  return (
    <>
      <section className="panel inbox-person">
        <Link className="icon-button inbox-back" to="/inbox" aria-label="Back to conversations"><ArrowLeft size={18} /></Link>
        <img className="avatar" src={personPhoto(person.id)} alt="" width={52} height={52} />
        <div>
          <h2>{person.name}</h2>
          <p className="small">{person.role}. {person.bio}</p>
          <p className="muted small">Fictional character. Replies are written by AI.</p>
        </div>
      </section>
      <section className="panel thread" aria-label={`Conversation with ${person.name}`}>
        <div className="thread-messages">
          {messages.length === 0 && <p className="muted">Say hello to {person.name.split(" ")[0]}.</p>}
          {messages.map((message) => (
            <div className="message" key={message.id}>
              <div className="message-head">
                {message.fromUser ? <Avatar src={user.avatar} name={user.name} size={26} /> : <img className="avatar" src={personPhoto(person.id)} alt="" width={26} height={26} />}
                <strong>{message.fromUser ? user.name.split(" ")[0] : person.name.split(" ")[0]}</strong>
                <span className="muted small">· {clock(message.createdAt)}</span>
              </div>
              <p>{message.body}</p>
            </div>
          ))}
          {waiting && <p className="muted small typing" role="status">{person.name.split(" ")[0]} is typing…</p>}
          <div ref={end} />
        </div>
        <form className="composer" onSubmit={send}>
          <Avatar src={user.avatar} name={user.name} size={22} />
          <input placeholder="Reply something cool..." aria-label="Message" maxLength={800} value={text} onChange={(event) => setText(event.target.value)} />
          <button className="button button-green button-small" type="submit" disabled={!text.trim() || waiting}><CirclePlus size={14} /> Post</button>
        </form>
      </section>
    </>
  );
}

function NewConversation({ onClose }: { onClose: () => void }) {
  const { data } = useApi<Person[]>("/people");
  const navigate = useNavigate();
  return (
    <Modal title="New conversation" onClose={onClose}>
      <div className="person-list">
        {data?.map((person) => (
          <button key={person.id} onClick={() => { onClose(); navigate(`/inbox/${person.id}`); }}>
            <img className="avatar" src={personPhoto(person.id)} alt="" width={36} height={36} />
            <span><strong>{person.name}</strong><span className="muted small">{person.role}</span></span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

export function Inbox() {
  const { personId } = useParams();
  const conversations = useApi<Conversation[]>("/conversations");
  const [starting, setStarting] = useState(false);

  return (
    <div className={`page inbox${personId ? " has-thread" : ""}`}>
      <aside className="panel inbox-list">
        <h1>Inbox</h1>
        <Status loading={conversations.loading} error={conversations.error} onRetry={conversations.reload} />
        {conversations.data?.length === 0 && <p className="muted small">No conversations yet. Apply to a job, or start one.</p>}
        {conversations.data?.map(({ person, lastMessage, unread }) => (
          <Link key={person.id} className="inbox-item" aria-current={person.id === personId ? "true" : undefined} to={`/inbox/${person.id}`}>
            <span className="inbox-item-head">
              <img className="avatar" src={personPhoto(person.id)} alt="" width={26} height={26} />
              <strong>{person.name}</strong>
              {unread > 0 && <span className="unread" aria-label={`${unread} unread`}>{unread}</span>}
            </span>
            <span className="inbox-preview">{lastMessage}</span>
          </Link>
        ))}
      </aside>
      <div className="inbox-main">
        <section className="panel section-row inbox-title">
          <h2>Conversations</h2>
          <button className="button" onClick={() => setStarting(true)}>+ New Conversation</button>
        </section>
        {personId ? (
          <Thread key={personId} personId={personId} onSent={conversations.reload} />
        ) : (
          <div className="panel empty"><p>Pick a conversation, or start a new one.</p></div>
        )}
      </div>
      {starting && <NewConversation onClose={() => setStarting(false)} />}
    </div>
  );
}
