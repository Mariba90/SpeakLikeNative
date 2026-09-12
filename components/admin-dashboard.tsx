"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, DollarSign, MailPlus, Mic2, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/icons";
import type { UsageDashboard } from "@/lib/usage";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 4 });
const dateTime = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export function AdminDashboard({ dashboard, authorizedEmails, adminEmail }: {
  dashboard: UsageDashboard;
  authorizedEmails: Array<{ email: string; role: "admin" | "member"; created_at: string }>;
  adminEmail: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  async function authorize(event: FormEvent) {
    event.preventDefault();
    setError("");
    setStatus("saving");
    try {
      const response = await fetch("/api/admin/authorized-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not authorize that email.");
      setEmail("");
      setStatus("saved");
      router.refresh();
      window.setTimeout(() => setStatus("idle"), 2500);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not authorize that email.");
      setStatus("idle");
    }
  }

  const cards = [
    { label: "Estimated cost", value: money.format(dashboard.totals.cost), hint: "Last 30 days", icon: DollarSign },
    { label: "Model requests", value: dashboard.totals.requests.toLocaleString(), hint: "Transcription + coaching", icon: Sparkles },
    { label: "Audio processed", value: `${Math.round(dashboard.totals.audioSeconds / 60)} min`, hint: "Where returned by OpenAI", icon: Mic2 },
    { label: "Average latency", value: dashboard.totals.averageLatencyMs ? `${(dashboard.totals.averageLatencyMs / 1000).toFixed(1)}s` : "—", hint: "Successful model calls", icon: Clock3 },
  ];

  return <main className="min-h-screen bg-[#f7faf9] px-5 py-6 text-[var(--ink)] sm:px-8 lg:px-12">
    <div className="mx-auto max-w-6xl">
      <nav className="mb-10 flex items-center justify-between gap-4"><a href="/" className="flex items-center gap-2.5 font-bold tracking-[-.045em]"><LogoMark className="h-8 w-8 text-[var(--green)]" /><span>Speak Like a Native</span></a><a href="/" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"><ArrowLeft size={17} />Practice app</a></nav>
      <section className="mb-8 rounded-[2rem] bg-[var(--ink)] px-7 py-9 text-white sm:px-10"><p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#75e8bd]"><ShieldCheck size={17} />Administrator view</p><h1 className="text-3xl font-bold tracking-[-.055em] sm:text-4xl">Usage and access.</h1><p className="mt-3 max-w-2xl text-blue-100">Track recorded OpenAI usage and approve the people who can practice. Signed in as {adminEmail}.</p></section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(({ label, value, hint, icon: Icon }) => <article key={label} className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-sm"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--mint)] text-[var(--green)]"><Icon size={19} /></div><p className="mt-5 text-2xl font-bold tracking-[-.045em]">{value}</p><p className="mt-1 text-sm font-medium">{label}</p><p className="mt-1 text-xs text-[var(--muted)]">{hint}</p></article>)}</section>
      <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-7"><div className="mb-6"><p className="text-sm font-semibold text-[var(--green)]">Model usage</p><h2 className="mt-1 text-2xl font-bold tracking-[-.04em]">Cost by model</h2></div>{dashboard.byModel.length ? <div className="overflow-x-auto"><table className="w-full min-w-[510px] text-left text-sm"><thead className="border-b border-[var(--line)] text-xs uppercase tracking-wide text-[var(--muted)]"><tr><th className="pb-3 font-semibold">Model</th><th className="pb-3 font-semibold">Requests</th><th className="pb-3 font-semibold">Input</th><th className="pb-3 font-semibold">Output</th><th className="pb-3 text-right font-semibold">Estimate</th></tr></thead><tbody>{dashboard.byModel.map((model) => <tr key={model.model} className="border-b border-[var(--line)] last:border-0"><td className="py-4 font-semibold">{model.model}</td><td className="py-4">{model.requests}</td><td className="py-4">{model.inputTokens.toLocaleString()}</td><td className="py-4">{model.outputTokens.toLocaleString()}</td><td className="py-4 text-right font-semibold">{money.format(model.cost)}</td></tr>)}</tbody></table></div> : <p className="rounded-2xl bg-[var(--mint)] p-5 text-sm leading-6 text-[var(--green)]">No usage yet. The first completed practice session will appear here automatically.</p>}</div>
        <aside className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-7"><p className="text-sm font-semibold text-[var(--green)]">Access control</p><h2 className="mt-1 text-2xl font-bold tracking-[-.04em]">Authorize an email</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Only approved addresses can complete account sign-in and access the recording API.</p><form className="mt-5 space-y-3" onSubmit={authorize}><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="learner@example.com" className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--green)] focus:ring-4 focus:ring-emerald-100" /><select value={role} onChange={(event) => setRole(event.target.value === "admin" ? "admin" : "member")} className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--green)]"><option value="member">Member</option><option value="admin">Administrator</option></select>{error && <p className="text-sm text-[var(--red)]" role="alert">{error}</p>}{status === "saved" && <p className="flex items-center gap-2 text-sm text-[var(--green)]"><CheckCircle2 size={16} />Email authorized.</p>}<button disabled={status === "saving"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--green)] px-4 py-3 font-semibold text-white hover:bg-[#067252] disabled:opacity-70"><MailPlus size={17} />{status === "saving" ? "Saving…" : "Authorize email"}</button></form><div className="mt-6 border-t border-[var(--line)] pt-5"><p className="mb-3 text-sm font-semibold">Approved emails ({authorizedEmails.length})</p><div className="max-h-48 space-y-2 overflow-y-auto pr-1">{authorizedEmails.map((entry) => <div key={entry.email} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm"><span className="min-w-0 truncate">{entry.email}</span><span className="shrink-0 rounded-full bg-[var(--mint)] px-2 py-0.5 text-xs font-semibold text-[var(--green)]">{entry.role}</span></div>)}</div></div></aside>
      </section>
      <section className="mt-8 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-7"><div className="mb-6"><p className="text-sm font-semibold text-[var(--green)]">Latest activity</p><h2 className="mt-1 text-2xl font-bold tracking-[-.04em]">Recent model events</h2></div>{dashboard.recent.length ? <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="border-b border-[var(--line)] text-xs uppercase tracking-wide text-[var(--muted)]"><tr><th className="pb-3">When</th><th className="pb-3">User</th><th className="pb-3">Request</th><th className="pb-3">Model</th><th className="pb-3">Latency</th><th className="pb-3 text-right">Estimate</th></tr></thead><tbody>{dashboard.recent.map((event) => <tr key={event.id} className="border-b border-[var(--line)] last:border-0"><td className="py-4 whitespace-nowrap">{dateTime.format(new Date(event.created_at))}</td><td className="py-4 max-w-44 truncate">{event.user_email}</td><td className="py-4 capitalize">{event.request_type}</td><td className="py-4">{event.model}</td><td className="py-4">{event.latency_ms ? `${(event.latency_ms / 1000).toFixed(1)}s` : "—"}</td><td className="py-4 text-right font-semibold">{money.format(Number(event.estimated_cost_usd ?? 0))}</td></tr>)}</tbody></table></div> : <p className="rounded-2xl bg-slate-50 p-5 text-sm text-[var(--muted)]">There are no usage events to show yet.</p>}</section>
    </div>
  </main>;
}
