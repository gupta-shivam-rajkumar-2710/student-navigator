"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not sign in.");
      router.push("/admin/placements");
    } catch (error) { setMessage(error.message || "Could not sign in."); }
    finally { setBusy(false); }
  }

  return <main className="login-page"><a className="brand" href="/"><span className="brand-mark">◉</span><span>student<span className="brand-light">navigator</span></span></a><section className="login-card"><span className="eyebrow accent">OWNER ACCESS</span><h1>Welcome back.</h1><p>Sign in to manage college information and placement reports.</p><form onSubmit={submit}><label htmlFor="email">Admin email</label><input id="email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@yourdomain.com" required/><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required/><button className="button-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in to dashboard →"}</button></form>{message && <p className="login-message">{message}</p>}<a className="login-back" href="/">← Back to Student Navigator</a></section><small className="login-caption">Protected owner access · Student Navigator</small></main>;
}
