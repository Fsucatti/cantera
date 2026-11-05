import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="page empty">
      <h1 className="page-title">This page doesn't exist</h1>
      <Link className="button" to="/">Go home</Link>
    </div>
  );
}
