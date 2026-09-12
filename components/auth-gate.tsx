"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { LogoMark } from "./icons";

export function AuthGate() {
  const [password, setPassword] = useState(""); const [show, setShow] = useState(false); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); setError(""); try { const result = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ password }) }); const body = await result.json(); if (!result.ok) throw new Error(body.error); window.location.assign("/"); } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); } finally { setLoading(false); } }
  return <main className="mesh min-h-screen px-5 py-8 sm:grid sm:place-items-center"><motion.section initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="glass mx-auto w-full max-w-md rounded-[2rem] p-7 sm:p-10">
    <div className="mb-10 flex items-center gap-3"><LogoMark className="h-9 w-9 text-[var(--green)]"/><span className="font-bold tracking-[-.04em]">Speak Like a Native</span></div>
    <div className="mb-8"><div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--mint)] text-[var(--green)]"><LockKeyhole size={22}/></div><h1 className="text-3xl font-bold tracking-[-.055em]">Welcome back.</h1><p className="mt-3 leading-6 text-[var(--muted)]">Enter the shared password to continue to your account.</p></div>
    <form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold" htmlFor="password">Shared password</label><div className="relative"><input id="password" value={password} onChange={e=>setPassword(e.target.value)} type={show?"text":"password"} autoComplete="current-password" required className="w-full rounded-xl border border-[var(--line)] bg-white/80 px-4 py-3.5 pr-12 outline-none transition focus:border-[var(--green)] focus:ring-4 focus:ring-emerald-100 dark:bg-slate-900"/><button type="button" onClick={()=>setShow(!show)} aria-label={show?"Hide password":"Show password"} className="absolute right-3 top-3 text-[var(--muted)]">{show?<EyeOff size={20}/>:<Eye size={20}/>}</button></div><AnimatePresence>{error&&<motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} className="text-sm text-[var(--red)]" role="alert">{error}</motion.p>}</AnimatePresence><button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--green)] px-5 py-3.5 font-semibold text-white transition hover:bg-[#067252] disabled:opacity-70">{loading?"Checking…":"Continue"}<ArrowRight size={18}/></button></form>
    <p className="mt-7 text-center text-xs leading-5 text-[var(--muted)]">Your recording is processed securely and is never stored by this app.</p>
  </motion.section></main>;
}
