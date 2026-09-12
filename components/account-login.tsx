"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { LogoMark } from "@/components/icons";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AccountLogin({ message, configurationError }: { message?: string; configurationError?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setStatus("sending");
    try {
      const { error: authError } = await getSupabaseBrowserClient().auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/` },
      });
      if (authError) throw authError;
      setStatus("sent");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't send the sign-in link. Please try again.");
      setStatus("idle");
    }
  }

  return <main className="mesh min-h-screen px-5 py-8 sm:grid sm:place-items-center">
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass mx-auto w-full max-w-md rounded-[2rem] p-7 sm:p-10">
      <div className="mb-10 flex items-center gap-3"><LogoMark className="h-9 w-9 text-[var(--green)]" /><span className="font-bold tracking-[-.04em]">Speak Like a Native</span></div>
      <div className="mb-8">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--mint)] text-[var(--green)]"><Mail size={22} /></div>
        <h1 className="text-3xl font-bold tracking-[-.055em]">Sign in to practice.</h1>
        <p className="mt-3 leading-6 text-[var(--muted)]">Enter an approved email and we’ll send you a secure, passwordless sign-in link.</p>
      </div>
      {configurationError ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800" role="alert">{configurationError}</p> : status === "sent" ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900"><CheckCircle2 className="mb-2 text-[var(--green)]" size={21} /><strong>Check your email.</strong><br />Open the link we sent to <strong>{email}</strong>, then come straight back to your practice space.</div> : <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold" htmlFor="email">Email address</label>
        <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required placeholder="you@example.com" className="w-full rounded-xl border border-[var(--line)] bg-white/80 px-4 py-3.5 outline-none transition focus:border-[var(--green)] focus:ring-4 focus:ring-emerald-100 dark:bg-slate-900" />
        {message && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="status">{message}</p>}
        {error && <p className="text-sm text-[var(--red)]" role="alert">{error}</p>}
        <button disabled={status === "sending"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--green)] px-5 py-3.5 font-semibold text-white transition hover:bg-[#067252] disabled:opacity-70">{status === "sending" ? "Sending…" : "Email me a sign-in link"}<ArrowRight size={18} /></button>
      </form>}
      <p className="mt-7 flex gap-2 text-xs leading-5 text-[var(--muted)]"><ShieldCheck className="mt-0.5 shrink-0 text-[var(--green)]" size={15} />An account only unlocks the app after an administrator approves its email address.</p>
    </motion.section>
  </main>;
}
