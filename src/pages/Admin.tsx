import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSession, login, logout, type AdminSession } from "@/lib/api";
import AdminEvents from "@/components/admin/AdminEvents";
import AdminHero from "@/components/admin/AdminHero";
import AdminEquipment from "@/components/admin/AdminEquipment";

const inputClass = "w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-foreground focus:outline-none focus:border-primary";

export default function Admin() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [tab, setTab] = useState<"events" | "hero" | "equipment">("events");

  useEffect(() => {
    let active = true;
    getSession().then((value) => { if (active) setSession(value); }).catch(() => { if (active) setAuthError("Admin server unavailable. Check the site setup and try again."); }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setAuthError("");
    setSigningIn(true);
    try { setSession(await login(email, password)); setPassword(""); }
    catch (cause) { setAuthError(cause instanceof Error ? cause.message : "Sign in failed."); }
    finally { setSigningIn(false); }
  }

  async function signOut() {
    try { await logout(); setSession(null); }
    catch (cause) { setAuthError(cause instanceof Error ? cause.message : "Could not sign out."); }
  }

  if (checking) return <main className="flex min-h-screen items-center justify-center text-muted-foreground">Checking admin access…</main>;

  if (!session) return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link to="/" className="mb-10 text-sm text-secondary">← Back to website</Link>
      <h1 className="mb-3 font-display text-4xl font-bold">VenueBox Admin</h1>
      <p className="mb-8 text-muted-foreground">Sign in to manage events, hero slides, and equipment.</p>
      <form onSubmit={(event) => void signIn(event)} className="space-y-5 rounded-2xl border border-border bg-card p-7">
        <label className="block space-y-2 text-sm">Email<input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} /></label>
        <label className="block space-y-2 text-sm">Password<input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} /></label>
        <button type="submit" disabled={signingIn} className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50">{signingIn ? "Signing in…" : "Sign in"}</button>
        {authError && <p role="alert" className="text-sm text-destructive">{authError}</p>}
      </form>
    </main>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-5"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4"><div><h1 className="font-display text-2xl font-bold">VenueBox Admin</h1><p className="text-xs text-muted-foreground">Signed in as {session.email}</p></div><div className="flex items-center gap-5 text-sm"><Link to="/" className="text-secondary">View website</Link><button type="button" onClick={() => void signOut()} className="text-muted-foreground hover:text-foreground">Sign out</button></div></div></header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <nav aria-label="Admin sections" className="mb-8 flex flex-wrap gap-2">
          {(["events", "hero", "equipment"] as const).map((name) => <button key={name} type="button" onClick={() => setTab(name)} aria-current={tab === name ? "page" : undefined} className={`rounded-full px-6 py-3 text-sm font-semibold capitalize ${tab === name ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>{name}</button>)}
        </nav>
        {tab === "events" && <AdminEvents />}
        {tab === "hero" && <AdminHero />}
        {tab === "equipment" && <AdminEquipment />}
      </main>
    </div>
  );
}
