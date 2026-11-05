import { ArrowRight, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { passwordProof } from "../lib/password";
import { useSession } from "../lib/session";
import type { User } from "../shared/types";
import { CreditLine, ErrorNote, Field } from "../ui/common";

export function Auth({ mode }: { mode: "login" | "signup" }) {
  const { setUser } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signingUp = mode === "signup";

  const run = async (action: () => Promise<User>) => {
    setBusy(true);
    setError(null);
    try {
      setUser(await action());
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Something went wrong.");
      setBusy(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (signingUp && password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    void run(async () => {
      const proof = await passwordProof(email, password);
      return api<User>(signingUp ? "/auth/signup" : "/auth/login", {
        method: "POST",
        body: signingUp ? { name, email, proof } : { email, proof },
      });
    });
  };

  return (
    <div className="auth">
      <main className="auth-card">
        <div className="auth-art">
          <img src="/logo.svg" alt="" width={190} height={190} />
          <p>The talent platform for esports</p>
        </div>
        <div className="auth-form">
          <h1>{signingUp ? "Sign Up" : "Log In"}</h1>
          <button className="button button-accent button-wide" disabled={busy} onClick={() => run(() => api<User>("/auth/guest", { method: "POST" }))}>
            <UserRound size={15} /> Try it as a guest
          </button>
          <p className="muted small">A sample profile, ready to explore. No email needed, and it's deleted after 7 days.</p>
          <div className="auth-divider"><span>or</span></div>
          <form onSubmit={submit}>
            {signingUp && (
              <Field label="Name">
                <input required maxLength={60} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
              </Field>
            )}
            <Field label="Email">
              <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </Field>
            <Field label="Password" hint={signingUp ? "This is a demo project, so please don't reuse a real password." : undefined}>
              <input required type="password" autoComplete={signingUp ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} />
            </Field>
            <ErrorNote message={error} />
            {signingUp && <p className="small">We only use your email to log you in, and we never send you messages.</p>}
            <button type="submit" className="button button-green button-wide" disabled={busy}>
              <ArrowRight size={15} /> {busy ? "One moment…" : signingUp ? "Sign Up" : "Log In"}
            </button>
          </form>
          <p className="small">
            {signingUp ? "Already have an account? " : "New here? "}
            <Link className="green-link" to={signingUp ? "/login" : "/signup"}>{signingUp ? "Log in" : "Create an account"}</Link>
          </p>
        </div>
      </main>
      <CreditLine />
    </div>
  );
}
