"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  async function submit(event) {
    event.preventDefault();
    if (!configured) {
      setMessage("Connect your Supabase project using the environment variables in .env.local before signing in.");
      return;
    }
    setMessage("Supabase credentials are configured. Complete the Auth and admin role setup in the README to enable owner sign-in.");
  }

  return <main className="login-page"><a className="brand" href="/"><span className="brand-mark">◉</span><span>student<span className="brand-light">navigator</span></span></a><section className="login-card"><span className="eyebrow accent">OWNER ACCESS</span><h1>Welcome back.</h1><p>Sign in to manage college information and placement reports.</p><form onSubmit={submit}><label htmlFor="email">Admin email</label><input id="email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@yourdomain.com" required/><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" required/><button className="button-primary" type="submit">Sign in to dashboard →</button></form>{message && <p className="login-message">{message}</p>}<a className="login-back" href="/">← Back to Student Navigator</a></section><small className="login-caption">Protected owner access · Student Navigator</small></main>;
}
