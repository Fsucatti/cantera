import { Link } from "react-router-dom";
import { useApi } from "../lib/api";
import type { Person } from "../shared/types";
import { Status, personPhoto } from "../ui/common";

export function People() {
  const { data, error, loading, reload } = useApi<Person[]>("/people");
  return (
    <div className="page">
      <h1 className="page-title">People</h1>
      <p className="muted page-note">These characters are fictional and their replies are written by AI. Their photos are stock images of people unrelated to this project.</p>
      <Status loading={loading} error={error} onRetry={reload} />
      <div className="people-grid">
        {data?.map((person) => (
          <article className="person-card" key={person.id}>
            <img className="avatar" src={personPhoto(person.id)} alt="" width={72} height={72} />
            <h2>{person.name}</h2>
            <p className="muted small">{person.role}</p>
            <p>{person.headline}</p>
            <Link className="button" to={`/inbox/${person.id}`} aria-label={`Message ${person.name}`}>Message</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
